const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Set the Content Security Policy header
app.use((req, res, next) => {
  res.set({
    "Content-Security-Policy": "default-src 'self'; font-src 'self' data:; img-src 'self' data:; style-src 'self' https://cdn.jsdelivr.net;"
  });
  next();
});

// Use the provided uri string
const uri = "mongodb+srv://sophan:sophan%40123@cluster0.r3agzsk.mongodb.net/?retryWrites=true&w=majority";

// Connect to the MongoDB Atlas database
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema for the image data
const imageSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  img: {
    data: Buffer,
    contentType: String
  }
});

// Create a model for the image data
const Image = mongoose.model('Image', imageSchema);

app.get('/', (req, res) => {
  res.send(`
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
      <h1 class="text-4xl font-bold text-center my-8">Upload Image and Data</h1>
      <form action="/upload" method="post" enctype="multipart/form-data" class="flex flex-col items-center">
        <input type="text" name="name" placeholder="Name" class="border border-gray-300 rounded-md p-2 my-2">
        <input type="number" name="price" placeholder="Price" class="border border-gray-300 rounded-md p-2 my-2">
        <input type="number" name="quantity" placeholder="Quantity" class="border border-gray-300 rounded-md p-2 my-2">
        <input type="file" name="image" class="my-2">
        <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-4">Upload</button>
      </form>
    </body>
    <h1 class="text-4xl font-bold text-center my-8">Buyer List</h1>
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
    price: req.body.price,
    quantity: req.body.quantity,
    img: {
      data: fs.readFileSync(path.join(__dirname, 'uploads', req.file.filename)),
      contentType: 'image/png'
    }
  };

  try {
    // Specify the database and collection
    const db = mongoose.connection.useDb('Fruit');
    const users = db.collection('Fruits');

    // Insert the image data into the database
    await users.insertOne(obj);

    // Send a success message to the browser
res.send('<p>Image uploaded successfully. <a href="/">Go back</a></p>');

  } catch (err) {
    console.log(err);
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
