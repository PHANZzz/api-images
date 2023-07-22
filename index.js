const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const cors = require('cors');
app.use(cors());
const { MongoClient, ServerApiVersion } = require('mongodb');

// Replace with your MongoDB connection string
const uri = "mongodb+srv://sophan:sophan%40123@cluster0.r3agzsk.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db('Stock');
    const usersCollection = db.collection('Users');

    // Read the file from the file system
    const fileData = fs.readFileSync(req.file.path);

    // Insert the image into the database
    await usersCollection.insertOne({
      image: fileData
    });

    // Get a list of uploaded images
    const images = await usersCollection.find().toArray();

    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while uploading the image');
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.get('/images', async (req, res) => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db('Stock');
    const usersCollection = db.collection('Users');

    // Get a list of uploaded images
    const images = await usersCollection.find().toArray();

    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while retrieving the list of images');
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
