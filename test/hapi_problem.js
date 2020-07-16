const DynamicLogger = require('../lib/index');
const http = require('http');

const server = http.Server();

server.on('request', (req, res) => {
  const mistery = "surprise!";



  res.end('Response for every request.');
})

const dynamicLogger = new DynamicLogger();
dynamicLogger.addLoggerAppToServer(server);
dynamicLogger.activate();

server.listen(3000, () => console.log("Listening on port 3000"));