const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.imeoc20.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const userCollection = client.db("taskVista").collection("users");
        const taskCollection = client.db("taskVista").collection("tasks");
        const reviewCollection = client.db("taskVista").collection("reviews");

        // JWT related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            })
            res.send({ token });
        });

        // JWT middlewares (verify token)
        const verifyToken = (req, res, next) => {
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'unauthorized access' });
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'unauthorized access' })
                }
                req.decoded = decoded;
                next();
            })
        }

        // task related api
        // add a new task
        app.post('/tasks', verifyToken, async (req, res) => {
            try {
                const taskData = req.body;

                const result = await taskCollection.insertOne(taskData);
                res.status(201).json(result);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });

        // Get all task
        app.get('/tasks', async (req, res) => {
            try {
                const surveys = await taskCollection.find().toArray();
                res.json(surveys);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // user related api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        });


        // get user from database
        app.get('/users', verifyToken, async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });


        // get reviews from database
        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result);
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// Use the to-do routes
// app.use('/task-list', surveyRoutes);

app.get('/', (req, res) => {
    res.send('Task Management server is running')
})

app.listen(port, () => {
    console.log(`Server is running on PORT: ${port}`)
});