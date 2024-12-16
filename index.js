const express = require("express")
const mongoose = require("mongoose")
const dotenv = require('dotenv');
const cors = require("cors")
const path = require("path")
const cookieParser = require('cookie-parser'); 
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const session = require("express-session");
const app = express()
const userRoute = require("./routes/userRoutes")
const adminRoute = require("./routes/adminRoutes");
const authRoute = require("./routes/authRoute")
const User = require("./model/userModel");

app.use(cookieParser());
dotenv.config();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret:"123abel456tomy",
    resave:false,
    saveUninitialized:true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    scope:["profile","email"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(profile)
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        user = new User({
          firstname: profile.name.givenName,
          lastname: profile.name.familyName,
          username: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          isGoogleUser: true,
          profileImage: profile.photos && profile.photos.length > 0 
           ? profile.photos[0].value 
           : 'default_profile_image_url'
         
        });
        
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  })
);

passport.serializeUser((user, done)=> done(null, user));
passport.deserializeUser((user, done)=>done(null, user));



const corsOptions = {
    origin: 'http://localhost:5173', 
    credentials: true, 
  };
  
  app.use(cors(corsOptions));

  mongoose.connect("mongodb://localhost:27017/USM_PROJECT")
   .then(()=>{
    console.log(`MongoDB connected successfully to ${mongoose.connection.name}`)
   })
   .catch(err=>{
    console.error('MongoDB connection error:', err);
   })

   app.use("/user",userRoute)
   app.use("/admin",adminRoute)
   app.use("/auth",authRoute)


   app.listen("3000", ()=>{
    console.log("server started");
   })