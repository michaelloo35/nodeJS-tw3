
var create = function (req, res) {
    async.waterfall([
        _function1(req),
        _function2,
        _function3
    ], function (error, success) {
        if (error) { alert('Something is wrong!'); }
        return alert('Done!');
    });
};

function _function1 (req) {
    return function (callback) {
        callback (null, something);
    }
}

function _function2 (something, callback) {
    return function (callback) {
        var somethingelse = function () {
            // do something here };
        }
        callback (err, somethingelse);
    }
}

function _function3 (something, callback) {
    return function (callback) {
        var somethingmore = function () {
            // do something here };
            callback(err, somethingmore);
        }
    }
}

