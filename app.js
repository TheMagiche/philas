const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const DB = require('./configs/db');
const fileupload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const app = express();


const admin = require("firebase-admin");

const serviceAccount = require("./configs/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const dotenv = require('dotenv');
dotenv.config();



DB.client();

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());
// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.disable('etag').disable('x-powered-by');

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Set routes paths
app.use('/api/users', require('./routes/users'));

// Handle SPA after all other API routes has been added to express route table. If this comes before
// adding API routes, all requests will be forwarded to client side for routing and none of your routes will be called
app.use(express.static(__dirname + '/public/'));
app.get(/.*/, (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
if (process.env.NODE_ENV === 'production') {
    // Statiic folder
    app.use(express.static(__dirname + '/public/')); // Set up public folder
    // Handle SPA
    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, 'public/index.html'));
    });
}
module.exports = app;