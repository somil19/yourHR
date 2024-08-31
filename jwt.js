const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.JWT_KEY;

const jwtAuthMiddleware = (req, res, next) => {
  // first check request headers has authorization or not
  const token = req.cookies.token;
  // console.log(token);
  if (!token) {
    res.locals.login = false;
    return res.status(401).redirect("/login");
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, secret);

    // Attach user information to the request object
    req.user = decoded;
    res.locals.login = true;
    // console.log("User is logged in:", res.locals.login);
    next();
  } catch (err) {
    console.error(err);
    res.status(401).redirect("/login");
  }
};

//Function to generate jwt token
const generateToken = (user) => {
  return jwt.sign(user, secret);
};
const checkLoginStatus = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      res.locals.login = true;
    } catch (err) {
      req.user = null;
      console.error(err);
      res.locals.login = false;
    }
  } else {
    req.user = null;
    res.locals.login = false;
  }
  next();
};

module.exports = {
  jwtAuthMiddleware,
  generateToken,

  checkLoginStatus,
};
