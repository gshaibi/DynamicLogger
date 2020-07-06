Dynamically add logs to node processes.
Supports cluster architecture.

Simple Usage:
```js
var DynamicLogger = require('dynamic-logger-express');
var logger = new DynamicLogger();

logger.run(3001);
```

Usage with cluster:

```js
var DynamicLogger = require('dynamic-logger-express');
var logger = new DynamicLogger();

if (cluster.isMaster) {
  logger.run(3001);
} else {
  logger.listenOnWorker();
}
```


Then, send http request to add/delete logpoints.
Examples exist on './test/'
You can use the package 'dynamic-logger-cli-client' to simplify these requests.