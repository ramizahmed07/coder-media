const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("config");

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization").split(" ")[1];
    if (!token) throw new Error();
    const decoded = await jwt.verify(token, config.get("jwtSecret"));
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    // req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = auth;
