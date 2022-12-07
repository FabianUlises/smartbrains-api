// Dependencies
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const db = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'password123',
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
    res.json('index route');
});
app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*')
        .from('users')
        .where({id})
            .then(user => {
                if(user.length) {
                    res.json(user[0]);
                } else {
                    res.status(400).json('Not found');
                }
            })
            .catch(err => res.status(400).json('Not found')
            );

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
    db('users')
        .returning('*')
        .insert({
            email: email,
            name: name,
            joined: new Date()
        })
        .then(user => {
            res.json(user[0]);
        })
        .catch(err => 
            res.status(400)
            .json('unable to login')
        );
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