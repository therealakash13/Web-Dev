import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT;

const db = new pg.Client({
  connectionString: `${process.env.DB_URL}`,
  ssl: { rejectUnauthorized: false },
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

async function checkVisisted(uid) {
  const result = await db.query(
    "SELECT iso_2_code FROM visited_countries WHERE user_id = $1",
    [uid]
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.iso_2_code);
  });
  return countries;
}

async function fetchUsers() {
  const result = await db.query("SELECT * FROM users");
  return result.rows;
}

async function fetchColor(uid) {
  const result = await db.query('SELECT color FROM users WHERE id = $1',[uid]);
  return result.rows[0].color  
}

app.get("/", async (req, res) => {
  const users = await fetchUsers();
  const color = await fetchColor(currentUserId);
  const countries = await checkVisisted(currentUserId);  

  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: color,
  });
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT * FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );
    const data = result.rows[0];
    console.log({data});
    
    try {
      await db.query(
        "INSERT INTO visited_countries (country_name, iso_2_code, iso_3_code, numeric_code, iso_3166_2, user_id) VALUES ($1,$2,$3,$4,$5,$6)",
        [
          data.country_name,
          data.iso_2_code,
          data.iso_3_code,
          data.numeric_code,
          data.iso_3166_2,
          currentUserId,
        ]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/user", async (req, res) => {
  if (req.body.user) {
    currentUserId = req.body.user;
    return res.redirect("/");
  } else if(req.body.add){
    return res.redirect(`/${req.body.add}`);
  }
});

app.get('/new', (req, res)=>{
  res.render('new.ejs')
})

app.post("/new", async (req, res) => {    
  const userCreated = await db.query(`INSERT INTO users (name, color) VALUES($1, $2) RETURNING name, color`,[req.body.name, req.body.color]);
  console.log(userCreated.rows[0]);
  return res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
