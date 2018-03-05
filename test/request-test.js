const request = require('request-promise-native');

request.get('http://127.0.0.1:3000/api/intra/integration/export/query/ready/127.0.0.1/3000/S1Taqv6vG').then(res => {
  console.log(res);
})