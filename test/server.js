const InspectServer = require('../lib/index')
const express = require('express')
const app = express()
const port = 3000

const inspectServer = new InspectServer(3001);
inspectServer.run();

app.get('/', (req, res) => {
  const t = "GUY_TEST";


  res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
