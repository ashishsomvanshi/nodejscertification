const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
require('babel-polyfill');
const path = require('path');
const http = require('http');

const iplocate = require("node-iplocate");
const publicIp = require('public-ip');
require('./db');
const Newslist = require('./models/news_model');
const Contactuslist = require('./models/contact_model');

const app = express();
app.set('port', process.env.PORT || 9901);
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.set('view engine', 'ejs');
app.set('views', './views');
const userloc = async() => {
    try {
        const ip = await publicIp.v4()
        console.log("ip : ", ip)
        return await iplocate(ip)
    } catch (err) {
        console.log(err)
    }
};

const getWeather = async(lon, lat) => {
    const apikey = '88425ec115e457b60587d626b35726c3'
    const apiUrl = `http://api.openweathermap.org/data/2.5/weather?lon=${lon}&lat=${lat}&appid=${apikey}&units=metric`
    try {
        return await axios.get(apiUrl)
    } catch (err) {
        console.log(err)
    }
};

app.get('/', (req, res) => {

    userloc().then((loc) => {
        const lon = loc.longitude
        const lat = loc.latitude
        getWeather(lon, lat).then((response) => {
            const weather = {
                description: response.data.weather[0].main,
                icon: "http://openweathermap.org/img/w/" + response.data.weather[0].icon + ".png",
                temperature: response.data.main.temp,
                temp_min: response.data.main.temp_min,
                temp_max: response.data.main.temp_max,
                city: response.data.name
            }

            Newslist.find({}).limit(3).sort({ insertTime: -1 }).exec((err, data) => {
                console.log(err)
                const news = data
                res.render('home', {
                    weather,
                    news
                })
            })

        })
    })
});

app.get('/sports', (req, res) => {

    const d = new Date().toISOString()
    const today = d.substring(0, 10)
    const apiUrl = 'https://newsapi.org/v2/top-headlines'
    axios.get(apiUrl, {
            params: {
                sources: 'espn, nfl-news, the-sport-bible',
                from: today,
                sortBy: 'popularity',
                language: 'en',
                apiKey: 'Mca6fe71f4b8a49c6b0194d94884b6839'
            }
        })
        .then((response) => {
            const data = response.data.articles
            res.render('sports', { data })
        })
        .catch(function(error) {
            console.log(error);
        })
});

app.get('/aboutus', (req, res) => {
    res.render('aboutus')
});

app.get('/contactus', (req, res) => {
    res.render('contactus', {
        msg: req.query.msg ? req.query.msg : ''
    })
});

app.post('/addContactUs', (req, res) => {
    console.log("/addContactUs : req.body : ", req.body)

    const record = req.body
    Contactuslist.create(
        record, (err, data) => {
            if (err) {
                const htmlMsg = encodeURIComponent('Error : ', error);
                res.redirect('/contactus/?msg=' + htmlMsg)
            } else {
                const htmlMsg = encodeURIComponent('ContactUs Message Saved OK !');
                res.redirect('/contactus/?msg=' + htmlMsg)
            }

        })

});

const server = http.createServer(app).listen(app.get('port'), () => {
    console.log("Media Application listening on port " + app.get('port'));
});

const io = require('socket.io')(server);

let users = []
io.on('connection', (socket) => {

    socket.on('connect', () => {
        console.log("New connection socket.id : ", socket.id)
    })

    socket.on('disconnect', () => {
        const updatedUsers = users.filter(user => user != socket.nickname)
        users = updatedUsers
        io.emit('userlist', users)
    })

    socket.on('nick', (nickname) => {
        socket.nickname = nickname
        users.push(nickname)
        io.emit('userlist', users);
    });

    socket.on('chat', (data) => {
        const d = new Date()
        const ts = d.toLocaleString()
        const response = `${ts} : ${socket.nickname} : ${data.message}`
        io.emit('chat', response)
    });
});