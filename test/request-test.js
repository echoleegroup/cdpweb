const request = require('request');
const shortid = require('shortid');

request({
  url: `http://localhost:11002/query_nonowner/${shortid.generate()}`,
  method: 'POST',
  json: true,
  body: {
    req_owner: {test_req_owner: "aaaa"},
    req_log: {test_req_log: 123}
  }
}, (error, response, body) => {
  if (error)
    console.log('error: ', error);
  else
    console.log('response: ', response);
});