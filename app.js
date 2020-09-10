//jshint esversion:6
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

// Setting up ejs template
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// This is retarded- remove this
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

// Setting up user security - OAuth 2.0
app.use(passport.initialize());
app.use(passport.session());

// Connecting to local host - shift to Atlas soon
mongoose.connect("mongodb://localhost:27017/SecretsDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

// Registers users
const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("User", userSchema);

// Individual task manager rooms for lockin, exec meetings, private meetings for lon etc

const roomSchema = new mongoose.Schema({
  link: String,
  password: String,
  tasks: [{
    id: String,
    name: String,
    user: String
  }],
  admin: String,
  dateCreated: String
})


const Room = new mongoose.model("Room", roomSchema);

passport.use(User.createStrategy());

// Password encryption
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// Setting up routes through express

//Register page /////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/", function(req, res){
  res.render("home");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/secrets");
  });

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});


app.get("/submit", function(req, res){
  if (req.isAuthenticated()){
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});



app.post("/submit", function(req, res){
  const submittedSecret = req.body.secret;
  User.findById(req.user.id, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(function(){
          res.redirect("/secrets");
        });
      }
    }
  });
});

// Home Page /////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/secrets", function(req, res){
  console.log(req._passport.session.user);
  if (typeof req.user=='undefined'){
    res.redirect("login");
   }
   else {
     const userId= req.user.username;
    res.render("secrets", {username: userId});
   }
});

app.post("/secrets", function(req, res){
  if (req.body.create){
    Room.findOne({link: "/secrets/:" + req.body.roomid}, function(err, result){
      if (result){
        res.redirect(result.link);
      }
      if (!result){


        const roomLink= new Room({
            link: "/secrets/:" + req.body.roomid,
            password: req.body.password,
            tasks: [{
              id: "one",
              name: "Please enter tasks below",
              user: req.body.create
            }],
            admin: req.body.create,
            dateCreated: new Date().toISOString().slice(0, 10) // for Date Assigned
        });
        roomLink.save();
        res.redirect("/secrets/:" + req.body.roomid);
      }
      if (err){
        console.log(err);
      }
    })
    }

if (req.body.join) {

  Room.find({link: "/secrets/:" + req.body.roomid}, function(err, results){
    if (results.length==0){
      res.redirect("secrets");
    }
    if (results.length>0){
      res.redirect("/secrets/:"+ req.body.roomid);
      console.log("Exists");
    }
  });
  }
});

// Custom routes for individial task manager rooms /////////////////////////////////////////////////////////////////////////////////////////////////////

 app.get("/secrets/:customRoomName", function(req, res){
   const user= req.user.username;
   const customRoomName= req.params.customRoomName;
   Room.findOne({link: "/secrets/" + customRoomName}, function(err, result){
     if (!err){
       res.render("room", {userName: user, roomId: result.link, date: result.dateCreated, adminId: result.admin, tasks: result.tasks});
     }

 })
})



app.post("/", function(req, res){
  const customRoomlink= req.body.roomId;
  Room.findOneAndUpdate({link:customRoomlink},
    {$push: {tasks: {id: Math.floor(1000000000 + Math.random() * 9000000000),
      name: req.body.newItem,
      user: req.user.username
    }}},
    function(err, addedItem){
      if (!err){
        res.redirect(req.body.roomId);
      }
    }
  )
})

app.post("/delete", function(req, res){
  const customRoomLink= req.body.roomId;
  const checkedItemId= req.body.box;
  Room.findOneAndUpdate(
          {link: customRoomLink},
          {$pull: {tasks: {id: checkedItemId}}},
          function (err, removedItem){
            if (!err){
              res.redirect(customRoomLink);
            }
          }
        )
})


// Logging out //////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

//////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
