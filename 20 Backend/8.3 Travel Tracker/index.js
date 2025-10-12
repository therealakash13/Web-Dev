import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const client = new pg.Client({
  user: "postgres",
  password: "1234",
  host: "localhost",
  port: 5432,
  database: "world",
});

client.connect();

app.get("/", async (req, res) => {
  const result = await client.query(
    "SELECT country_code FROM visited_countries"
  );
  let countries = [];
  result.rows.forEach((code) => countries.push(code.country_code));
  res.render("index.ejs", { countries: countries, total: result.rowCount });
});

app.post("/add", async (req, res) => {
  const country = req.body.country
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  const result = await client.query(
    `SELECT country_code FROM countries WHERE country_name = '${country}'`
  );
  if (result.rows.length !== 0) {
    await client.query(
      "INSERT INTO visited_countries(country_code) VALUES($1)",
      [`${result.rows[0].country_code}`]
    );
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
