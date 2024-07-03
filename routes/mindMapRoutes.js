const express = require('express');
const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');
const router = express.Router();
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Save or Update a Mind Map
router.post('/', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.userId;
    try {
        await client.connect();
        const db = client.db('your_db_name');
        const mindmaps = db.collection('mindmaps');
        const updateDoc = {
            $set: {
                title,
                content,
                updatedAt: new Date(),
            },
        };
        const result = await mindmaps.updateOne(
            { userId: new ObjectId(userId) },
            updateDoc,
            { upsert: true }
        );
        res.status(200).json({ message: 'Mind map saved successfully', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await client.close();
    }
});

// Retrieve Mind Maps
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        await client.connect();
        const db = client.db('your_db_name');
        const mindmaps = db.collection('mindmaps');
        const maps = await mindmaps.find({ userId: new ObjectId(userId) }).toArray();
        res.status(200).json(maps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await client.close();
    }
});

router.post('/saveMindMap', async (req, res) => {
    const { userId, mindMapData } = req.body;

    try {
        await client.connect();
        const db = client.db('your_db_name');
        const users = db.collection('users');

        const result = await users.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { mindMapData: mindMapData } }
        );

        if (result.modifiedCount === 1) {
            res.status(200).json({ message: 'Mind map saved successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await client.close();
    }
});

router.get('/loadMindMap/:userId', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('your_db_name');
        const users = db.collection('users');

        const user = await users.findOne({ _id: new ObjectId(req.params.userId) });

        if (user) {
            res.status(200).json({ mindMapData: user.mindMapData });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await client.close();
    }
});


router.post('/generateAiNode', async (req, res) => {
    const { contents } = req.body;
    const prompt = `You are a brainstorming expert. Your task is to generate a new word that combines or builds upon the following terms. It must be a real word that is related to the terms you are about to recieve. 
    
    Here are a few examples; 

    1. Desk + Computer = Keyboard
    2. Sports + Football = Pitch
    3. Building + Coffee = Cafe

    (Your answer should only include the word after the equal sign)
    
    Here are the terms:\n\n${contents.join("\n")}`;

    try {
        const response = await axios.post(OPENAI_API_URL, {
          model: "gpt-3.5-turbo", 
          messages: [
            {
              "role": "user",
              "content": prompt
            }
          ],
          temperature: 0.7, // Increase temperature for more creative responses
          max_tokens: 32, // Limit response length to prevent overly long answers
          n: 1, // Generate a single response
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          }
        });

        const suggestedContent = response.data.choices[0].message.content.trim()
        console.log(suggestedContent)
        res.status(200).json({ suggestedContent });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error)
    }
});


//NEW
 function generateSummaryPrompt(mindMapData) {
    const nodes = mindMapData.nodes.map(node => node.content);
    const connections = mindMapData.connections.map(conn => `${conn.startNodeId} -> ${conn.endNodeId}`);
    const prompt = `Summarize the mind map consisting of the following ideas:\n\n${nodes.join("\n")}\n\n${connections.join("\n")}`;
    return prompt;
  } 

  
//NEW
 router.post('/generateSummary', async (req, res) => {
    const { mindMapData } = req.body;
    // Call the OpenAI API to generate the summary
    try {
      const response = await axios.post(OPENAI_API_URL, {
        model: "gpt-3.5-turbo",
        messages: [
          {
            "role": "user",
            "content": generateSummaryPrompt(mindMapData)
          }
        ],
        temperature: 0.8,
        max_tokens: 256,
        n: 1,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        }
      });
      const summary = response.data.choices[0].message.content.trim();
      res.status(200).json({ summary });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
 
module.exports = router;