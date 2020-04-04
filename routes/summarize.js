var express = require('express');
var fs = require('fs');
var router = express.Router();

// Summarization libraries
var tr = require('textrank');
var Tokenizer = require('sentence-tokenizer');
var tokenizer = new Tokenizer('Chuck');

// Key-words and Key-Phrases extraction
var vfile = require('to-vfile');
var retext = require('retext');
var pos = require('retext-pos');
var keywords = require('retext-keywords');
var toString = require('nlcst-to-string');
var dict = {};


/* GET the summarized text. */
router.get('/', function(req, res, next) {

  dict["keywords"] = [];
  dict["keyphrases"] = [];
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

    fileName = "public/data/biorxiv_medrxiv/biorxiv_medrxiv/" + sha + ".json";

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
        console.log("File exists in comm");
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

    // Prepare the summarized text
    var abstractText = "";
    var bodyText = "";
    var settings = { extractAmount: 6 };
    var resultDictionary = {
      'abstract': [],
      'body': [],
    };


    // Fetch the abstract of the paper
    for (var i = 0; i < resultdata['abstract'].length; i++) {
      abstractText += resultdata['abstract'][i]['text'];
    }

    if (abstractText == "") {
      resultDictionary['abstract'] = [];
    }
    else {
      try {
        var textRank = new tr.TextRank(abstractText, settings);
        tokenizer.setEntry(textRank.summarizedArticle);
        resultDictionary['abstract'] = tokenizer.getSentences();
      } catch (error) { console.log ("Size of the abstract insufficient to compute a summary. Aborting..."); }
    }



    // Fetch the body of the paper
    for (var i = 0; i < resultdata['body_text'].length; i++) {
      bodyText += resultdata['body_text'][i]['text'];
    }
    var textRank_ = new tr.TextRank(bodyText, settings);
    tokenizer.setEntry(textRank_.summarizedArticle);
    resultDictionary['body'] = tokenizer.getSentences();


    // Keywords and Key-Phrases
    fs.writeFileSync('temp.txt', bodyText, (err) => {
      if (err == true) { throw err; }
    });

    retext().use(pos).use(keywords).process(vfile.readSync('temp.txt'), done);

    resultDictionary['keywords'] = dict['keywords'];
    resultDictionary['keyphrases'] = dict['keyphrases'];

    res.send(resultDictionary);
  }
});

function done(err, file) {

  if (err == true) { throw err; }

  file.data.keywords.forEach(function (keyword) {
    dict["keywords"].push(toString(keyword.matches[0].node));
  });

  file.data.keyphrases.forEach(function(phrase) {
    dict["keyphrases"].push(phrase.matches[0].nodes.map(stringify).join(''));
    function stringify(value) {
      return toString(value);
    }
  });

  return dict;
}


module.exports = router;
