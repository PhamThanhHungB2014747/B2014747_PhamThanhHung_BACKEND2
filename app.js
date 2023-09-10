const express = require('express');
const cors = require('cors');
// const mongoose = require("mongoose");

const ApiError = require('./app/api-error');

// mongoose.connect('mongodb://127.0.0.1:27017/contactbook', () => {
//     console.log("Connected to DB (Authentication)");
// });

const app = express();

const contactsRouter = require('./app/routes/contact.route');

app.use(cors());
app.use(express.json());
app.use("/api/contacts", contactsRouter);

//handle 404 response
app.use((req, res, next) => {
    // code ở đây sẽ chạy khi không có route được định nghĩa nào
    //      khớp với yêu cầu. Gọi next() để chuyển sang middleware xử lý lỗi
    return next(new ApiError(404, "resource not found"));
});

// define error-handling  middleware last, after other app.use() and routes calls
app.use((err, req, res, next) => {
    // middleware xử lý lỗi tập trung
    // trong các đoạn code xử lý ở các route, gọi next(error)
    //      sẽ chuyển về middleware xử lý lỗi này
    return res.status(err.statusCode || 500).json({
        message: err.message || 'internal server error',
    });
});

app.get("/", (req, res) => {
    res.json({ message: "welcome to contact book application." });
});

module.exports = app;