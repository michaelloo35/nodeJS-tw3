var async = require("async");

maxN = 10;
maxK = 5;
// Teoria Współbieżnośi, implementacja problemu 5 filozofów w node.js
// Opis problemu: http://en.wikipedia.org/wiki/Dining_philosophers_problem
// 1. Dokończ implementację funkcji podnoszenia widelca (Fork.acquire).
// 2. Zaimplementuj "naiwny" algorytm (każdy filozof podnosi najpierw lewy, potem
//    prawy widelec, itd.).
// 3. Zaimplementuj rozwiązanie asymetryczne: filozofowie z nieparzystym numerem
//    najpierw podnoszą widelec lewy, z parzystym -- prawy.
// 4. Zaimplementuj rozwiązanie z kelnerem (opisane jako "Arbitrator solution"
//    w wikipedii).
// 5. Zaimplementuj rozwiążanie z jednoczesnym podnoszeniem widelców:
//    filozof albo podnosi jednocześnie oba widelce, albo żadnego.
// 6. Uruchom eksperymenty dla różnej liczby filozofów i dla każdego wariantu
//    implementacji zmierz średni czas oczekiwania każdego filozofa na dostęp
//    do widelców. Wyniki przedstaw na wykresach.

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

// states 0 - free fork , 1 - taken
var Fork = function () {
    this.state = 0;
    return this;
};

// zaimplementuj funkcję acquire, tak by korzystala z algorytmu BEB
// (http://pl.wikipedia.org/wiki/Binary_Exponential_Backoff), tzn:
// 1. przed pierwszą próbą podniesienia widelca Filozof odczekuje 1ms
// 2. gdy próba jest nieudana, zwiększa czas oczekiwania dwukrotnie
// i ponawia próbę, itd.
Fork.prototype.acquire = function (successCallback, failureCallback) {
    var N = 0;
    var K = 0;
    var pickFork = function (N, K, fork) {
        setTimeout(function () {
            if (fork.state === 1) {

                // exp. backoff
                N++;
                if (N < maxK) {
                    K = N;
                }
                else {
                    K = maxK;
                }

                // zuzylismy limit prób
                if (N > maxN) {
                    if (failureCallback) failureCallback();
                }
                else {
                    pickFork(N, K, fork);
                }
            } else {
                fork.state = 1;
                if (successCallback) successCallback();
            }
        }, randomInt(0, Math.pow(2, K))); // losujemy czaso czewkiania z przedziału 0,2^k
    };
    pickFork(N, K, this);
};


// odloz widelec
Fork.prototype.release = function (callback) {
    this.state = 0;
    if (callback) callback();
};

// f1 - left fork , f2 - right fork
var Philosopher = function (id, forks) {
    this.id = id;
    this.forks = forks;

    this.f1 = id % forks.length;
    this.f2 = (id + 1) % forks.length;
    this.eatingDelay = 30;
    this.think = 10;
    return this;
};

// jem potem odkładam widelce i opdalam się z mniejszym counterem
Philosopher.prototype.naiveNext = function (count) {
    var forks = this.forks;
    var f1 = this.f1;
    var f2 = this.f2;
    var id = this.id;

    setTimeout(function () {
        async.waterfall([
            function (callback) {
                forks[f1].release(callback);
            },
            function (callback) {
                forks[f2].release(callback);
            },
            function (callback) {
                philosophers[id].startNaive(count - 1);
            }
        ]);
    }, this.eatingDelay);
};


// zaimplementuj rozwiązanie naiwne
// każdy filozof powinien 'count' razy wykonywać cykl
// podnoszenia widelców -- jedzenia -- zwalniania widelców
Philosopher.prototype.startNaive = function (count) {
    var forks = this.forks;
    var f1 = this.f1;
    var f2 = this.f2;
    var id = this.id;

    if (startTimesNaive[id] === undefined) {
        startTimesNaive[id] = new Date().getTime();
    }

    if (count != 0) {
        // zbierz pierwszy widelec
        forks[f1].acquire(/*successCallback*/ function () {

            // powinien być jeszcze czas na myslenie albo myslenie nexttick
            // zbierz drugi widelec
            forks[f2].acquire(/*successCallback*/ function () {

                philosophers[id].naiveNext(count);
            }, /*failureCallback*/ function () {

                // zrob release pierwszego forka bo nie mozesz podniesc 2
                async.waterfall([
                    function (callback) {
                        forks[f1].release(callback);
                    },
                    // sprobuj jeszcze raz
                    function (callback) {
                        philosophers[id].startNaive(count);
                    }
                ]);
            })
        }, /*failureCallback*/function () {
            philosophers[id].startNaive(count);
        });
    } else {
        // wykonal count razy
        console.log(id + " finished after " + (new Date().getTime() - startTimesNaive[id]) + "ms.");
    }
};

