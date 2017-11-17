function logTimeout() {
    console.log('Timeout ran at ' + new Date().toTimeString());
}

function logExitLoop() {
    console.log('Exit loop at: ' + new Date().toTimeString() + '. Ran ' + i + ' iterations.');
}

function logEnterLoop() {
    console.log('Enter loop at: ' + start.toTimeString());
}

/*
 <<<CODE STARTS>>> <<<CODE STARTS>>> <<<CODE STARTS>>> <<<CODE STARTS>>> <<<CODE STARTS>>>
*/

// set function to be called after 1 second
setTimeout(logTimeout, 1000);

// store the start time
var start = new Date();
logEnterLoop();

// run a loop for 4 seconds
var i = 0;

while (new Date().getTime() < start.getTime() + 4000) { // SYNC!
    i++;
}

// increment i while (current time < start time + 4000 ms)
logExitLoop();

for (var i = 0; i < 1024 * 1024; i++) {
    process.nextTick(function () { console.log(Math.sqrt(i)) } )
}