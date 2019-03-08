var express = require('express');
var multer  = require('multer');
var path = require('path');
var parser = require('./public/scripts/parseSaves.js');

//Set multer to store the inputted files as a buffer object in memory.
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

var app = express()
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

//Document Upload
app.post('/', upload.single('save'), function (req, res, next) {
    //Handle text file.
    if (req.body.outputType === "text") {
        parser.parseToText(req.file, function() { 
            //On completion of the parse, download the output file from the temp folder.
            res.download(path.join(__dirname, "tmp", "temp.txt"), req.file.originalname.substring(0, req.file.originalname.length - 4) + " Reports.txt");
        })
    }
    //Handle CSV file.
    else if (req.body.outputType === "csv") {
        parser.parseToCSV(req.file, function() {
            //On completion of the parse, download the output file from the temp folder.
            res.download(path.join(__dirname, "tmp", "temp.csv"), req.file.originalname.substring(0, req.file.originalname.length - 4) + " Reports.csv");
        })
    }
});

//Run the app on process.env.PORT
app.listen(process.env.PORT, function () {
    console.log('App listening on process.env.PORT')
});