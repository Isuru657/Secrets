////////////////////////////////////////////////////////////////////////////////////////////////
// Author: Isuru Abeysekara
// Description: This script will handle client and server side communication in the web app
//
////////////////////////////////////////////////////////////////////////////////////////////////


// Required packages are installed here
// The four core packages used are:
// a) express: to handle routing
// b) mongoose: to exploit a MongoDB database collection
// c) ejs: to handle client-side rendering
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require('express-session');

// allows logins through social media

const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

// Setting up ejs template- tells express to find html templates in the public folder

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

// Setting up user security - OAuth 2.0

app.use(passport.initialize());
app.use(passport.session());

// Connecting to local host - shift to Atlas soon

mongoose.connect("mongodb+srv://admin-isuru:Asha123@cluster0.i1kld.mongodb.net/Secrets?retryWrites=true&w=majority", {useUnifiedTopology: true });
//mongoose.connect("mongodb://localhost:27017/SecretsDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

////////////////////////////////////////////////////////////////////////////////////////////////
// Key Schemas used in the app
// The User Schema helps capture data on users that would use this web app
// The Room Schema helps capture data on posting rooms that users create
////////////////////////////////////////////////////////////////////////////////////////////////

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

const roomSchema = new mongoose.Schema({
  link: String,
  password: String,
  tasks: [{
    id: String,
    name: String,
    user: String
  }],
  admin: String,
  dateCreated: String,
  taskComplete: Number
})


const Room = new mongoose.model("Room", roomSchema);

passport.use(User.createStrategy());

// Password encryption for user security
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
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Setting up routes through expresss
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Get method for home page
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



// Methods for register page
// This page relies heavily on the user schema and user's collection. Explained below.

// Get method

app.get("/register", function(req, res){
  res.render("register");
});

// Post method - it will check the user collection to see if the registering user exists and if not it will save
// the new user's information in the collection after which the use is redirected to the secrets page.

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

// Methods for the login page
// This page relies heavily on the user schema too.

// Get method

app.get("/login", function(req, res){
  res.render("login");
});

// Post method - it will check the user collection to see if the user's credentials exists in the collection.
// If yes, the user is redirected to the secrets page.

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

// Methods for the Main Page
// This page relies primary on the Room Collection to capture data on individual rooms that users create

// Get method- Passes over user credentials from the login/register pages

app.get("/secrets", function(req, res){

  if (typeof req.user=='undefined'){
    res.redirect("login");
   }
   else {
     const userId= req.user.username;
    res.render("secrets", {username: userId});
   }
});

// The post method checks if the room that the created room exists in the database first, and if the room does not exist, it will create a new room
// create and join elements in the request's body is to help the method separate between attempts the user engages in to create rooms and join existing
// rooms.

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
              name: "Please enter issues that concern you below",
              user: req.body.create
            }],
            admin: req.body.create,
            dateCreated: new Date().toISOString().slice(0, 10), // for Date Assigned
            taskComplete: 0
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


// Methods for user created rooms
// Taking advantage of expresses ability to create custom routes on the fly, the get
// method retrieves room links from the Room Collection

// Get method
 app.get("/secrets/:customRoomName", function(req, res){
   const user= req.user.username;
   const customRoomName= req.params.customRoomName;
   Room.findOne({link: "/secrets/" + customRoomName}, function(err, result){
     if (!err){
       res.render("room", {userName: user, roomId: result.link, date: result.dateCreated, adminId: result.admin, tasks: result.tasks,
       taskCom: result.taskComplete});
     }
     else {
       res.send("There is an error!");
     }

 })
})


// The post methods allows users to add/delete tasks/ any other important items that they wish to include in the room.

app.post("/", function(req, res){
  console.log(req.body.user);
  const customRoomlink= req.body.roomId;

  Room.findOneAndUpdate({link:customRoomlink},
    { $push: {tasks: {id: Math.floor(1000000000 + Math.random() * 9000000000),
      name: req.body.newItem,
      user: req.body.user
    }}},
    function(err, addedItem){
      if (!err){
        res.redirect(req.body.roomId);
      }
    }
  )
})

// Deleting would imply that you have completed a task/ completed discussing important items

app.post("/delete", function(req, res){
  const customRoomLink= req.body.roomId;
  const checkedItemId= req.body.box;


  Room.findOneAndUpdate(
          {link: customRoomLink},
          {$inc: {taskComplete: 1}, $pull: {tasks: {id: checkedItemId}}},
          function (err, removedItem){
            if (!err){
              res.redirect(customRoomLink);
            }
          }
        )
})


// Method to logout
app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

//////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(process.env.PORT || 3000, function() {
  console.log("Connected to server.");
});
