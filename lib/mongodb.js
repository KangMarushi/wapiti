// lib/mongodb.js
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  const db = client.db("wapiti.u2gn3c1.mongodb.net"); // Replace with your DB name
  return { db, client };
}

module.exports = { connectToDatabase };
