var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./api/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser());

app.use('/', indexRouter);

module.exports = app;
