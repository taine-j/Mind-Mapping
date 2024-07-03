require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const MongoClient = require('mongodb').MongoClient;
const ServerApiVersion = require('mongodb').ServerApiVersion;

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectMongo() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
  } catch (error) {
    console.error("Could not connect to MongoDB", error);
    process.exit(1);
  }
}

connectMongo();

const authRoutes = require('./routes/authRoutes'); 
app.use('/auth', authRoutes);

const mindMapRoutes = require('./routes/mindMapRoutes');
app.use('/mindmaps', mindMapRoutes);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
 


