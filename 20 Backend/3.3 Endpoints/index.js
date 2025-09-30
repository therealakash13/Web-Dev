import express from "express";
const app = express();
const port = 3000;
const hostname = "localhost";

app.get("/", function (req, res) {
  res.send("<h1>Home Page</h1>");
});
app.get("/about", function (req, res) {
  res.send("<h1>About Page</h1>");
});
app.get("/contact", function (req, res) {
  res.send("<h1>Contact Page</h1>");
});

app.listen(port, function () {
  console.log(`Server is running at http://${hostname}:${port}.`);
});
