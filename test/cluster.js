var cluster = require('cluster');
var http = require('http');
const DynamicLogger = require('../lib/index')

var numCPUs = 1;

try {

    const inspectServer = new DynamicLogger();
    if (cluster.isMaster) {
        for (var i = 0; i < numCPUs; i++) {
            const worker = cluster.fork()
            // setTimeout(() => worker.send({msg: "msg"}));
        }
        inspectServer.run(3001);
        setTimeout(() => {
            inspectServer.stop();
        }, 10000);
    } else {
        console.log("On worker ", process.pid, " is_master ", cluster.isMaster);
        process.on('message', console.log);
        inspectServer.listenOnWorker();
        const server = http.createServer(function(req, res) {
            const ff = "GUY_TEST";
            res.writeHead(200);


            res.end('process ' + process.pid + ' says hello!');
        }).listen(8000);
    }

} catch(e) {
    // console.log(÷e)
}