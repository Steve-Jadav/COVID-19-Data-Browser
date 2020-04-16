/* Use this file to generate document indexes 
These indexes not to be loaded on the server in order to
faciliate searching through the documents. 
Run node indexer.js in this directory to generate the index json files. */

'use strict';

var path = require('path');
var fs = require('fs');
var lunr = require('lunr');

var directoryPaths = [ path.join(__dirname, "biorxiv_medrxiv/biorxiv_medrxiv"),
                      path.join(__dirname, "noncomm_use_subset/noncomm_use_subset"),
                      path.join(__dirname, "pmc_custom_license/pmc_custom_license") ];


var indexPaths = [ "biorxiv_medrxiv/biorxiv_medrxiv_IDX.json",
                  "noncomm_use_subset/noncomm_use_subset_IDX.json",
                  "pmc_custom_license/pmc_custom_license_IDX.json" ];


var loc = 0;

directoryPaths.forEach(function (directoryPath) {

  var documents = [];
  var fileCount = 0;

  fs.readdirSync(directoryPath).forEach(file => {

    fileCount += 1;

    var text = "";
    let rawdata = fs.readFileSync(directoryPath + "/" + file);
    let resultdata = JSON.parse(rawdata);

    for (var i = 0; i < resultdata['body_text'].length; i++) {
      text += resultdata['body_text'][i]['text'];
    }

    var currentDoc = { "name": file.split(".")[0], "text": text };
    documents.push(currentDoc);

  });

  var idx = lunr(function () {
    this.ref('name')
    this.field('text')

    documents.forEach(function (doc) {
      this.add(doc)
    }, this)
  });


  var serializedIdx = JSON.stringify(idx);
  fs.writeFileSync(indexPaths[loc], serializedIdx, (err) => {
    if (err == true) throw err;
  });

  loc += 1;

  console.log("Indexed " + fileCount + " files...");

});
