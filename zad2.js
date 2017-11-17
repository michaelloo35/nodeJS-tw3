var file = require('file');
var fs = require('fs');


function sync(directory, label) {
    var sum = 0;
    var dirNumber = fs.readdirSync(directory).length;

    console.time(label);

    file.walkSync(directory, function (dirPath, dirs, files) {
        var filesNumber = files.length;

        files.forEach(function (file) {

            //singleFileSum lines for each file
            var singleFileSum = 0;

            fs.createReadStream(dirPath + "\\" + file).on('data', function (chunk) {
                singleFileSum += chunk.toString()
                    .split(/\r\n|[\n\r\u0085\u2028\u2029]/g)
                    .length - 1;
            }).on('end', function () {
                sum += singleFileSum;
                filesNumber--;
                if (filesNumber === 0) dirNumber--;
                if (dirNumber === 0) {
                    console.timeEnd(label)
                }
            }).on('error', function (err) {
                console.error(err);
            });
        })
    })
}


function async(directory, label) {
    var sum = 0;
    var dirNumber = fs.readdirSync(directory).length;

    console.time(label);
    file.walk(directory, function (nul, dirPath, dirs, files) {
        var fileNumber = files.length;

        files.forEach(function (file) {
            var singleFileSum = 0;
            fs.createReadStream(file).on('data', function (chunk) {
                singleFileSum += chunk.toString()
                    .split(/\r\n|[\n\r\u0085\u2028\u2029]/g)
                    .length - 1;
            }).on('end', function () {
                sum += singleFileSum;
                // console.log(file, singleFileSum);
                fileNumber--;
                if (fileNumber === 0) dirNumber--;
                if (dirNumber === 0) {
                    console.timeEnd(label)
                }
            }).on('error', function (err) {
                console.error(err);
            });
        })

    });

}

async('./PAM08','async1');