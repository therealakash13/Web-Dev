import express from "express";
const app = express();

const port = 3000;
const hostname = "localhost";

app.get("/", function (req, res) {
  res.send("Hello from server!");
});

app.listen(port, function () {
  console.log(`Server is running at http://${hostname}:${port}.`);
});
