const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('./app/api-error');
const app = express();
const User = require('./app/models/User.js');
const mongoose = require("mongoose");
const contactRouter = require('./app/routes/contact.route');

mongoose.connect('mongodb://127.0.0.1:27017/contactbook', () => {
    console.log("Connected to DB (Authentication)");
});

app.get('/', (req, res) => {
    res.json({ message: "welcome to contact book application." });
});

app.use(cors());
app.use(express.json());
app.use('/api/contacts', contactRouter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//routes
app.post('/signup', (req, res, next) => {
    const newUser = new User({
        email: req.body.email,
        name: req.body.name,
        password: bcrypt.hashSync(req.body.password, 10)
    });
    newUser.save(err => {
        if (err) {
            return res.status(400).json({
                title: 'error',
                error: 'email in use'
            });
        }
        return res.status(200).json({
            title: 'signup success'
        });
    });
});
app.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) return res.status(500).json({
            title: 'server error',
            error: err
        });
        if (!user) {
            return res.status(401).json({
                title: 'user not found',
                error: 'invalid credentials'
            });
        }
        //incorrect password
        if (!bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(401).json({
                tite: 'login failed',
                error: 'invalid credentials'
            });
        }
        //IF ALL IS GOOD create a token and send to frontend
        let token = jwt.sign({ userId: user._id }, 'secretkey');
        return res.status(200).json({
            title: 'login sucess',
            token: token
        });
    });
});

//grabbing user info
app.get('/user', async (req, res, next) => {
    let token = req.headers.token; //token
    await jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) return res.status(401).json({
            title: 'unauthorized'
        });
        //token is valid
        User.findOne({ _id: decoded.userId }, (err, user) => {
            if (err) return console.log(err);
            return res.status(200).json({
                title: "user grabbed",
                user: {
                    email: user.email,
                    name: user.name
                }
            });
        });

    });
});
//handle 404 response
app.use((req, res, next) => {
    return next(new ApiError(404, "resource not found"));
});
// define error-handling  middleware last, after other app.use() and routes calls
app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || 'internal server error',
    });
});


module.exports = app;