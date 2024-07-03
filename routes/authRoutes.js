const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const router = express.Router();

// MongoDB URI
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Registration Endpoint
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await client.connect();
        const db = client.db('your_db_name');
        const users = db.collection('users');
        const result = await users.insertOne({ username, password: hashedPassword });
        res.status(201).send({ message: 'User created', userId: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await client.close();
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        await client.connect();
        const db = client.db('your_db_name');
        const users = db.collection('users');
        const user = await users.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            const userId = user._id.toString(); // Convert ObjectId to string
            const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.status(200).json({ message: 'Logged in successfully', token, userId });
        } else {
            res.status(401).send({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await client.close();
    }
});

module.exports = router;