import express from "express";
const app = express();
const port = 3000;
const host = "localhost";

app.get("/", (req, res) => {
  res.send("<h1>Home Page</h1>");
});

app.post("/register", (req, res) => {
  //Do something with the data
  res.sendStatus(201);
});

app.put("/user/akash", (req, res) => {
  res.sendStatus(200);
});

app.patch("/user/akash", (req, res) => {
  res.sendStatus(200);
});

app.delete("/user/akash", (req, res) => {
  //Deleting
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server running at http://${host}:${port}.`);
});

// Tested on Postman and each request returned right status code.