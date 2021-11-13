const express = require("express");
const cors = require("cors");
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ocmpr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log("DATABASE CONNECTION ESTABLISHED!");

        // get the database and collections
        const database = client.db("GoPro");
        const productsCollection = database.collection("products");
        const usersCollection = database.collection("users");
        const reviewsCollection = database.collection("reviews");
        const ordersCollection = database.collection("orders");

        // get products
        app.get("/products", async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.json(products);
        });

        // get single product
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { id: id };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })

        // get products by keys but using post method
        app.post('/products/ordered', async (req, res) => {
            const productIds = req.body;
            const query = { id: { $in: productIds } };
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.json(products);
        })

        // add a product
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.json(result);
        })

        // delete product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { id: id };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })

        // get orders
        app.get('/orders', async (req, res) => {
            const email = req?.query?.email;
            let cursor;
            if (email) {
                cursor = ordersCollection.find({ email: email });
            } else {
                cursor = ordersCollection.find({});
            }
            const orders = await cursor.toArray();
            res.json(orders);
        })

        // update order
        app.put('/orders', async (req, res) => {
            const productId = req?.query?.id;
            const filter = { productId: productId }
            const updateDoc = {
                $set: {
                    status: `shipped`
                },
            };
            const result = await ordersCollection.updateMany(filter, updateDoc);
            res.json(result);
        })

        // save orders
        app.post('/orders', async (req, res) => {
            const newOrder = req?.body;
            const result = await ordersCollection.insertOne(newOrder);
            res.json(result);
        })

        // delete orders
        app.delete('/orders', async (req, res) => {
            const productId = req?.query?.id;
            const query = { productId: productId };
            const result = await ordersCollection.deleteMany(query);
            res.json(result);
        })

        // save users
        app.post('/users', async (req, res) => {
            const newUser = req?.body;
            const result = await usersCollection.insertOne(newUser);
            res.json(result);
        })

        // get user
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await usersCollection.findOne(query);
            res.json(result);
        });

        // update user
        app.put("/users", async (req, res) => {
            const email = req?.body?.email;
            const filter = { email: email }
            const updateDoc = {
                $set: {
                    role: `admin`
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // save reviews
        app.post("/reviews", async (req, res) => {
            const newReview = req?.body;
            const result = await reviewsCollection.insertOne(newReview);
            res.json(result);
        })

        // get reviews
        app.get("/reviews", async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
        });

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("SERVER IS UP!");
})

app.listen(port, () => {
    console.log("SERVER IS UP IN", port);
})
