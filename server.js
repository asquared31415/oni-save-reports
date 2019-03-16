var express = require('express');
var multer  = require('multer');
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
    if (req.body.submitTXT) {
		const fileName = Math.random().toString().substring(2);
        parser.parseToText(req.file, fileName, function(file) {
            //Download the output file on parse completion.
            res.download(file, req.file.originalname.substring(0, req.file.originalname.length - 4) + " Reports.txt");
        })
    }
    else if (req.body.submitCSV) {
		const fileName = Math.random().toString().substring(2);
        parser.parseToCSV(req.file, fileName, function(file) {
            //Download the output file on parse completion.
            res.download(file, req.file.originalname.substring(0, req.file.originalname.length - 4) + " Reports.csv");
        })
    }
});

//Run the app on process.env.PORT or port 3000.
const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('App listening on ' + port);
});
