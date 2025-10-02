import express from "express";
import ejs from "ejs";

const port = 3000;
const host = "localhost";

const app = express();
const day = new Date();
const today = day.getDay();
let t = "a weekday";
let adv = "work hard.";

app.get("/", function (req, res) {
  if (today === 0 || today === 6) {
    t = "the weekend";
    adv = "have fun";
  } else {
    t = "a weekday";
    adv = "work hard";
  }
  res.render("index.ejs", { d: t, advice: adv });
});

app.listen(port, function () {
  console.log(`Server is running at http://${host}:${port}.`);
});
