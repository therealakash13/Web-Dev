import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
const port = 3000;
const host = "localhost";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("index.ejs");
});

app.get("/create", function (req, res) {
  res.render("create.ejs");
});

app.post("/create", function (req, res) {
  console.log(req.body);
  let newData = req.body;
  newData.time = new Date().toLocaleString();

  fs.readFile("data/data.json", "utf8", function callback(err, data) {
    if (err) {
      console.log("Error reading file. Error:", err);
      res.render("<h1>Error reading file.</h1>");
      return res.redirect("/");
    } else {
      let jsonArray = [];

      if (data) {
        jsonArray = JSON.parse(data);
        const newId =
          jsonArray.length > 0 ? jsonArray[jsonArray.length - 1].id + 1 : 1;
        newData.id = newId;
      } else {
        console.log("Error parsing data file. Starting anew.");
        jsonArray = [];
      }

      jsonArray.push(newData);

      fs.writeFile(
        "data/data.json",
        JSON.stringify(jsonArray, null, 2),
        "utf8",
        function (err) {
          if (err) {
            console.log(`Error writing data file.`);
          }
          console.log("File written successfully.");
          return res.redirect("/blogs");
        }
      );
    }
  });
});

app.get("/blogs", function (req, res) {
  fs.readFile("data/data.json", "utf8", function (err, data) {
    if (err) {
      console.log("Error reading data file.");
      return res.render("<h2>Error reading file.</h2>");
    }

    let cards = [];
    let message = false;
    if (data.trim() !== "") {
      cards = JSON.parse(data);
      message = true;
    } else {
      console.log("Invalid JSON or empty file detected.");
      message = false;
    }
    return res.render("blogs.ejs", { cards: cards, message: message });
  });
});

app.get("/blogs/:id", function (req, res) {
  fs.readFile("data/data.json", "utf8", function callback(err, data) {
    if (err) {
      console.log("Error reading file. Error:", err);
      res.render("<h1>Error reading file.</h1>");
      return res.redirect("/");
    } else {
      let jsonArray = [];

      if (data) {
        jsonArray = JSON.parse(data);
        const jData = jsonArray[req.params.id - 1];
        return res.render("blog.ejs", { data: jData });
      } else {
        console.log("Error parsing data file. Starting anew.");
        jsonArray = [];
        res.send("<h2>An Error occurred.</h2>");
        return res.redirect("/blogs");
      }
    }
  });
});

app.post("/blogs/:id", function (req, res) {
  const blogId = parseInt(req.params.id);

  let newData = req.body;
  newData.time = new Date().toLocaleString();

  fs.readFile("data/data.json", "utf8", function callback(err, data) {
    if (err) {
      console.log("Error reading file. Error:", err);
      res.render("<h1>Error reading file.</h1>");
      return res.redirect("/");
    } else {
      let jsonArray = [];

      if (data) {
        jsonArray = JSON.parse(data);
      } else {
        console.log("Error parsing data file. Starting anew.");
        jsonArray = [];
      }

      const blog = jsonArray.find((blog) => blog.id === blogId);
      if (blog === -1) {
        return res.render("<h2>Unable to find blog...</h2>");
      } else {
        blog.title = newData.title;
        blog.content = newData.content;
        blog.time = new Date().toLocaleString();
      }

      fs.writeFile(
        "data/data.json",
        JSON.stringify(jsonArray, null, 2),
        "utf8",
        function (err) {
          if (err) {
            console.log(`Error updating data file.`);
          }
          console.log("File updated successfully.");
          res.render("<h2>Updating...</h2>");
          return res.redirect("/blogs");
        }
      );
    }
  });
});

app.get("/blogs/:id/delete", function (req, res) {
  const idToDelete = parseInt(req.params.id);

  fs.readFile("data/data.json", "utf8", function callback(err, data) {
    if (err) {
      console.log("Error reading file. Error:", err);
      res.render("<h1>Error reading file...</h1>");
      return res.redirect("/");
    } else {
      let jsonArray = [];

      if (data) {
        jsonArray = JSON.parse(data);
      } else {
        console.log("Error parsing data file. Unable to delete...");
        return res.redirect("/blogs");
      }

      let index = jsonArray.findIndex((blog) => blog.id === idToDelete);
      if (index !== -1) {
        jsonArray.splice(index, 1); // removes that item at index
      }

      fs.writeFile(
        "data/data.json",
        JSON.stringify(jsonArray, null, 2),
        "utf8",
        function (err) {
          if (err) {
            console.log(`Error deleting data...`);
          }
          console.log("Entry deleted successfully.");
          res.render("<h2>Deleting...</h2>");
          return res.redirect("/blogs");
        }
      );
    }
  });
});

app.get("/about", function (req, res) {
  return res.render("about.ejs");
});

app.get("/contact", function (req, res) {
  return res.render("contact.ejs");
});

app.post("/contact", function (req, res) {
  console.log(req.body); 
  
  // Do something with it

  return res.redirect("/");
});

app.listen(port, function () {
  console.log(`Server is running at http://${host}:${port}.`);
});
