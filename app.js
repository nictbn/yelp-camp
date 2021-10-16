const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
let Campground;
Campground = require('./models/campground');
mongoose.connect('mongodb://localhost:27017/yelp-camp').then(() => console.log('Mongo connection')).catch((error) => console.log(error));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/makeCampground', async (req, res) => {
    const camp = new Campground({
        title: 'My Backyard',
        description: 'Cheap Camping!'
    });
    await camp.save();
    res.send(camp);
})
const port = 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
