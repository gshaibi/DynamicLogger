var cluster = require('cluster');
var http = require('http');
const DynamicLogger = require('../lib/index')

const masterServerPort = 10000;
const minionServerPort = 10001;

var numCPUs = 1;

try {

    const dynamicLogger = new DynamicLogger();
    if (cluster.isMaster) {
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork()
        }

        const masterServer = http.createServer();
        dynamicLogger.addLoggerAppToServer(masterServer);
        dynamicLogger.activate();
        masterServer.listen(masterServerPort, () => console.log("Master listening on port ", masterServerPort));

        setTimeout(() => {
            dynamicLogger.deactivate();
        }, 10000);
    } else {
        console.log("On worker ", process.pid, " is_master ", cluster.isMaster);
        dynamicLogger.listenOnWorker();
        http.createServer(function(req, res) {
            const ff = "GUY_TEST";
            res.writeHead(200);
            // We will add the dynamic log here via 'addLogpoint.http' request.

            res.end('process ' + process.pid + ' says hello!');
        }).listen(minionServerPort);

    }

} catch(e) {
    // console.log(÷e)
}