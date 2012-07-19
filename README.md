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

Contributors
=============

Anton Belyaev

License
========

 Copyright 2009 - 2012 Christian Amor Kvalheim.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
