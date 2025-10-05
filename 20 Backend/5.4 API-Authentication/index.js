import express, { response } from "express";
import axios from "axios";

const app = express();
const port = 3000;

const username = "akash";
const password = "1234";
const APIKey = "a50bed5b-985a-4de1-a23a-29f5fdd8c15c";
const bearerToken = "d5af4cd7-9a60-4623-a260-6e8cbfbae6d1";

const api = axios.create({
  baseURL: "https://secrets-api.appbrewery.com",
});

app.get("/", (req, res) => {
  res.render("index.ejs", { content: "API Response." });
});

app.get("/noAuth", (req, res) => {
  api
    .get("/random")
    .then((response) =>
      res.render("index.ejs", { content: JSON.stringify(response.data) })
    )
    .catch((err) => console.log(err));
});

app.get("/basicAuth", (req, res) => {
  const token = btoa(username + ":" + password);
  api
    .get("/all", {
      headers: { Authorization: `Basic ${token}`, params: { page: 2 } },
    })
    .then((response) =>
      res.render("index.ejs", { content: JSON.stringify(response.data) })
    )
    .catch((err) => console.log(err));
});

app.get("/apiKey", (req, res) => {
  api
    .get("/filter", {
      params: {
        score: 5,
        apiKey: APIKey,
      },
    })
    .then((response) =>
      res.render("index.ejs", { content: JSON.stringify(response.data) })
    )
    .catch((err) => console.log(err));
});

app.get("/bearerToken", (req, res) => {
  api
    .get("/secrets/42", {
      headers: { Authorization: `Bearer ${bearerToken}` },
    })
    .then((response) =>
      res.render("index.ejs", { content: JSON.stringify(response.data) })
    )
    .catch((err) => console.log(err));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
