const express = require("express");
const passport = require("passport");
const authRoute = express.Router();

const protect = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    error: true,
    message: "Not authorized, please login"
  });
};

authRoute.get("/google/callback", 
    passport.authenticate("google", { 
      successRedirect: "http://localhost:5173/user/home", 
      failureRedirect: "http://localhost:5173/user/login" 
    })
  );

  authRoute.get("/google", 
    passport.authenticate("google", { 
      scope: ["profile", "email"] 
    })
  );

authRoute.get("/login/failed",(req,res)=>{
    res.status(401).json({
        error:true,
        message:"Log in failure"
        
    })
})

authRoute.get("/login/success", (req, res) => {
    if (req.user) {
      res.status(200).json({
        error: false,
        message: "Successfully Logged In",
        user: {
          id: req.user._id,
          firstname: req.user.firstname,
          lastname: req.user.lastname,
          email: req.user.email,
          isGoogleUser: req.user.isGoogleUser
        }
      });
    } else {
      res.status(403).json({
        error: true, 
        message: "Not Authorized"
      });
    }
  });


  
  authRoute.post("/logout", (req, res) => {
    try {
      // Use req.logout() with a callback to handle potential errors
      req.logout((err) => {
        if (err) {
          return res.status(500).json({
            error: true,
            message: "Logout failed"
          });
        }
        
        // Destroy the session
        req.session.destroy((destroyErr) => {
          if (destroyErr) {
            return res.status(500).json({
              error: true,
              message: "Session destruction failed"
            });
          }
          
          // Clear the session cookie
          res.clearCookie('connect.sid'); // Adjust cookie name if different
          
          // Send a JSON response instead of redirecting
          res.status(200).json({
            error: false,
            message: "Logout successful"
          });
        });
      });
    } catch (error) {
      res.status(500).json({
        error: true,
        message: "Logout error"
      });
    }
  });

module.exports = authRoute