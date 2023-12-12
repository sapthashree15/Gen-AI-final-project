const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3030;

app.use(bodyParser.json());

// MongoDB connection
const username = 'sapthashreek';
const password = 'MjY4NTItc2FwdGhh';
const host = '127.0.0.1';
const port = '27017';
const databaseName = 'courses'; // Replace with your actual database name

const connectionString = `mongodb://${username}:${password}@${host}:${port}/${databaseName}`;

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
  initializeData(); // Call the function to initialize data from courses.json
});

// Define Mongoose schema
const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
});

// Create Mongoose model
const Course = mongoose.model('Course', courseSchema);

// Function to initialize data from courses.json
function initializeData() {
  const coursesData = fs.readFileSync('courses.json', 'utf-8');
  const coursesArray = JSON.parse(coursesData);

  // Insert data into MongoDB
  Course.insertMany(coursesArray, (error, result) => {
    if (error) {
      console.error('Error initializing data:', error);
    } else {
      console.log('Data initialized successfully:', result);
    }
  });
}

// CRUD endpoints

// Create (add a new course)
app.post('/courses', async (req, res) => {
  try {
    const newCourse = await Course.create(req.body);
    res.json(newCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read (get all courses)
app.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read (get one course by ID)
app.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update (update one course by ID)
app.put('/courses/:id', async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete (delete one course by ID)
app.delete('/courses/:id', async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(deletedCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
