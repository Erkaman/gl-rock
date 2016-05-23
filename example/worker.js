/**
 * Created by eric on 23/05/16.
 */

self.onmessage = function (msg) {
    console.log(" worker got message ", msg.data);
    self.postMessage("done!");
    
};

function fibo (n) {
    return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
}