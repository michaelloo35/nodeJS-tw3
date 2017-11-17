const async = require("async");

function printAsync(s, cb) {
    var delay = Math.floor((Math.random() * 1000) + 500);
    setTimeout(function () {
        console.log(s);
        if (cb) cb();
    }, delay);
}

function task1(cb, callback) {
    printAsync("1", function () {
        task2(cb);
    });
}

function task2(cb, callback) {
    printAsync("2", function () {
        task3(cb);
    });
}

function task3(cb, callback) {
    printAsync("3", cb);
}

// wywolanie sekwencji zadan
async.waterfall([
    (callback) => {
        callback(null, function () {
            console.log('done!');
        })
    },
    task1,
    task2,
    task3
])

/*
** Zadanie:
** Napisz funkcje loop(n), ktora powoduje wykonanie powyzszej
** sekwencji zadan n razy.
**
*/

// loop(4);