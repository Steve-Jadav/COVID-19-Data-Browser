const express = require("express");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const path = require("path");

// Initialize the app
const app = express();
const port = 3000;

var summarizeRouter = require("./routes/summarize");
var textViewRouter = require("./routes/textViewer");
var keywordSearchRouter = require("./routes/keywordSearch");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/summarize", summarizeRouter);
app.use("/textViewer", textViewRouter);
app.use("/keywordSearch", keywordSearchRouter);

// Error route
app.use(function (req, res, next) {
  res.status(404).send("Unable to locate the requested page. Please recheck the url.");
});


app.listen(port, function () {
  console.log(`Application listening on port ${port}!`);
});
