const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// load the validator
const validateProfileInput = require("../../validation/profileValdidator");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

// Load models
const Profile = require("../../models/Profile");
const Users = require("../../models/Users");

// @route GET to api/profile/test
// @desc test profile route
// @access public
router.get("/test", (req, res) => {
  res.json({ msg: "Profiles works." });
});

// @route GET to api/profile
// @desc get the current users profile
// @access private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noProfile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route GET to api/profile/user/:user_id
// @desc get profile by a user id
// @access public

router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (profile) {
        res.json(profile);
      } else {
        errors.noProfile = "There is no profile";
        res.status(400).json(errors);
      }
    })
    .catch(err =>
      console.log({ profile: "There is no profile for this user" })
    );
});

// @route GET to api/all
// @desc get all profiles
// @access public

router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noProfile = "There are no profiles";
        res.status(400).json(errors);
      } else {
        res.json(profiles);
      }
    })
    .catch(err => console.log({ profiles: "There are no profiles" }));
});

// @route GET to api/handle/:handle
// @desc get profile by a handle
// @access public

router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (profile) {
        res.json(profile);
      } else {
        errors.noProfile = "There is no profile";
        res.status(400).json(errors);
      }
    })
    .catch(err => console.log(err));
});

// @route POST to api/profile
// @desc create a new profile or edit to the logged in user
// @access private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // check for errors
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // get the fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // skills - split into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    // social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        //create
        // check if the handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(404).json(errors);
          }
          //save profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// @route POST to api/profile/experience
// @desc Add experience to profile
// @access private

router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    // check for errors
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // add to experience array
      profile.experience.unshift(newExp);
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route POST to api/profile/education
// @desc Add education to profile
// @access private

router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // check for errors
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // add to experience array
      profile.education.unshift(newEdu);
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route DELETE to api/profile/experience/:exp_id
// @desc Delete experience to profile
// @access private

router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      // get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      // splice the education array
      profile.experience.splice(removeIndex, 1);

      //save
      profile
        .save()
        .then(profile => res.json(profile))
        .catch(err =>
          res
            .status(404)
            .json({ error_msg: "Something went horribly wrong :P" })
        );
    });
  }
);

// @route DELETE to api/profile/education/:education_id
// @desc Delete education to profile
// @access private

router.delete(
  "/education/:education_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      // get remove index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.education_id);

      // splice the education array
      profile.education.splice(removeIndex, 1);

      //save
      profile
        .save()
        .then(profile => res.json(profile))
        .catch(err =>
          res
            .status(404)
            .json({ error_msg: "Something went horribly wrong :P" })
        );
    });
  }
);

// @route DELETE user and profile - yet to be written
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      Users.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);

module.exports = router;
