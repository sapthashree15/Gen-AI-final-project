const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;
const mongoUrl = 'mongodb://sapthashreek-8081.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai';

const dbName = 'learning-platform';
const collectionName = 'courses';

app.use(express.json());

// Connect to the MongoDB database
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Create a new course
    app.post('/courses', (req, res) => {
      const { name, description } = req.body;
      const newCourse = { name, description };

      collection.insertOne(newCourse)
        .then(result => {
          res.status(201).json(result.ops[0]);
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Error creating the course');
        });
    });

    // Get all courses
    app.get('/courses', (req, res) => {
      collection.find().toArray()
        .then(courses => {
          res.json(courses);
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Error getting the courses');
        });
    });

    // Get a specific course
    app.get('/courses/:id', (req, res) => {
      const courseId = req.params.id;

      collection.findOne({ _id: ObjectId(courseId) })
        .then(course => {
          if (course) {
            res.json(course);
          } else {
            res.status(404).send('Course not found');
          }
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Error getting the course');
        });
    });

    // Update a course
    app.put('/courses/:id', (req, res) => {
      const courseId = req.params.id;
      const { name, description } = req.body;
      const updatedCourse = { name, description };

      collection.findOneAndUpdate(
        { _id: ObjectId(courseId) },
        { $set: updatedCourse },
        { returnOriginal: false }
      )
        .then(result => {
          if (result.value) {
            res.json(result.value);
          } else {
            res.status(404).send('Course not found');
          }
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Error updating the course');
        });
    });

    // Delete a course
    app.delete('/courses/:id', (req, res) => {
      const courseId = req.params.id;

      collection.findOneAndDelete({ _id: ObjectId(courseId) })
        .then(result => {
          if (result.value) {
            res.json(result.value);
          } else {
            res.status(404).send('Course not found');
          }
        })
        .catch(error => {
          console.error(error);
          res.status(500).send('Error deleting the course');
        });
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(error => {
    console.error('Error connecting to the database:', error);
  });
