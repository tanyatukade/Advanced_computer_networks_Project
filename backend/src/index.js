//import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// MongoDB driver
// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://username:password@chat-app-nnlbw.mongodb.net/test?retryWrites=true";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(async err => {
//   // perform actions on the collection object
//   const createUserPromise = await client.db("db").collection('users').insertOne([
//     // MongoDB adds the _id field with an ObjectId if _id is not present
//     { email: "aaa", password: "sss" },
//   ]).catch((err) => {
//     throw err;
//   });
//   // .then(async function (result)  {
//   //   await createUserPromise;
//   // });

// client.close();
// });
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const CONNECTION_URL = "mongodb+srv://username:password@chat-app-nnlbw.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "db";
var database;
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collectionUsers = database.collection("users");
        collectionServers = database.collection("servers");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});



// define the Express app
//const app = express();

// fake database
const rooms = []
const users = []

// enhance your app security with Helmet
app.use(helmet());

// use bodyParser to parse application/json content-type
app.use(bodyParser.json());

// enable all CORS requests
app.use(cors());

// log HTTP requests
app.use(morgan('combined'));



// app.get("/person/:id", (request, response) => {
//   collection.findOne({ "_id": new ObjectId(request.params.id) }, (error, result) => {
//       if(error) {
//           return response.status(500).send(error);
//       }
//       response.send(result);
//   });
// });




// insert a new question
app.post('/', (req, res) => {
  const { title, description } = req.body;
  if (rooms.filter((el) => el.title === title).length === 0) {
    const newRoom = {
      id: rooms.length + 1,
      title,
      description,
      messages: [],
    };
    rooms.push(newRoom);
    
    collectionServers.insert(req.body, (error, result) => {
      if(error) {
          return res.status(500).send(error);
      }
      res.send(result.result);
  });
    //res.status(200).send();
  }
  else {
    res.status(200).send("name existed");
  }
});

// sign up a user
// app.post('/Signup', (request, response) => {
//   collectionUsers.insert(request.body, (error, result) => {
//       if(error) {
//           return response.status(500).send(error);
//       }
//       response.send(result.result);
//   });
// });

// sign in the user
app.get('/Login', (req, res) => {
  console.log("email", req.query.email);
  collectionUsers.findOne({"email": req.query.email}, (error, result) => {
    if(error) {
      return response.status(500).send(error);
    }
    console.log("result", result);
    console.log("request query", req.query);

    if (result == null || result.password != req.query.password) {
      res.status(200).send("cannot find the user with this password");
    }
    else if (result != null && result.password == req.query.password) {
      console.log(result.password);
      console.log("sd"+req.query.password);
      res.send(result);
    }
    
  });
});

app.post('/Signup', (request, response) => {
  //const {email, password} = request.body;
  // can't do find in app.post?
  // PROBLEMS HERE!
  collectionUsers.findOne({"email": request.query.email}, (error, result) => {
    if(error) {
      return response.status(500).send(error);
    }
    //console.log(result.password);
    if (result == null){
      
      collectionUsers.insertOne(request.body, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        //console.log(result);
        response.send(result);
    });
    }
    else{
      response.status(200).send("user existed");
    }
  
})
});

// create a new user
// app.post('/Signup', (req, res) => {
//   const { email, password } = req.body;
//   if (users.filter((el) => el.email === email).length === 0) {
//     // to-do
//     const newUser = {
//       email,
//       password,
//     };
//     users.push(newUser);// later change it to pushing to database
//     // database try
//     client.db("db").collection('users').insertOne([
//       // MongoDB adds the _id field with an ObjectId if _id is not present
//       { email: newUser.email, password: newUser.password },
//     ])
//       .then(function (result) {
//         // process result
//       })

//     res.status(200).send();
//   }
//   else {
//     res.status(200).send("user existed");
//   }
// });

// retrieve all questions
app.get('/', (req, res) => {
collectionServers.find({}).toArray(function(err, result) {
  if (err) throw err;
  console.log(result);
  const rs = result.map(r => ({
    title:r.title,
    description: r.description
  }))
  res.send(rs);
  })
});
//   collectionServers.find({}, (error, result) => {
//     if(error) {
//       return res.status(500).send(error);
//     }
//     console.log(result);
//   //   const rs = res.map(r => ({
//   //     //id: r.id,
//   //     title: r.title,
//   //     description: r.description,
//   //     //messages: r.messages.length,
//   //   }));
//   //   console.log(req.query.title);
//   //   // res.send(rs);
//   // }
  
//   // )
// })});

// get a specific question
app.get('/:id', (req, res) => {
  const room = rooms.filter(r => (r.id === parseInt(req.params.id)));
  if (room.length > 1) return res.status(500).send();
  if (room.length === 0) return res.status(404).send();
  res.send(room[0]);
});



// insert a new answer to a question
app.post('/message/:id', (req, res) => {
  const { message } = req.body;

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