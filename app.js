// Dependencies
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : 'fab',
      password : '',
      database : 'smartbrain'
    }
  });
  
// Middleware
app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(bodyParser.json());
// mockdata
const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date() 
        }
    ]
}
// Routes
app.get('/', (req, res) => {
    res.json(database.users);
});
app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id) {
            found = true;
            return res.json(user);
        }
    })
    if(!found) {
        res.status(400).json('user not found');
    }
});
app.post('/signin', (req, res) => {
    if(req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
        res.json(database.users[0]);
    } else {
        res.status(400).json('error loggin in');
    }
});
app.post('/register', (req, res) => { 
    const {name, email, password} = req.body;
    // Hashing password
    bcrypt.hash(password, null, null, function(err, hash) {
        console.log(hash);
    });
    database.users.push({
        id: '224',
        name: name,
        email: email,
        entries: 0,
        joined: new Date()
    });
    res.json(database.users[database.users.length-1]);
});
app.put('/image', (req, res) => {
    const { id } = req.body;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id) {
            found = true;
            user.entries++;
            return res.json(user.entries);
        }
    })
    if(!found) {
        res.status(400).json('user not found');
    }
});
// Server on
app.listen(3001, (err) =>{
    if(err) return console.log('error', err);
    console.log('server listening');
});