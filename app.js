//jshint esversion:6
require('dotenv').config();
const express= require("express");
const mongoose= require("mongoose");
const bodyParser= require("body-parser");
const ejs= require("ejs");
const encrypt= require("mongoose-encryption");

const app= express();

//Mongoose setup
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

// Schema
// mongoose encryption requires a different way of declaring schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// Encryption secrets

userSchema.plugin(encrypt, {secret: proces.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));

app.get("/register", function(req, res){
  res.render("register");
})

app.post("/register", function(req, res){
  const newUser= new User ({
    email: req.body.username,
    password: req.body.password
  })

  newUser.save(function(err){
    if (err){
      console.log(err);
        }
    else {
      res.render("secrets");
    }
  })
})

app.get("/", function(req, res){
  res.render("home");
})

app.get("/secrets", function(req, res){
  res.render("secrets");
})

app.get("/submit", function(req, res){
  res.render("submit");
})

app.get("/login", function(req, res){
  res.render("login");
})

app.post("/login", function(req, res){
  const userName= req.body.username;
  const password= req.body.password;

  User.findOne({email: userName}, function(err, foundUser){
    if (err){
      console.log(err);
    }
    else {
      if (foundUser.password === password){
        res.render("secrets");
      }
    }
  })
})

app.listen(3000, function(){
  console.log("Server started on port 3000");
})
