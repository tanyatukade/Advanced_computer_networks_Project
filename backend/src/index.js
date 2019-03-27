//import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// define the Express app
const app = express();

// the database
const rooms = []

// enhance your app security with Helmet
app.use(helmet());

// use bodyParser to parse application/json content-type
app.use(bodyParser.json());

// enable all CORS requests
app.use(cors());

// log HTTP requests
app.use(morgan('combined'));

// retrieve all questions
app.get('/', (req, res) => {
  const rs = rooms.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    messages: r.messages.length,
  }));
  res.send(rs);
});

// get a specific question
app.get('/:id', (req, res) => {
  const room = rooms.filter(r => (r.id === parseInt(req.params.id)));
  if (room.length > 1) return res.status(500).send();
  if (room.length === 0) return res.status(404).send();
  res.send(room[0]);
});

// insert a new question
app.post('/', (req, res) => {
  const {title, description} = req.body;
  //console.log(rooms[title].includes({title}));
  console.log("hi");
  if(rooms.filter((el) => el.title === title).length === 0){
    //console.log(rooms[title].includes({title}));
  // check if chat room already existed (title === title)
  // to-do
  const newRoom = {
    id: rooms.length + 1,
    title,
    description,
    messages: [],
  };
  rooms.push(newRoom);// later change it to pushing to database
  res.status(200).send();
}
  else{
    res.status(200).send("name existed");
    
  }
});

// insert a new answer to a question
app.post('/message/:id', (req, res) => {
  const {message} = req.body;

  const room = rooms.filter(r => (r.id === parseInt(req.params.id)));
  if (room.length > 1) return res.status(500).send();
  if (room.length === 0) return res.status(404).send();

  room[0].messages.push({ // change later 
    message,
  });

  res.status(200).send();
});

// start the server
app.listen(8081, () => {
  console.log('listening on port 8081');
});