import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();

const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const response = await axios.get("https://secrets-api.appbrewery.com/random");
  res.render("index.ejs", {
    secret: response.data.secret,
    user: response.data.username,
  });
});

app.listen(port, () => console.log(`App is running at ${port}.`));
