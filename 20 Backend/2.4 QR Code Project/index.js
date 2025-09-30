import inquirer from "inquirer";
import qr from "qr-image";
import fs from "fs";
/*  1. Use the inquirer npm package to get user input.
    2. Use the qr-image npm package to turn the user entered URL into a QR code image.
    3. Create a txt file to save the user input using the native fs node module.    */

inquirer
  .prompt([
    {
      message: "Enter your URL: ",
      name: "URL",
    },
  ])
  .then((answers) => {
    fs.writeFile("URL.txt", answers.URL, function (err) {
      if (err) {
        console.log("Error writing URL.txt file." + err);
      }
    });
    var qr_img = qr.image(answers.URL, { type: "png" }); // This generate a readable stream using the url
    const writable = fs.createWriteStream("out.png"); // Generates a writable stream to the file out.png
    qr_img.pipe(writable); // Pipes both the streams, reads the readable stream and writes it to writable stream thus creating a QR-code in out.png
    // writable stream events
    writable.on("finish", () => {
      console.log("QR stored in out.png");
    });

    writable.on("error", (err) => {
      console.error("Error writing file:", err);
    });
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
      console.log("Unable to render question.");
    } else {
      // Something else went wrong
      console.log("Something else went wrong." + error);
    }
  });
