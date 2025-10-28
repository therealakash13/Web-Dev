import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;
const saltRounds = 10;

const client = new pg.Pool({
  connectionString: process.env.DB_URI,
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
    const response = await client.query(
      `SELECT email FROM users WHERE email = $1`,
      [username]
    );

    if (response.rowCount > 0) throw new Error("User already exists.");

    const hashPassword = await bcrypt.hash(password, saltRounds);

    await client.query(`INSERT INTO users (email,password) VALUES($1,$2)`, [
      username,
      hashPassword,
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
    const response = await client.query(
      `SELECT * FROM users WHERE email = $1`,
      [username]
    );

    if (response.rowCount == 0)
      throw new Error("User not found with this username.");

    const user = response.rows[0];
    const isSame = await bcrypt.compare(password, user.password);

    if (!isSame) throw new Error("Password is incorrect.");
    return res.render("secrets.ejs");
  } catch (error) {
    console.log({ error });
    return res.redirect("/login");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
