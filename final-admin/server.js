const app = require('./app')
const express = require('express')
const port = process.env.PORT || 9900;
const bodyParser = require('body-parser');
const session = require('express-session');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'myedurekaSecret',
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', './views');

const Newslist = require('./models/news_model');
const Contactuslist = require('./models/contact_model');

let sess;
app.get('/', (req, res) => {
    sess = req.session;
    sess.email = " "

    res.render('login', {
        invalid: req.query.invalid ? req.query.invalid : '',
        msg: req.query.msg ? req.query.msg : ''
    });

});
app.post('/api/addContactUs', (req, res) => {

    const record = req.body;
    Contactuslist.create(
        record, (err, data) => {
            if (err) return res.status(500).send('There was a problem registering user')
            return res.status(200).send("Inserted")
        }
    );
});

app.get('/api/getLatestNews', (req, res) => {
    Newslist.find({}).limit(3).sort({ insertTime: -1 }).exec((err, data) => {
        if (err) res.status(500).send(err)
        else res.json(data)
    });

});

const server = app.listen(port, () => {
    console.log('Media Application Admin Server listening on port ' + port);
});