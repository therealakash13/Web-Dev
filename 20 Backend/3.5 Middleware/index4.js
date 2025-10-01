import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
const host = "localhost";
let bandName = "";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/submit", function (req, res) {
  bandName = `${req.body.street} ${req.body.pet}`;
  res.send(`Your band name is: ${bandName}`);
});

app.listen(port, () => {
  console.log(`Server running at http://${host}:${port}.`);
});
