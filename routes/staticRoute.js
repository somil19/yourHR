const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, checkLoginStatus } = require("../jwt");
router.get("/", checkLoginStatus, async (req, res) => {
  let user = null;
  if (req.user) {
    user = await User.findById(req.user.id);
  }

  return res.render("home", { user: user || {} });
});

router.get("/signup", (req, res) => {
  return res.render("signUp");
});

router.get("/login", (req, res) => {
  return res.render("login");
});
router.get("/createProfile", jwtAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("profileForm", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/userProfile", jwtAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).send("User not found");
    }
    return res.render("userProfile", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
router.get("/job", jwtAuthMiddleware, async (req, res) => {
  return res.render("jobs");
});
router.get("/logout", async (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});
module.exports = router;
