let express = require("express");
const passport = require("passport");
let router = express.Router();
let User = require("../models/user_DB");

router.get("/register", function (req, res) {
  // register form
  res.render("register");
});

router.post("/register", async function (req, res) {
  let user = new User({
    username: req.body.username,
  });
  // hashing and salting and saving
  let registeredUser = await User.register(user, req.body.password);
  // saved user is not logged in
  // cookie will automatically generate
  req.login(registeredUser, function (err) {
    if (err) {
      console.log("error while registering user");
    }
    res.redirect("/jobs");
  });
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "welcome back user");
    let redirectUrl = req.session.returnTo || "/jobs";
    // delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

router.get("/logout", function (req, res) {
  req.logOut(function (err) {
    if (err) {
      console.log("error while logout");
    }
    res.redirect("/jobs");
  });
});
module.exports = router;
