var cluster = require('cluster');
var http = require('http');
const DynamicLogger = require('../lib/index')

var numCPUs = 4;


const inspectServer = new DynamicLogger(3001);
if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        const worker = cluster.fork()
        setTimeout(() => worker.send({msg: "msg"}));
    }
    inspectServer.run();
} else {
    inspectServer.listenOnWorker();
    http.createServer(function(req, res) {
        const ff = "GUY_TEST";
        res.writeHead(200);


        res.end('process ' + process.pid + ' says hello!');
    }).listen(8000);
}
