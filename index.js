const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Use the provided uri string
const uri = "mongodb+srv://sophan:sophan%40123@cluster0.r3agzsk.mongodb.net/?retryWrites=true&w=majority";

// Connect to the MongoDB Atlas database
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema for the image data
const imageSchema = new mongoose.Schema({
  name: String,
  desc: String,
  img: {
    data: Buffer,
    contentType: String
  }
});

// Create a model for the image data
const Image = mongoose.model('Image', imageSchema);

app.get('/', async (req, res) => {
  try {
    // Specify the database and collection
    const db = mongoose.connection.useDb('Stock');
    const users = db.collection('Users');

    // Find all images in the database
    const images = await users.find().toArray();

    // Generate an HTML response with the image data
    let html = '<h1>Images</h1>';
    for (const image of images) {
      html += `
        <h2>${image.name}</h2>
        <p>${image.desc}</p>
        <img src="data:${image.img.contentType};base64,${image.img.data.toString('base64')}">
      `;
    }
    res.send(html);
  } catch (err) {
    console.log(err);
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
