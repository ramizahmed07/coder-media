const { Router } = require("express");
const { validationResult, check } = require("express-validator");
const User = require("../../models/User");

const router = Router();

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  "/users",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please enter valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ errors: [{ msg: "User already exists" }] });
      }
      // Get users gravatar
      // Encrypt password
      // return jsonwebtoken

      res.send("User route");
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