Philosopher.prototype.acquire2 = function (successCallback, failureCallback) {
    var N = 0;
    var K = 0;
    var f1 = this.f1;
    var f2 = this.f2;

    var pickForks = function (N, K, f1, f2) {
        setTimeout(function () {
            if (forks[f1].state === 0 && forks[f2].state === 0) {
                forks[f1].state = 1;
                forks[f2].state = 1;
                if (successCallback) successCallback();
            }
            else {
                // exp. backoff
                N++;
                if (N < maxK) {
                    K = N;
                }
                else {
                    K = maxK;
                }

                // zuzylismy limit prób
                if (N > maxN) {
                    if (failureCallback) failureCallback();
                }
                else {
                    pickForks(N, K, f1, f2);
                }
            }
        }, randomInt(0, Math.pow(2, K))); // losujemy czaso czewkiania z przedziału 0,2^k
    };
    pickForks(N, K, f1, f2);
};

function release2(f1, f2) {
    forks[f1].state = 0;
    forks[f2].state = 0;
}

Philosopher.prototype.startNaive2 = function (count) {
    var f1 = this.f1;
    var f2 = this.f2;
    var id = this.id;

    if (startTimesNaive2[id] === undefined) {
        startTimesNaive2[id] = new Date().getTime();
    }

    if (count !== 0) {
        setTimeout(function () {
            philosophers[id].acquire2(function () {
                setTimeout(/*successCallback*/ function () {
                    async.waterfall([
                        function (callback) {
                            // release forks
                            release2(f1, f2);
                            if (callback) callback()
                        },
                        function () {
                            philosophers[id].startNaive2(count - 1)
                        }
                    ]);
                }, this.eatingDelay);
            }, /*failureCallback*/ function () {
                philosophers[id].startNaive2(count)
            })
        }, this.think)
    } else if (count === 0) {
        console.log(id + " finished after " + (new Date().getTime() - startTimesNaive2[id]) + "ms.");
    }
};

// zaimplementuj rozwiązanie asymetryczne
// każdy filozof powinien 'count' razy wykonywać cykl
// podnoszenia widelców -- jedzenia -- zwalniania widelców


Philosopher.prototype.startAsymetric = function (count) {

    if (this.id % 2 === 0)
        [this.f1, this.f2] = [this.f1, this.f2];

    this.startNaive(count);
};

// daj pozwolenie na jedzenie jedz eatingDelay i odloz
Philosopher.prototype.giveForks = function (count, f1, f2) {
    forks[f1].state = 1;
    forks[f2].state = 1;
    var philosopher = this;

    setTimeout(function () {
        conductor.release(philosopher, count);
    }, this.eatingDelay);
};

// zaimplementuj rozwiązanie z kelnerem
// każdy filozof powinien 'count' razy wykonywać cykl
// podnoszenia widelców -- jedzenia -- zwalniania widelców
Philosopher.prototype.startConductor = function (count) {

    var id = this.id;
    if (startTimesConductor[id] === undefined) startTimesConductor[id] = new Date().getTime();
    if (count != 0) conductor.ask(this, count);
    else console.log(id + " finished after " + (new Date().getTime() - startTimesConductor[id]) + " ms");

};

var Conductor = function () {
    this.queue = [];
    return this;
};

Conductor.prototype.ask = function (philosopher, count) {
    var id = philosopher.id;
    var f1 = philosopher.f1;
    var f2 = philosopher.f2;
    var forks = philosopher.forks;

    // sprawdz czy widelce danego filozofa są wolne
    if (forks[f1].state === 0 && forks[f2].state === 0) {

        // tak daj mu widelce
        philosopher.giveForks(count, f1, f2);
    } else {
        // dorzuc go do kolejki
        this.queue.push([id, count]);
    }
};

Conductor.prototype.release = function (philosopher, count) {

    var f1 = philosopher.f1;
    var f2 = philosopher.f2;
    var forks = philosopher.forks;
    var conductor = this;

    forks[f1].state = 0;
    forks[f2].state = 0;

    philosopher.startConductor(count - 1);

    var queuePopNext = function () {
        if (conductor.queue.length !== 0) {
            // sciagnij filozofa
            var id = conductor.queue[0][0];
            var count = conductor.queue[0][1];
            var f1 = philosophers[id].f1;
            var f2 = philosophers[id].f2;
            var forks = philosophers[id].forks;

            //spr czy widelce sa wolne
            if (forks[f1].state === 0 && forks[f2].state === 0) {
                conductor.queue.shift();
                philosophers[id].giveForks(count, f1, f2);
                queuePopNext();
            }
        }
    };
    queuePopNext();
};

var N = 5;
var forks = [];
var philosophers = [];
var startTimesNaive = [];
var startTimesAsym = [];
var startTimesNaive2 = []
var startTimesConductor = [];
var conductor = new Conductor();


for (var i = 0; i < N; i++) forks.push(new Fork());
for (var i = 0; i < N; i++) philosophers.push(new Philosopher(i, forks));
for (var i = 0; i < N; i++) philosophers[i].startNaive(10);

