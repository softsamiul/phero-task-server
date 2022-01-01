const express = require("express");
const app = express();
const port = process.env.PORT || 7000;
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const stripe = require('stripe')(process.env.STRIPE_SECRET)

const { MongoClient, MongoCursorInUseError } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zsjgq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(cors());
app.use(express.json());

async function run() {
  try {
    client.connect();
    const database = client.db("hero-rider");
    const riderUsersCollection = database.collection("riderUsersCollection");
    const usersCollection = database.collection("usersCollection");
    const packagesCollection = database.collection("packages");
    const ordersCollection = database.collection("orders");

    // GET API
    // GET API BY SINGLE ID
    app.get("/riderUsersCollection/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await riderUsersCollection.findOne(query);
      res.json(result);
    });

    // GET API BY SINGLE ID
    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.findOne(query);
      res.json(result);
    });

    // GET API BY SINGLE ID
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await packagesCollection.findOne(query);
      res.json(result);
    });

    app.get("/packages", async (req, res) => {
      const cursor = await packagesCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    app.get("/riderUsersCollection", async (req, res) => {
      const cursor = riderUsersCollection.find({});
      const result = await cursor.toArray();

      res.json(result);
    });

    app.get('/riderUsersCollection', async (req, res) => {
      const cursor = riderUsersCollection.find({})
      const page = req.query.page;
      const size = parseInt(req.query.size);
      let orders;
      const count = await cursor.count();

      if (page) {
          orders = await cursor.skip(page * size).limit(size).toArray();
      }
      else {
          orders = await cursor.toArray();
      }
      console.log()
      res.send({
          count,
          orders
      })

  })

    // app.get('/riderUsersCollection/:email', async (req, res) => {
    //   const email = req.params.email
    //   const query = { email: email }
    //   const user = await riderUsersCollection.findOne(query)
    //   let isAdmin = false
    //   if (user?.role === "Admin") {
    //     isAdmin = true;
    //   }
    //   res.json({ admin: isAdmin })
    // })

    // POST API FOR CREATE PAYMENT
    app.post("/create-payment-intent", async (req, res) => {
      const paymentInfo = req.body;
      const amount = paymentInfo.price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        description: 'Software development services',
        payment_method_types: ["card"],
        shipping: {
          name: 'Jenny Rosen',
          address: {
            line1: '510 Townsend St',
            postal_code: '98140',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
          },
        },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    });

    // POST API FOR INSERT Riding User
    app.post("/riderUsersCollection", async (req, res) => {
      const query = req.body;
      const result = await riderUsersCollection.insertOne(query);
      res.json(result);
    });

    // POST API FOR INSERT ORDERS
    app.post("/orders", async (req, res) => {
      const query = req.body;
      const result = await ordersCollection.insertOne(query);
      res.json(result);
    });

    // POST API FOR INSERT Orders
    app.post("/packages", async (req, res) => {
      const query = req.body;
      const result = await ordersCollection.insertOne(query);
      res.json(result);
    });

    // POST API FOR INSERT Riding User
    app.post("/usersCollection", async (req, res) => {
      const query = req.body;
      const result = await usersCollection.insertOne(query);
      res.json(result);
    });

    // PUT METHOD
    app.put("/riderUsersCollection/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Edited",
        },
      };

      const result = await riderUsersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/riderUsersCollection", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "Admin" } };
      const result = await riderUsersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
          $set: {
              payment: payment
          }
      };
      const result = await ordersCollection.updateOne(filter, updateDoc);
      res.json(result);
  })
  } finally {
    // client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Surver running at http://localhost:${port}`);
});
