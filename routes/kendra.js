var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;

router.get("/", function(req, res, next) {
  var result;
  var query = req.query.question;

  var process = spawn('python3', ['routes/kendra_script.py', query] );
  process.stdout.on('data', function(data) {
    console.log("Establishing connection with AWS Kendra index...");
    result = data.toString();
    result = JSON.parse(result);
    console.log("Request successfully completed.")
    console.log("Sending results to the browser...")
    res.send(result);
  });
});


module.exports = router;
