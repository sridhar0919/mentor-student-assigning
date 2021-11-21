const { ObjectId } = require('bson');
var express = require('express');
var router = express.Router();
const { dbUrl, mongodb, MongoClient } = require('../dbConfig');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// create mentor
router.post('/create', async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db('mentor-student-assigning');
    const mentor = await db.collection('mentors').insertMany(req.body);
    res.send({
      message: 'mentor created',
      details: mentor,
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

// Assigning students to mentor
router.put('/assign-students/:id', async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db('mentor-student-assigning');
    // To fetch students
    let getStudent = async () => {
      let content = await db
        .collection('students')
        .find({
          _id: {
            $in: [ObjectId(`${req.body[0].id}`), ObjectId(`${req.body[1].id}`)],
          },
        })
        .toArray();
      return content;
    };

    let students = await getStudent();

    // Update mentor_assigned field
    students.forEach(async (elem) => {
      if (elem.mentor_assigned === 'no') {
        let stud = await db.collection('students').updateOne(
          {
            _id: ObjectId(elem._id),
          },
          { $set: { mentor_assigned: 'yes' } }
        );
      }
    });

    // Getting updated student list
    let newStudents = await getStudent();

    //Updating student list in mentor collection
    const data = await db.collection('mentors').updateOne(
      { _id: ObjectId(req.params.id) },
      {
        $push: { students_assigned: newStudents },
      }
    );

    res.send({
      message: 'students added successfully',
    });
  } catch (e) {
    console.log(e);
    res.send({
      message: 'Error in connection',
    });
  }
});

module.exports = router;
