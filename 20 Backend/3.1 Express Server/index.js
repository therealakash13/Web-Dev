import express from "express";
const app = express();
const port = 3000;
const hostname = "localhost";

app.listen(port, () => {
  console.log(`Server running at https://${hostname}:${port}/`);
});
