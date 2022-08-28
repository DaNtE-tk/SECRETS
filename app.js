//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
require('dotenv').config();

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();


// console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

// session configuration
app.use(session({
  secret: "thisisasecretkeyqwerty",
  resave: false,
  saveUninitialized: false
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// /////   DATABASE //////////
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email:String,
  password:String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', function(req, res){
  res.render('home');
});

app.get('/login', function(req, res){
  res.render('login');
});

app.get('/register', function(req, res){
  res.render('register');
});

app.get('/secrets', function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

app.post('/register', function(req, res){
try{
  User.register({username:req.body.username},req.body.password, function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets");
      });
    }
  });
}catch(err){
  console.log(err);
}
});

app.post('/login', function(req, res){
  try{
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
    req.login(user, function(err){
      if(err){
        console.log(err);
      }
      else{
        passport.authenticate("local")(req,res, function(){
          res.redirect("/secrets");
        });
      }
    });
  }catch(err){
    console.log(err);
  }

});

app.get('/logout', function(req, res){
  req.logout(function(err) {
    if (err) {
       return next(err);
     }
  res.redirect('/');
}
)});

app.listen(3000, function(){
  console.log("<--------------Server listening on port:3000-------------->");
});
