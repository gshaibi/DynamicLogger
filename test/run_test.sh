#!/bin/bash

node server.js > result.log &

sleep 1
curl -s -XPOST -H 'Content-Type: application/json' -d '{
  "urlRegex": "server",
  "lineNumber": 11,
  "message": "t"
}' 'http://localhost:3001/logpoint' > /dev/null

sleep 1
curl -s -XGET 'http://localhost:3000/' > /dev/null

kill %1 &> /dev/null

res=$(grep "GUY_TEST" result.log)

if [ $res ]
then
  echo "SUCCESS"
  exit 0
else
  echo "FAIL"
  exit 1
fi