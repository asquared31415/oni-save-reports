const fs = require('fs');
const os = require('os');
const {parseSaveGame} = require('oni-save-parser');

//This function takes a save file and outputs a CSV. The callback excecutes when the file has completely finished parsing.
exports.parseToCSV = function(saveFile, _callback) {
    const saveData = parseSaveGame(toArrayBuffer(saveFile.buffer));
    const saveGame = saveData.gameObjects.filter( obj => {return obj.name === "SaveGame"})[0];
    const allReports = saveGame.gameObjects[0].behaviors.filter(obj => {return obj.name === "ReportManager"})[0];

    const reportTypes = [null, "Calorie Generation", 
        "Stress Change", null, "Disease Status", null, 
        null, "Chores", null, null, "Working Time", 
        "Travel Time", "Personal Time", "Idle Time", 
        null, null, null, null, "Oxygen Generation", 
        "Power Usage", "Power Wasted"];

    //Save the file in a temporary location before downloading.
    const saveLocation = os.tmpdir() + "/oni-save-reports";
    fs.mkdir(saveLocation, { recursive: true }, (err) => { if (err) throw err; });

    const saveWriter = fs.createWriteStream(saveLocation + "/temp.csv");

    saveWriter.write('Cycle, Dupes, Calories Added, Calories Removed, Net Calories, Stress Added, Stress Removed, Net Stress, Total Germs, Chores Added, Chores Removed, Net Chores, Avg. Working Time, Avg. Travel Time, Avg. Personal Time, Idle Time, Oxygen Added, Oxygen Removed, Net Oxygen, Power Added, Power Removed, Net Power Usage, Power Wasted\n');
    saveWriter.write(' ,  , [kcal], [kcal], [kcal], [Total Stress], [Total Stress], [Total Stress], [All Dupes],  ,  ,  , [Per Dupe], [Per Dupe], [Per Dupe], [Total Idle Time], [kg], [kg], [kg], [kJ], [kJ], [kJ], [kJ]\n');

    allReports.templateData.dailyReports.forEach(reportDay => {
        //Find the number of dupes for each day by pulling the child entries from the Stress Change report.
        const numDupes = reportDay.reportEntries[2].contextEntries.elements.filter(x => x !== null).length;
        
        saveWriter.write(reportDay.day + ", " + numDupes + ", ");
        
        //Get a report type (Calories, Stress, etc)
        reportDay.reportEntries.forEach(entry =>{
            const reportType = reportTypes[entry.reportType];
        
            //If the type is an actual report, add a cell to the file.
            if (reportType !== null) {
                if (reportType === "Calorie Generation") {
                    //In kCals with up to three decimal places 
                    saveWriter.write((entry.accPositive / 1000).toFixed(3) + ", " + (entry.accNegative / 1000).toFixed(3) + ", " + (entry.accumulate / 1000).toFixed(3) + ", ");
                }
                else if (reportType === "Stress Change") {
                    //In a Percent
                    saveWriter.write(entry.accPositive + "%, " + entry.accNegative + "%, " + entry.accumulate + "%, ");
                }
                else if (reportType === "Disease Status") {
                    //Total Disease status
                    saveWriter.write(entry.accumulate + ", ")
                }
                else if (reportType === "Working Time") {
                    //In a percent per dupe
                    saveWriter.write((entry.accumulate / numDupes) / 6 + "%, ");
                }
                else if (reportType === "Travel Time") {
                    //In a percent per dupe
                    saveWriter.write((entry.accumulate / numDupes) / 6 + "%, ");
                }
                else if (reportType === "Personal Time") {
                    //In a percent per dupe
                    saveWriter.write((entry.accumulate / numDupes) / 6 + "%, ");
                }
                else if (reportType === "Idle Time") {
                    //In a percent
                    saveWriter.write((entry.accumulate / 6) + "%, ");
                }
                else if (reportType === "Oxygen Generation") {
                    //Limited to three decimal places
                    saveWriter.write(entry.accPositive.toFixed(3) + ", " + entry.accNegative.toFixed(3) + ", " + entry.accumulate.toFixed(3) + ", ");
                }
                else if (reportType === "Power Usage") {
                    //In kiloJoules with up to three decimal places
                    saveWriter.write((entry.accPositive / 1000).toFixed(3) + ", " + (entry.accNegative / 1000).toFixed(3) + ", " + (entry.accumulate / 1000).toFixed(3) + ", ");
                }
                else if (reportType === "Power Wasted") {
                    //Total Power waste in kiloJoules with up to three decimal places
                    saveWriter.write((entry.accumulate / 1000).toFixed(3) + ", ");
                }
                else {
                    //Chores
                    saveWriter.write(entry.accPositive + ", " + entry.accNegative + ", " + entry.accumulate + ", ");
                }
            }
        });
        saveWriter.write('\n');
    });

    saveWriter.close();

    //Wait for the file to completely finish parsing before sending the callback.
    saveWriter.on('finish', function () {
        console.log('File Parse Completed');
        _callback();
    });
}

//This function takes a save file and outputs a Text file. The callback excecutes when the file has completely finished parsing.
exports.parseToText = function (saveFile, _callback) {
    const saveData = parseSaveGame(toArrayBuffer(saveFile.buffer));
    const saveGame = saveData.gameObjects.filter( obj => {return obj.name === "SaveGame"})[0];
    const allReports = saveGame.gameObjects[0].behaviors.filter(obj => {return obj.name === "ReportManager"})[0];

    const reportTypes = [null, "Calorie Generation", 
        "Stress Change", null, "Disease Status", null, 
        null, "Chores", null, null, "Working Time", 
        "Travel Time", "Personal Time", "Idle Time", 
        null, null, null, null, "Oxygen Generation", 
        "Power Usage", "Power Wasted"];

    //Save the file in a temporary location before downloading.
    const saveLocation = os.tmpdir() + "/oni-save-reports";
    fs.mkdir(saveLocation, { recursive: true }, (err) => { if (err) throw err; });

    const saveWriter = fs.createWriteStream(saveLocation + "/temp.txt");
    //const saveWriter = fs.createWriteStream("tmp/temp.txt");

    allReports.templateData.dailyReports.forEach(reportDay => { 
        saveWriter.write('Cycle ' + reportDay.day + '\n');

        //Get a report type (Calorie Generation, Stress Change, etc).
        reportDay.reportEntries.forEach(entry =>{
            const reportType = reportTypes[entry.reportType];

            if (reportType !== null) {
                saveWriter.write('\t' + reportType + ': +' + entry.accPositive + ' ' + entry.accNegative + ' ' + entry.accumulate + '\n')

                //Check for child entries.
                if (entry.contextEntries.elements !== null) {
                    entry.contextEntries.elements.forEach(childEntry => { 
                        if (childEntry !== null) {
                            saveWriter.write('\t\t' + childEntry.context + ": " + childEntry.accPositive + ' ' + childEntry.accNegative + ' ' + childEntry.accumulate + '\n') 
                        }
                    });
                }
            }
        })
    });

    saveWriter.close();

    //Wait for the file to completely finish parsing before sending the callback.
    saveWriter.on('finish', function () {
        console.log('File Save Completed');
        _callback();
    });
} 

//Function to change a buffer object to an ArrayBuffer.
function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}