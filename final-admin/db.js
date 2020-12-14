require('dotenv').config();
const mongoose = require('mongoose');

const mongodb_url = process.env.MongoDB_Atlas;

mongoose.connect(mongodb_url, { useNewUrlParser: true }).then(() => {
    console.log("Connected to Database");
}).catch((err) => {
    console.log("Not Connected to Database ERROR! ", err);
});