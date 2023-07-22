const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

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

app.get('/', (req, res) => {
  res.send(`
    <h1>Upload Image</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="text" name="name" placeholder="Name">
      <input type="text" name="desc" placeholder="Description">
      <input type="file" name="image">
      <button type="submit">Upload</button>
    </form>
  `);
});

app.post('/upload', upload.single('image'), async (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    res.status(400).send('No file uploaded');
    return;
  }

  // Create an object with the image data
  const obj = {
    name: req.body.name,
    desc: req.body.desc,
    img: {
      data: fs.readFileSync(path.join(__dirname, 'uploads', req.file.filename)),
      contentType: 'image/png'
    }
  };

  try {
    // Specify the database and collection
    const db = mongoose.connection.useDb('Stock');
    const users = db.collection('Users');

    // Insert the image data into the database
    await users.insertOne(obj);

    // Send a success message to the browser
    res.send('<p>Image uploaded successfully</p>');
  } catch (err) {
    console.log(err);
  }
});
app.get('/images', async (req, res) => {
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
