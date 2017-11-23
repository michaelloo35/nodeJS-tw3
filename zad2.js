var file = require('file');
var fs = require('fs');

var sumAsync = 0;
var fileNumber = [];

var filesNumber = 0;
var filesArray = [];
var sumSync = 0;
var dirNumber;

function synchronizedCountSingleFile(label) {

    var singleFileSum = 0;
    if (filesNumber > 0) {
        filesNumber--;
        fs.createReadStream(filesArray[filesNumber]).on('data', function (chunk) {
            singleFileSum += chunk.toString()
                .split(/\r\n|[\n\r\u0085\u2028\u2029]/g)
                .length - 1;
        }).on('end', function () {
            sumSync += singleFileSum;
            if (filesNumber === 0) {
                console.timeEnd(label);
            }
            synchronizedCountSingleFile(label);
        }).on('error', function (err) {
            console.error(err);
        });
    }
    else{
        console.log(sumSync)
    }
}

function sync(directory, label) {

    console.time(label);

    file.walkSync(directory, function (dirPath, dirs, files) {
        files.forEach(function (file) {
            filesArray[filesNumber] = dirPath + "\\" + file;
            filesNumber++;
        })
    })
    synchronizedCountSingleFile(label);
}


function countSingleFileLines(file, dirPath, label) {
    var singleFileSum = 0;
    fs.createReadStream(file).on('data', function (chunk) {
        singleFileSum += chunk.toString()
            .split(/\r\n|[\n\r\u0085\u2028\u2029]/g)
            .length - 1;
    }).on('end', function () {
        sumAsync += singleFileSum;
        fileNumber[dirPath]--;
        if (fileNumber[dirPath] === 0) dirNumber--;
        if (dirNumber === 0) {
            console.timeEnd(label);
            console.log(sumAsync)
        }
    }).on('error', function (err) {
        console.error(err);
    });
}

function async(directory, label) {
    dirNumber = fs.readdirSync(directory).length;

    console.time(label);
    file.walk(directory, function (nul, dirPath, dirs, files) {
        fileNumber[dirPath] = files.length;
        files.forEach(function (file) {

            process.nextTick(
                function () {
                    countSingleFileLines(file, dirPath, label);
                }
            );
        })

    });

}


sync("./PAM08", "async");