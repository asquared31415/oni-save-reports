var express = require('express');
var multer  = require('multer');
var os = require('os');
var path = require('path');
var parser = require('./public/scripts/parseSaves.js');

//Set multer to store the inputted files as a buffer object in memory.
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

var app = express()
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

//Document Upload
app.post('/', upload.single('save'), function (req, res, next) {
    if (req.body.outputType === "text") {
        parser.parseToText(req.file, function(file) {
            //On completion of the parse, download the output file from the temp folder.
            res.download(file, req.file.originalname.substring(0, req.file.originalname.length - 4) + " Reports.txt");
        })
    }
    else if (req.body.outputType === "csv") {
        parser.parseToCSV(req.file, function(file) {
            //On completion of the parse, download the output file from the temp folder.
            res.download(file, req.file.originalname.substring(0, req.file.originalname.length - 4) + " Reports.csv");
        })
    }
});

//Run the app on process.env.PORT or port 3000.
app.listen(process.env.PORT || 3000, function () {
    console.log('App listening on process.env.PORT and port 3000.')
});
