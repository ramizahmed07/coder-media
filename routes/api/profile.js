const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const request = require("request");
const config = require("config");
const auth = require("../../middlewares/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const router = Router();

// @route   POST api/profile
// @desc    Create or Update user profile
// @access  Private
router.post(
  "/profile",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields["user"] = req.user.id;
    if (company) profileFields["company"] = company;
    if (website) profileFields["website"] = website;
    if (location) profileFields["location"] = location;
    if (bio) profileFields["bio"] = bio;
    if (status) profileFields["status"] = status;
    if (githubusername) profileFields["githubusername"] = githubusername;
    if (skills) profileFields["skills"] = skills.replace(" ", "").split(",");

    // Build social object
    profileFields["social"] = {};
    if (youtube) profileFields.social["youtube"] = youtube;
    if (facebook) profileFields.social["facebook"] = facebook;
    if (twitter) profileFields.social["twitter"] = twitter;
    if (instagram) profileFields.social["instagram"] = instagram;
    if (linkedin) profileFields.social["linkedin"] = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      // Create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get("/profile", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error ");
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get("/profile/user/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const profile = await Profile.findOne({ user: user_id }).populate("user", [
      "name",
      "avatar",
    ]);
    if (!profile) return res.status(400).json({ msg: "Profile no found" });
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ msg: "Profile no found" });
    }
    res.status(500).send("Server Error ");
  }
});

// @route   DELETE api/profile
// @desc    Delete profile, user, and its posts
// @access  Private
router.delete("/profile", auth, async (req, res) => {
  try {
    // @todo - remove user posts

    // Remove user, profile
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.send({ msg: "User deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
  "/profile/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, company, location, from, to, current, description } =
      req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete profile experience
// @access  Private
router.delete("/profile/experience/:exp_id", auth, async (req, res) => {
  try {
    const { exp_id } = req.params;
    const profile = await Profile.findOne({ user: req.user.id });
    const prev_length = profile.experience.length;
    console.log("EXP ID", exp_id);
    profile.experience = profile.experience.filter(
      (x) => x._id.toString() !== exp_id
    );

    console.log("Profile EXP", profile.experience);

    if (profile.experience.length === prev_length) {
      return res.status(400).json({ msg: "Could not delete experience" });
    }
    await profile.save();
    res.json({ msg: "Experience removed" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/profile/github/:username
// @desc    Get user repos from Github
// @access  Public
router.get("/profile/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (err, response, body) => {
      if (err) console.error(err);
      if (response.statusCode !== 200)
        return res.status(404).json({ msg: "No Github profile found" });
      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
