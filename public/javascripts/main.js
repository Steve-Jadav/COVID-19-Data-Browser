$(document).ready(function () {

  $("#table_spinner").hide();

  $('#headerVideoLink').magnificPopup({
    type:'inline',
    midClick: true // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
  });

  // Create the datatable from the data.
  var table = $("#datatable").DataTable({
    "deferRender": true,
    "pageLength": 25,
    "dom": 'Bfrtip',
    "buttons": [
      { extend: 'csv', className: "csvButton", title: "Articles", exportOptions: { columns: [4, 1, 2, 3] }, customize: function(csv) {var csvRows = csv.split('\n'); csvRows[0] = csvRows[0].replace('""', "SHA"); return csvRows.join('\n'); } },
      { extend: 'excel', className: "excelButton", title: "Articles", exportOptions: { columns: [4, 1, 2, 3] } } ],
    "ajax": "data/datatable.txt",
    "columns": [
      {
        "className": "details-control",
        "orderable": false,
        "data": null,
        "defaultContent": ""
      },
      { "data": "Title" },
      { "data": "Authors" },
      { "data": "Journal" },
      { "data": "SHA" }
    ],
    "columnDefs": [
      { "width": "40%", "targets": 1 },
      { "width": "20%", "targets": 3 },
      { "targets": [4], "visible": false, "searchable": true },
      { "targets": [0], "orderable": false, "searchable": false }
    ]
  });



  $('#searchButton').on("click", function () {

    $("#table_spinner").show();
    var docKeywords = document.getElementById("searchText");
    var parameters = { "searchTerms": docKeywords.value };

    if (docKeywords.value != "") {

      // Get the sha of the relevant files here using ajax call
      $.get("/keywordSearch", parameters, function (data) {

        $("#table_spinner").hide();
        var sha = data.join("|");
        table.columns(4).search(sha, true, false).draw();

      });

    }
    else {
      $("#table_spinner").hide();
      table.columns().search('').draw();
    }

  });


  // Event listener for opening and closing details
  $('#datatable tbody').on('click', 'td.details-control', function () {

    var tr = $(this).closest('tr');
    var row = table.row(tr);

    var p = table.rows( { page: 'current' }).nodes();

    // Close all the rows except the current one.
    for (var i = 0; i < p.length; i++) {
      if (p[i] != row.node()) {
        var temp_tr = $(p[i]).closest('tr');
        var temp_row = table.row(temp_tr);
          if (temp_row.child.isShown()) {
            temp_row.child.hide();
            temp_tr.removeClass('shown');
          }
      }
    }


    if ( row.child.isShown() ) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
    }

    else {

        // Open this row
        row.child(format(row.data())).show();
        tr.addClass('shown');
        $('#spinner_1').hide();
        $('#spinner_2').hide();

        var smallTable = document.getElementById("small_table");
        var viewButton = document.getElementById("view_text");
        var summarizeButton = document.getElementById("summarize_text");
        var keywords = document.getElementById("summary_keywords");
        var parameters = { "SHA": row.data().SHA,
                           "Source": row.data().Source };



        viewButton.addEventListener("click", function(){

          $('#spinner_1').show();
          $('#spinner_2').show();

          // AJAX request to get the entire text of the required file
          $.get("/textViewer", parameters, function(data) {

            $('#spinner_1').hide();
            $('#spinner_2').hide();

            if (data == "") {
              $("#textview_abstract").html("<center>File not available in the corpus</center>");
              $("#textview_body").html("<center>File not available in the corpus</center>");
            }

            else {

              var abstractList = '<ul>';
              var bodyList = '<ul>';

              for (var i = 0; i < data['abstract'].length; i++) {
                abstractList += '<li>' + data['abstract'][i] + '</li>';
              }
              abstractList += '</ul>';

              for (var i = 0; i < data['body'].length; i++) {
                bodyList += '<li>' + data['body'][i] + '</li>';
              }
              bodyList += '</ul>';

              $("#textview_abstract").html(abstractList);
              $("#textview_body").html(bodyList);

              var myHilitor = new Hilitor("article"); // id of the element to parse
              myHilitor.apply(keywords.value);
            }

          });
        });


        summarizeButton.addEventListener("click", function(){

          $('#spinner_1').show();
          $('#spinner_2').show();

          // AJAX request to get the summarized text from the server.
          $.get("/summarize", parameters, function (data) {

            $('#spinner_1').hide();
            $('#spinner_2').hide();

            if (data == "") {
              $("#textview_abstract").html("<center>File not available in the corpus</center>");
              $("#textview_body").html("<center>File not available in the corpus</center>");
            }

            else {

              var abstractList = '<ul>';
              var bodyList = '<ul>';
              var keywordsList = '<ul>';
              var keyphrasesList = '<ul>';


              for (var i = 0; i < data['abstract'].length; i++) {
                abstractList += '<li>' + data['abstract'][i] + '</li>';
              }
              abstractList += '</ul>';

              for (var i = 0; i < data['body'].length; i++) {
                bodyList += '<li>' + data['body'][i] + '</li>';
              }
              bodyList += '</ul>';

              for (var i = 0; i < data['keywords'].length; i++) {
                keywordsList += '<li>' + data['keywords'][i] + '</li>';
              }
              keywordsList += '</ul>';

              for (var i = 0; i < data['keyphrases'].length; i++) {
                keyphrasesList += '<li>' + data['keyphrases'][i] + '</li>';
              }
              keyphrasesList += '</ul>';

              if (smallTable.rows.length == 5) {

                  var row1 = smallTable.insertRow();
                  var cell1 = row1.insertCell(0);
                  var cell2 = row1.insertCell(1);

                  var row2 = smallTable.insertRow();
                  var cell3 = row2.insertCell(0);
                  var cell4 = row2.insertCell(1);

                  $("#textview_abstract").html(abstractList);
                  $("#textview_body").html(bodyList);
                  cell1.innerHTML = "Keywords: ";
                  cell2.innerHTML = keywordsList;
                  cell3.innerHTML = "Key Phrases: ";
                  cell4.innerHTML = keyphrasesList;
              }

              var myHilitor_ = new Hilitor("article"); // id of the element to parse
              myHilitor_.apply(keywords.value);
            }

          });
        });

    } // End of else block
});

}); // End of ready function

