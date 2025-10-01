import express, { application } from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

const port = 3000;
const host = "localhost";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/check", function (req, res) {
  const password = req.body.password;

  if (password === "ILoveProgramming") {
    res.sendFile(__dirname + "/public/secret.html");
  } else {
    res.redirect("/");
  }
});

app.listen(port, function () {
  console.log(`Server is running at http://${host}:${port}.`);
});
