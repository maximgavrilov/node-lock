"use strict"
// NodeUnit test suite
var Lock = require('../');
var nextTick = process.nextTick;

exports.lock_test = {
    utils : function (test) {
        test.ok([]);
        test.ok([1, 2, 3]);
        test.ok(undefined ? false : true);
        test.ok(!Array.isArray(undefined));
        test.ok(![false, false, false].some(function (v) {return v;}));
        test.deepEqual([2, 3], [1, 2, 3, 4, 5].filter(function (v) {
            return [2, 3].indexOf(v) >= 0;
        }));
        test.done();
    },

    "one lock": function (test) {
        var lock = new Lock();
        lock.acquire("res1", function (err, lock) {
            if (err) return test.done(err);

            lock.release();
            test.done();
        });
    },

    "one internal lock": function (test) {
        test.expect(1);

        var lock = new Lock();
        lock.acquire("res", function (err, lock1) {
            if (err) return test.done(err);
            var lock1_released = false;

            lock.acquire("res", function (err, lock2) {
                if (err) return test.done(err);

                test.equals(lock1_released, true);
                lock2.release();
                test.done();
            });

            setTimeout(function () {
                lock1_released = true;
                lock1.release();                
            }, 10);
        });
    },

    "two internal locks": function (test) {
        test.expect(3);

        var lock = new Lock();
        lock.acquire("res", function (err, lock1) {
            if (err) return test.done(err);
            var lock1_released = false;

            lock.acquire("res", function (err, lock2) {                
                if (err) return test.done(err);

                test.ok(lock1_released);

                var lock2_released = false;

                lock.acquire("res", function (err, lock3) {
                    if (err) return test.done(err);

                    test.ok(lock1_released);
                    test.ok(lock2_released);
                    lock3.release();
                    test.done();
                })

                setTimeout(function () {
                    lock2_released = true;
                    lock2.release();                
                }, 10);
            });

            setTimeout(function () {
                lock1_released = true;
                lock1.release();                
            }, 10);
        });
    },

    "one internal multilock": function (test) {
        test.expect(1);

        var lock = new Lock();
        lock.acquire(["res1", "res2"], function (err, lock1) {
            var lock1_released = false;

            lock.acquire("res1", function (err, lock2) {
                if (err) return test.done(err);

                test.ok(lock1_released);
                test.done();
            });

            setTimeout(function () {
                lock1_released = true;
                lock1.release();
            }, 10);
        });
    },

    "one internal opposite inner multilock": function (test) {
        test.expect(1);

        var lock = new Lock();
        lock.acquire(["res1", "res2"], function (err, lock1) {
            var lock1_released = false;

            lock.acquire(["res2", "res1"], function (err, lock2) {
                if (err) return test.done(err);

                test.ok(lock1_released);
                test.done();
            });

            setTimeout(function () {
                lock1_released = true;
                lock1.release();
            }, 10);
        });
    },

    "two locks – both locks – single lock": function (test) {
        test.expect(3);

        var lock = new Lock();
        lock.acquire("res1", function (err, lock1) {
            if (err) return test.done(err);

            var lock1_released = false;
            lock.acquire("res2", function (err, lock2) {
                if (err) return test.done(err);

                var lock2_released = false;
                var lock3_released = false;

                lock.acquire(["res1", "res2"], function (err, lock3) {
                    if (err) return test.done(err);

                    lock3_released = true;
                    lock3.release();
                });

                setTimeout(function () {
                    lock1_released = true;
                    lock1.release();

                    lock2_released = true;
                    lock2.release();

                    setTimeout(function () {
                        lock.acquire("res1", function (err, lock_) {
                            test.ok(lock1_released);
                            test.ok(lock2_released);
                            test.ok(lock3_released);

                            lock_.release();

                            test.done();
                        });
                    }, 10);
                }, 10);

            });
        });
    },

    "two concurent opposite locks": function (test) {
        test.expect(2);

        var lock = new Lock();
        lock.acquire("res1", function (err, lock1) {
            if (err) return test.done(err);

            var lock1_released = false;
            var lock2_released = false;
            var lock3_released = false;

            lock.acquire(["res1", "res2"], function (err, lock2) {
                if (err) return test.done(err);

                test.ok(lock1_released);

                var _lock3_released = lock3_released;
                lock2_released = true;
                lock2.release();

                if (lock2_released && _lock3_released) {
                    test.done();
                }
            });

            lock.acquire(["res2", "res1"], function (err, lock3) {
                if (err) return test.done(err);

                test.ok(lock1_released);

                var _lock2_released = lock2_released;
                lock3_released = true;
                lock3.release();

                if (_lock2_released && lock3_released) {
                    test.done();
                }
            });

            lock1_released = true;
            lock1.release();
        });
    }
}