function format(d) {

    // d is the data object of the clicked row

    var div = '<div class="container-fluid"> <div class="row"> ';

    var table = '<div class="col-md-5"> <table id="small_table" class="smallTable" cellpadding="5" cellspacing="0" border="0">'+
      '<tr>' +
          '<td>Paper ID:</td>'+
          '<td>'+ d.SHA + '</td>'+
      '</tr>' +

      '<tr>'+
          '<td>Journal:</td>'+
          '<td>' + d.Journal + '</td>'+
      '</tr>' +

      '<tr>' +
          '<td>Publish Time:</td>'+
          '<td>' + d['Publish Time'] + '</td>'+
      '</tr>' +

      '<tr>' +
          '<td colspan="2"><input class="form-control form-control-sm form-control-borderless" id="summary_keywords" ' +
      		'placeholder="Word Search"></td>'+
      '</tr>' +

      '<tr>' +
          '<td> <input type="button" id="view_text" value="View Text" class="btn btn-primary btn-sm"> </td>'+
          '<td> <input type="button" id="summarize_text" value="Summarize" class="btn btn-primary btn-sm"> </td>'+
      '</tr>' +
    '</table> </div>';


    var text = '<div class = "text-center col-md-7" id="article">' +
        '<center><h5><span class="badge badge-pill badge-dark">Abstract</span></h5></center>' +

        '<center><div id="spinner_1" class="spinner-border spinner-border-sm text-primary" role="status" style="margin-top: 1rem;"> ' +
            '<span class="sr-only">Loading...</span>' +
        '</div></center>' +

        '<p id = "textview_abstract" class = "text-justify"></p>' +
        '<hr>' +

        '<center><h5><span class="badge badge-pill badge-dark">Body</span></h5></center>' +

        '<center><div id="spinner_2" class="spinner-border spinner-border-sm text-primary" role="status" style="margin-top: 1rem;"> ' +
        '   <span class="sr-only">Loading...</span>' +
        '</div></center>' +

        '<p id = "textview_body" class = "text-justify"></p>' +
        ' </div> </div> </div>';

    return div + table + text;
}
