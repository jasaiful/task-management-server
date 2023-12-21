const express = require('express');
const { MongoClient, ServerApiVersion, MongoAWSError, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
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

        const userCollection = client.db('taskVista').collection('user');
        const googleUserCollection = client.db('taskVista').collection('googleUser');







        // user related api

        app.post('/user', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.post('/googleUser', async (req, res) => {
            const googleUser = req.body;
            console.log(googleUser);
            const result = await googleUserCollection.insertOne(googleUser);
            res.send(result);
        });

        app.get('/googleUser', async (req, res) => {
            const cursor = googleUserCollection.find();
            const googleUser = await cursor.toArray();
            res.send(googleUser);
        });

        app.get('/user', async (req, res) => {
            const cursor = userCollection.find();
            const user = await cursor.toArray();
            res.send(user);
        });

        app.patch('/user', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = {
                $set: {
                    lastLoggedAt: user.lastLoggedAt
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc)
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('career center server is running')
});

app.listen(port, () => {
    console.log(`server is running on PORT: ${port}`)
});