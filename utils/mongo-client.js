import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

async function connectMongoDb() {
  const uri = process.env.MONGO_CONNECT_URI
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db();
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
}

export default connectMongoDb
