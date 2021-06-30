const { Router } = require("express");

const router = Router();

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get("/", (req, res) => {
  res.send("auth route");
});

module.exports = router;
