const { Router } = require("express");
const auth = require("../../middlewares/auth");
const User = require("../../models/User");

const router = Router();

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get("/auth", auth, async (req, res) => {
  try {
    await User.findById(req.user.id).select("-password");
    res.send(req.user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
  res.send("auth route");
});

module.exports = router;
