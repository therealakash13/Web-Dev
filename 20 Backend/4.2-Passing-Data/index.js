import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const host = "localhost";

let name = "";
let numbersOfLetter;

app.use(bodyParser.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//   res.locals.name = name;
//   next();
// });

app.get("/", (req, res) => {
  res.render("index.ejs", { num: numbersOfLetter });
});

app.post("/submit", (req, res) => {
  name = req.body.fName + " " + req.body.lName;
  numbersOfLetter = name.length - 1;
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running at http://${host}:${port}.`);
});
