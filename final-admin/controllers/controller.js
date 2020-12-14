const express = require('express');
const router = express.Router();

const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./scratch');

const config = require('../config.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const User = require('../models/user_model');
const Newslist = require('../models/news_model');

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

const session = require('express-session');
router.use(session({ secret: 'myEdurekaSecret1', resave: false, saveUninitialized: true }));

router.post('/login', (req, res) => {

    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) return res.status(500).send('Error on the server.');
        let htmlMsg;
        if (!user) {
            htmlMsg = encodeURIComponent('Email not found, try again ...');
            res.redirect('/?invalid=' + htmlMsg);
        } else {
            const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
            if (!passwordIsValid) {
                return res.status(401).send({ auth: false, token: null });
            }

            var token = jwt.sign({ id: user._id }, config.secret, {
                expiresIn: 86400
            });
            localStorage.setItem('authtoken', token);

            res.redirect(`/admin/newsForm`);
        }
    });
});

router.get('/logout', (req, res) => {
    localStorage.removeItem('authtoken');
    res.redirect('/');
})

router.get('/newsForm', (req, res) => {
    const token = localStorage.getItem('authtoken')
    if (!token) {
        res.redirect('/');
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) { res.redirect('/') }
        User.findById(decoded.id, { password: 0 }, (err, user) => {
            if (err) { res.redirect('/') }
            if (!user) { res.redirect('/') }
            res.render('newsform', {
                user,
                msg: req.query.msg ? req.query.msg : ''
            });
        })
    })
})

router.get('/getNews', (req, res) => {
    const token = localStorage.getItem('authtoken');
    if (!token) {
        res.redirect('/');
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) { res.redirect('/'); }
        User.findById(decoded.id, { password: 0 }, (err, user) => {
            if (err) { res.redirect('/') }
            if (!user) { res.redirect('/') }
            Newslist.find({}, (err, data) => {
                if (err) res.status(500).send(err)
                else {
                    res.render('newstable', {
                        user,
                        data
                    })
                }
            })

        })
    })
})

router.post('/find_by_id', (req, res) => {
    const id = req.body.id
    Newslist.find({ _id: id }, (err, data) => {
        if (err) res.status(500).send(err)
        else {
            res.send(data)
        }
    })
})

router.put('/updateNews', (req, res) => {
    const id = req.body.id
    Newslist.findOneAndUpdate({ _id: id }, {
        $set: {
            title: req.body.title,
            description: req.body.description,
            url: req.body.url,
            urlToImage: req.body.urlToImage,
            publishedAt: req.body.publishedAt,
            insertTime: Date.now()
        }
    }, {
        upsert: true
    }, (err, result) => {
        if (err) return res.send(err)
        res.send("Updated ...")
    })
})

router.delete('/deleteNews', (req, res) => {
    const id = req.body.id
    Newslist.findOneAndDelete({ _id: id }, (err, result) => {
        if (err) return res.status(500).send(err)
        res.send({ message: 'deleted ...' })
    })
})

router.post('/addNews', (req, res) => {
    const token = localStorage.getItem('authtoken')
    if (!token) {
        res.redirect('/')
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) { res.redirect('/') }
        User.findById(decoded.id, { password: 0 }, (err, user) => {
            if (err) { res.redirect('/') }
            if (!user) { res.redirect('/') }
            const d = Date.now()
            const news = {...req.body, insertTime: d }
            Newslist.create(
                news, (err, data) => {
                    if (err) return res.status(500).send('There was a problem registering user')
                    const htmlMsg = encodeURIComponent('Added News DONE !');
                    res.redirect('/admin/newsForm/?msg=' + htmlMsg)
                })

        })
    })
})

router.post('/register', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) return res.status(500).send('Error on the server.');
        let htmlMsg
        if (!user) {
            const hashedPasword = bcrypt.hashSync(req.body.password, 8);
            User.create({
                name: req.body.name,
                email: req.body.email,
                password: hashedPasword,
            }, (err, user) => {
                if (err) return res.status(500).send('There was a problem registering user')
                htmlMsg = encodeURIComponent('Registered OK !');
                res.redirect('/?msg=' + htmlMsg)
            })
        } else {
            htmlMsg = encodeURIComponent('This email is already registered, please enter a new one ...');
            res.redirect('/?msg=' + htmlMsg);
        }
    })
})

module.exports = router;