const DynamicLogger = require('../lib/index')
const express = require('express')
const http = require('http')
const app = express()
const port = 3000

const dynamicLogger = new DynamicLogger();

app.get('/', (req, res) => {
  const t = "GUY_TEST";


  res.send('Hello World!')
})

// Do not treat the dynamic logger's route.
app.all(dynamicLogger.LOGPOINT_ROUTE, (req, res) => {});

const server = http.createServer(app);
dynamicLogger.activate();
dynamicLogger.addLoggerToServer(server);


server.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
