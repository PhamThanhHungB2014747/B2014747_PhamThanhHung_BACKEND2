const express = require('express');
const cors = require('cors');

const ApiError = require('./app/api-error');

const app = express();

app.get('/', (req, res) => {
    res.json({ message: "welcome to contact book application." });
});

const contactRouter = require('./app/routes/contact.route');

app.use(cors());
app.use(express.json());
app.use('/api/contacts', contactRouter);

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