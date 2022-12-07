const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(' home stub route')
});
app.listen(3001, (err) =>{
    console.log('server listening');
});