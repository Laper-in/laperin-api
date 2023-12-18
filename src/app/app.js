var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('../routes/index');
var usersRouter = require('../routes/users');
var recipesRouter = require('../routes/recipes');
var ingredientRouter = require('../routes/ingredients');
var bookmarkRouter = require('../routes/bookmarks');
var donationRouter = require('../routes/donations');
var cicdRouter = require('../routes/cicd');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/recipes', recipesRouter);
app.use('/ingredients', ingredientRouter);
app.use('/bookmarks', bookmarkRouter);
app.use('/donations', donationRouter);
app.use('/cicd', cicdRouter);

// console.log('GCLOUD_PROJECT:', process.env.GCLOUD_PROJECT);
// console.log('GCS_KEYFILE:', process.env.GCS_KEYFILE);
// console.log('GCS_BUCKET:', process.env.GCS_BUCKET);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
