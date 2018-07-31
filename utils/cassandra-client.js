const cassandra = require('cassandra-driver');
// const distance = cassandra.types.distance;

const authProvider = new cassandra.auth.PlainTextAuthProvider(process.env.CASSANDRA_USERNAME, process.env.CASSANDRA_PASSWORD);
//Set the auth provider in the clientOptions when creating the Client instance
const client = new cassandra.Client({
  contactPoints: process.env.CASSANDRA_HOST.split(','),
  authProvider: authProvider,
  // pooling: {
  //   coreConnectionsPerHost: {
  //     [distance.local]: 2,
  //     [distance.remote]: 1
  //   }
  // }
});

module.exports = client;