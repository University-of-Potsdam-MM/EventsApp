//var Q = require("q");
//var Set = require("collections/set"); // https://npmjs.org/package/collections

//window.outstandingPromises = new Set();
var originalDefer = Q.defer;
Q.defer = function () {
    console.log("Deferred created");
    var deferred = originalDefer();
    deferred.stack = new Error("").stack;
    //window.outstandingPromises.add(deferred);
    
    var originalResolve = deferred.resolve;
    deferred.resolve = function (value) {
        console.log("Promise resolved with", value);
       // if (deferred.promise.isPending()) window.outstandingPromises.delete(deferred);
        originalResolve(value);
    };
    
    var originalReject = deferred.reject;
    deferred.reject = function (value) {
        console.log("Promise rejected with", value);
        //if (deferred.promise.isPending()) window.outstandingPromises.delete(deferred);
        originalReject(value);
    };
    
    return deferred;
};