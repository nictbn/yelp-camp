const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')
let Campground;
Campground = require('./../models/campground');
mongoose.connect('mongodb://localhost:27017/yelp-camp').then(() => console.log('Mongo connection')).catch((error) => console.log(error));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});
const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDb = async () => {
    await Campground.deleteMany();
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20 + 10);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Paleo meh disrupt, banjo officia labore cupidatat ethical. Cray seitan keytar PBR&B. Ennui narwhal bespoke laboris. Qui eu normcore occupy direct trade single-origin coffee umami banh mi twee do gastropub truffaut. Consequat laboris helvetica, ennui selvage williamsburg blog roof party sustainable glossier ethical messenger bag. 90\'s ugh authentic esse, palo santo exercitation actually edison bulb health goth subway tile kombucha.',
            price: price,
        });
        await camp.save();
    }
}

seedDb().then(() => mongoose.connection.close());
