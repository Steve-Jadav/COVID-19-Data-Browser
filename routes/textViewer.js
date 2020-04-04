var express = require("express");
var fs = require("fs");
var router = express.Router();


/* GET the entire text of the paper from the database */
router.get("/", function(req, res, next) {

  var sha = req.query.SHA;
  var source = req.query.Source;
  var fileFound = false;
  var fileName;
  var resultdata = "";

  if (source == "CZI") {
    // Search in the comm_use_subset and the noncomm_use_subset folder.

    fileName = "public/data/noncomm_use_subset/noncomm_use_subset/" + sha + ".json";

    // First search for the file in noncomm_use_subset directory

    try {
      if (fs.existsSync(fileName)) {
        fileFound = true;
        let rawdata = fs.readFileSync(fileName);
        resultdata = JSON.parse(rawdata);
      }
    } catch (err) {
      console.error(err);
    }


    // If not found in the noncomm_use_subset, then search the comm_use_subset directory
    if (fileFound == false) {
      fileName = "public/data/comm_use_subset/comm_use_subset/" + sha + ".json";

      try {
        if (fs.existsSync(fileName)) {
          fileFound = true;
          let rawdata = fs.readFileSync(fileName);
          resultdata = JSON.parse(rawdata);
        }
      } catch (err) {
        res.send(resultdata);
      }

    }

  }

  else if (source == "biorxiv" || source == "medrxiv") {
    // Search from the biorxiv_medrixiv folder

    fileName = "public/data/biorxiv_medrixiv/biorxiv_medrixiv/" + sha + ".json";

    try {
      if (fs.existsSync(fileName)) {
        fileFound = true;
        let rawdata = fs.readFileSync(fileName);
        resultdata = JSON.parse(rawdata);
      }
    } catch (err) {
      console.error(err);
    }

  }

  else if (source == "PMC") {
    // Search from the pmc_custom_license folder.

    fileName = "public/data/pmc_custom_license/pmc_custom_license/" + sha + ".json";

    try {
      if (fs.existsSync(fileName)) {
        fileFound = true;
        let rawdata = fs.readFileSync(fileName);
        resultdata = JSON.parse(rawdata);
      }
    } catch (err) {
      console.error(err);
    }

  }

  else {
    res.send(resultdata);
  }

  if (resultdata == "") { res.send (resultdata); }

  else {
    var abstractText = "";
    var bodyText = "";
    var resultDictionary = {
      'abstract': [],
      'body': [],
    };

    // Fetch the abstract of the paper
    for (var i = 0; i < resultdata['abstract'].length; i++) {
      resultDictionary['abstract'].push(resultdata['abstract'][i]['text']);
    }


    // Fetch the body of the paper
    for (var i = 0; i < resultdata['body_text'].length; i++) {
      resultDictionary['body'].push(resultdata['body_text'][i]['text']);
    }


    res.send(resultDictionary);
  }

});

module.exports = router;
