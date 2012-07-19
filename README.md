node-lock
=========

Small node.js async resources locking library.

Install
=======

To install the latest from the repository, run:

    npm install git://github.com/maximgavrilov/node-lock.git


Usage
=====

A simple example of transfering money between two persons:

    var Lock = require('lock');
    var lock = new Lock();

    function transfer(sender, receiver, amount, next) {
        lock.acquire([sender.id, receiver.id], function (err, lock) {
            if (err) {
                return next(err);
            }

            // now we have locks for sender and receiver
            db.change_money(sender, -amount, function (err) {
                if (err) {
                    lock.release();
                    return next(err);
                }
                // ....
                db.change_money(receiver, amount, function (err) {
                    if (err) {
                        lock.release();
                        return next(err);
                    }
                    // ...
                    lock.release();
                    return next();
                });
            });
        });
    }
