var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//const {connection}=require('./connection');
//const authentication = require("./routes/Authentication");
const cors = require("cors");
const jwt = require("jsonwebtoken");

var usersRouter = require('./routes/Users');

var app = express();
const isAuthenticated = (req, res, next) => {  
  if(req?.headers?.authtoken){
    try{
        const user = jwt.verify(req?.headers?.authtoken, process.env.SECRET_KEY);  
        // console.log(user)
        if (user?.username){
          req.user = user
          next();
        } 
    }catch(error){
      if(error instanceof jwt.TokenExpiredError){
        res.status(401).json({message:"Unauthorized"});
        res.send("/")
      }  else res.status(400).json({message:"Token Expired"})
    }
  }else res.status(400).json({message:"Token is missing"});
  
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors({
  credentials:true
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/*app.use(authentication);
app.use('/api/users', isAuthenticated,usersRouter);
app.use('/api/admin',isAuthenticated,adminRouter)*/

app.use('/api/user',usersRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log('envir: ',req.app.get('env'))
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
