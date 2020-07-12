Dynamically add logs to node processes.
Supports cluster architecture.

Simple Usage:
```js
var http = require('http');
var DynamicLogger = require('dynamic-logger-express');
var logger = new DynamicLogger();

var myServer = http.createServer();

logger.addLoggerAppToServer(myServer);
logger.activate();
```

Usage with cluster:

```js
var DynamicLogger = require('dynamic-logger-express');
var logger = new DynamicLogger();
var masterServerPort = 10000;

if (cluster.isMaster) {
  const masterServer = http.createServer();

  dynamicLogger.addLoggerAppToServer(masterServer);
  dynamicLogger.activate();

  masterServer.listen(masterServerPort, () => console.log("Master listening on port ", masterServerPort));
} else {
  logger.listenOnWorker();
  // execute anything on the worker, and enjoy the power of dynamic logging!
}
```


Then, send http request to add/delete logpoints.
Examples exist on './test/'
You can use the package 'dynamic-logger-cli-client' to simplify these requests.