// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
const { exec } = require("child_process");

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('views'));

// listen for requests :)
var listener = app.listen(5676, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  exec("firefox localhost:5676", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
});
