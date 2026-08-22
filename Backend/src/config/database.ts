import { Db, MongoClient } from "mongodb";
import { config } from "./env.config";

let client: MongoClient;
let database: Db;

export const connectDatabase = async () => {
  if (database) return database;
  client = new MongoClient(config.mongoUri);
  await client.connect();
  database = client.db();
  console.log(`MongoDB connected: ${database.databaseName}`);
  return database;
};

export const getDatabase = () => {
  if (!database) throw new Error("Database has not been connected.");
  return database;
};

export const closeDatabase = async () => {
  if (client) await client.close();
};
