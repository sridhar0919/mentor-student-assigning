const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const dbUrl =
  'mongodb+srv://Sridhar:12345@cluster0.lvj8e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

module.exports = { dbUrl, mongodb, MongoClient };
