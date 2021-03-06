const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bCrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// load input validator
const validateRegisterInput = require("../../validation/registerValidator");
const validateLoginInput = require("../../validation/loginValidator");

//load user model
const User = require("../../models/Users");

// @route GET to api/users/test
// @desc test users route
// @access public
router.get("/test", (req, res) => {
  res.json({ msg: "Users works." });
});

// @route GET to api/users/register
// @desc register the user
// @access public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // check for errors
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200",
        r: "pg",
        d: "mm"
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bCrypt.genSalt(10, (err, salt) => {
        bCrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route GET to api/users/login
// @desc Login User / returning the JWT Token
// @access public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // check for errors
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //Find user by email
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "User not found";
      res.status(404).json(errors);
    }

    //Check the password
    bCrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched

        //create jwt payload
        const payload = { id: user.id, name: user.name, avatar: user.avatar };

        //Sign the token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

// @route GET to api/users/current
// @desc Login User / returning the current user
// @access private

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
