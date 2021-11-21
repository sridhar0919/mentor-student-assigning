const { ObjectId } = require('bson');
var express = require('express');
var router = express.Router();
const { dbUrl, mongodb, MongoClient } = require('../dbConfig');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// create student
router.post('/create', async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db('mentor-student-assigning');
    const student = await db.collection('students').insertMany(req.body);
    res.send({
      message: 'student created',
      details: student,
    });
  } catch (e) {
    console.log(e);
    res.send({
      message: 'Error in connection',
    });
  } finally {
    client.close();
  }
});

// Assign mentor
router.put('/assign-mentor/:id', async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db('mentor-student-assigning');

    const updateStudent = await db
      .collection('students')
      .updateOne(
        { _id: ObjectId(req.params.id) },
        { $set: { mentor_assigned: 'yes' } }
      );
    const student = await db
      .collection('students')
      .findOne({ _id: ObjectId(req.params.id) });
    const mentor = await db
      .collection('mentors')
      .updateOne(
        { _id: ObjectId(req.body.id) },
        { $push: { students_assigned: student } }
      );
    res.send({
      message: 'Mentor assigned successfully',
    });
  } catch (e) {
    console.log(e);
    res.send({
      message: 'Error in connection',
    });
  } finally {
    client.close();
  }
});

module.exports = router;
