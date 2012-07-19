"use strict"
var assert = require('assert');

var Lock = (function () {
    function Lock(module, keys) {
        this.module = module;
        this.keys = keys;
    };

    Lock.prototype.release = function() {
        this.module._release(this);
    };

    return Lock;
})();

module.exports = (function () {
    function LockModule() {
        this.deffered = {};
    }

    function _iter_keys(keys, fn, callback) {
        var keys = keys.concat();
        function iter() {
            var key = keys.shift();
            if (key) 
                fn(key, iter);
            else 
                callback();
        }
        iter();
    }

    LockModule.prototype.acquire = function(keys, callback) {
        if (!Array.isArray(keys))
            keys = [keys];

        var deffered = this.deffered;
        var lock = new Lock(this, keys);

        _iter_keys(lock.keys.sort(), function (key, callback) {
            if (deffered[key]) {
                deffered[key].push(callback);
            } else {
                deffered[key] = [];
                callback();
            }            
        }, function (err) {
            if (err) return callback(err);
            callback(null, lock);
        });
    };

    LockModule.prototype._release = function(lock) {
        var deffered = this.deffered;

        assert.ok(lock.keys.every(function (k) { return deffered[k];}));

        lock.keys.sort().reverse().forEach(function (key) {
            var def_fn = deffered[key].shift();
            if (def_fn) {
                def_fn();
            } else {
                delete deffered[key];
            }
        });
    };
    return LockModule;
})();
