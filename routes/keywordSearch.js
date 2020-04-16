var express = require('express');
var lunr = require('lunr');
var router = express.Router();

// Inverted Index for documents in the corpus
console.log("Reading index files");
var inverted_index = [ require('./../public/data/biorxiv_medrxiv/biorxiv_medrxiv_IDX.json'),
             require('./../public/data/pmc_custom_license/pmc_custom_license_IDX.json'),
             require('./../public/data/noncomm_use_subset/noncomm_use_subset_IDX.json'),
             require('./../public/data/comm_use_subset/comm_use_subset_IDX.json') ];

var idx = [];
idx[0] = lunr.Index.load(inverted_index[0]);
idx[1] = lunr.Index.load(inverted_index[1]);
idx[2] = lunr.Index.load(inverted_index[2]);
idx[3] = lunr.Index.load(inverted_index[3]);

/* GET the best match files */
router.get('/', function(req, res, next) {

  var searchTerms = req.query.searchTerms;
  var bestMatchFiles = [];   // Holds the top 10 relevant files from the file list

  for (var i = 0; i < inverted_index.length; i++) {
    var idx = lunr.Index.load(inverted_index[i]);
    var result = idx[i].search(searchTerms);
    result.slice(0, 25).forEach(function (data) {
      bestMatchFiles.push(data.ref);
    });
  }

  res.send(bestMatchFiles);

});

module.exports = router;
