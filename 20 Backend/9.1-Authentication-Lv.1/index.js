import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const client = new pg.Pool({
  connectionString: `postgresql://postgres:1234@localhost:5432/secrets`,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await client.query(
      `SELECT email FROM users WHERE email = $1`,
      [username]
    );

    if (existingUser.rowCount > 0) throw new Error("User already exists.");

    await client.query(`INSERT INTO users (email,password) VALUES($1,$2)`, [
      username,
      password,
    ]);

    return res.render("secrets.ejs");
  } catch (error) {
    console.log({ error });
    return res.redirect("/register");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await client.query(`SELECT * FROM users WHERE email = $1`, [
      username,
    ]);

    if (user.rowCount == 0)
      throw new Error("User not found with this username.");
    
    if (user.rows[0].password !== password)
      throw new Error("Password is incorrect.");

    return res.render("secrets.ejs");
  } catch (error) {
    console.log({ error });
    return res.redirect("/login");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
