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
    db.select('email', 'hash')
        .from('login')
        .where('email', '=', req.body.email)
        .then((data) => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if(isValid) {
                return db.select('*')
                    .from('users')
                    .where('email', '=', req.body.email)
                    .then((user) => {
                        console.log(user)
                        res.json(user[0]);
                    })
                    .catch((err) => res.status(400).json('unable to get user'))
            } else {
                res.status(400).json('wrong credentials')
            }
        })
        .catch(err => res.status(400).json('wrong credentials'))
});
app.post('/register', (req, res) => { 
    const {name, email, password} = req.body;
    // Hashing password
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0].email,
                name: name,
                joined: new Date()
            })
            .then(user => {
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
});
app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0].entries);
        })
});
// Server on
app.listen(3001, (err) =>{
    if(err) return console.log('error', err);
    console.log('server listening');
});