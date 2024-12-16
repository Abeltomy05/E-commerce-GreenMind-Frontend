const jwt = require('jsonwebtoken'); 

const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
  
  
module.exports = authMiddleware