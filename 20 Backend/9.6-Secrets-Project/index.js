import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import env from "dotenv";
import axios from "axios";

const server = express();
env.config();
const port = Number(process.env.PORT);
const saltRounds = Number(process.env.SALT_ROUND);

// Google OAuth URLs
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

server.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static("public"));

const db = new pg.Client({
  connectionString: process.env.DB_URI,
});
db.connect();

const authMiddleware = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  next();
};

server.get("/", (req, res) => {
  res.render("home.ejs");
});

server.get("/login", (req, res) => {
  res.render("login.ejs");
});

server.get("/register", (req, res) => {
  res.render("register.ejs");
});

server.get("/secrets", authMiddleware, (req, res) => {
  return res.render("secrets.ejs", { secret: req.session.user.secret });
});

//TODO: Add a get route for the submit button
//Think about how the logic should work with authentication.
server.get("/submit", authMiddleware, (req, res) => {
  return res.render("submit.ejs");
});

// Route: Redirect user to Google
server.get("/auth/google", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
});

// Route: Callback from Google
server.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;

  try {
    // 1. Exchange code for access token
    const tokenRes = await axios.post(GOOGLE_TOKEN_URL, {
      code,
      client_id: process.env.GOOGLE_ID,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URI,
      grant_type: "authorization_code",
    });

    const accessToken = tokenRes.data.access_token;

    // 2. Get user info
    const userRes = await axios.get(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { id, name, email, picture } = userRes.data;

    // 3. Insert/update user info to db
    const response = await db.query(
      ` INSERT INTO users (email, password) 
        VALUES ($1, $2) 
        ON CONFLICT (email)
        DO UPDATE SET password = EXCLUDED.password
        RETURNING *`,
      [email, "google_password"]
    );

    const user = response.rows[0];

    // 4. Store user in session
    req.session.user = user;
    res.redirect("/secrets");
  } catch (err) {
    console.error(err);
    res.send("Error during authentication");
  }
});

// Route: Logout
server.get("/logout", authMiddleware, (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

server.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
      username,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;
      if (storedHashedPassword === "google_password") {
        req.session.user = user;
        return res.redirect("/secrets");
      }
      bcrypt.compare(password, storedHashedPassword, (err, valid) => {
        if (err) {
          throw new Error("Error comparing passwords...");
        } else {
          if (valid) {
            req.session.user = user;
            return res.redirect("/secrets");
          } else {
            console.log("Incorrect Password...");
            return res.redirect("/login");
          }
        }
      });
    } else {
      console.log("No such user exists register first...");
      return res.redirect("/register");
    }
  } catch (err) {
    console.log(err);
    return res.redirect("/login");
  }
});

server.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      console.log("User already exists...");
      res.redirect("/login");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.session.user = user;
          res.redirect("/secrets");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

//TODO: Create the post route for submit.
//Handle the submitted data and add it to the database
server.post("/submit", authMiddleware, async (req, res) => {
  const user = req.session.user;
  const secret = req.body.secret;

  if (!secret) {
    return res.redirect("/secrets");
  }
  try {
    if (secret && secret.trim() !== "") {
      const upsert = await db.query(
        `UPDATE users SET secret = $1 WHERE id = $2 RETURNING *`,
        [secret, user.id]
      );
      if (upsert.rows.length > 0) {
        req.session.user = upsert.rows[0];
      }
    }
    res.redirect("/secrets");
  } catch (error) {
    console.log(error);
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
