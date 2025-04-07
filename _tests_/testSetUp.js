const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  // Start a MongoMemoryServer instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect mongoose to the in-memory MongoDB instance
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Cleanup: Disconnect mongoose and stop MongoMemoryServer after tests
  await mongoose.disconnect();
  await mongoServer.stop();
});
