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

async function fetchVisited() {
  try {
    let countries = [];
    const result = await client.query(
      "SELECT country_code FROM visited_countries"
    );
    result.rows.forEach((c) => countries.push(c.country_code));
    return countries;
  } catch (err) {
    console.error("Unable to fetch from db", err);
  }
}

app.get("/", async (req, res) => {
  const countries = await fetchVisited();
  res.render("index.ejs", { countries: countries, total: countries.length });
});

app.post("/add", async (req, res) => {
  const country_name = req.body.country.trim().toLowerCase();
  try {
    const result = await client.query(
      `SELECT country_code FROM countries WHERE (country_name) = '${country_name}'`
    );

    if (result.rows.length !== 0) {
      try {
        await client.query(
          "INSERT INTO visited_countries(country_code) VALUES($1)",
          [`${result.rows[0].country_code}`]
        );
        const countries = await fetchVisited();
        res.render("index.ejs", {
          countries: countries,
          total: countries.length,
        });
      } catch (error) {
        const countries = await fetchVisited();
        res.render("index.ejs", {
          countries: countries,
          total: countries.length,
          error: "Unable to add country. Already Added!",
        });
      }
    }
  } catch (error) {
    const countries = await fetchVisited();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Unable to find country. Try Again!",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
