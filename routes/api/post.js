const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load model
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// validator
const validatePostInput = require("../../validation/postValidator");

// @route GET to api/posts/test
// @desc test posts route
// @access public
router.get("/test", (req, res) => {
  res.json({ msg: "Posts works." });
});

// @route POST to api/posts
// @desc get new post
// @access public

router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404));
});

// @route POST to api/posts/:id
// @desc get new post by id
// @access public

router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ noPostFound: "No Post found with that ID." })
    );
});

// @route POST to api/posts
// @desc create a new post
// @access private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route DELETE to api/posts/:id
// @desc delet post by id
// @access private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // check for post owner
          if (post.user.toString() !== req.user.id) {
            res.status(401).json({
              notAuthorized: "Not Authorized to perform this operation"
            });
          }

          // delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postNotFound: "No posts found" }));
    });
  }
);

// @route POST to api/posts/:id
// @desc delet post by id
// @access private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // check for post owner
          if (post.user.toString() !== req.user.id) {
            res.status(401).json({
              notAuthorized: "Not Authorized to perform this operation"
            });
          }

          // delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postNotFound: "No posts found" }));
    });
  }
);

// @route POST to api/posts/like/:id
// @desc like a post by id
// @access private

router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyLiked: "User already liked this post" });
          }

          // Add user to likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => res.status(404).json({ success: true }));
        })
        .catch(err => res.status(404).json({ postNotFound: "No posts found" }));
    });
  }
);

// @route POST to api/posts/unlike/:id
// @desc dislike a post by id
// @access private

router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ alreadyLiked: "You have not yet liked this post" });
          }

          // Get the remove index
          const removeIndex = post.likes
            .map(item => items.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          post.save().then(post => res.status(404).json({ success: true }));
        })
        .catch(err => res.status(404).json({ postNotFound: "No posts found" }));
    });
  }
);

// @route POST to api/posts/comment/:id
// @desc Add comment to a post
// @access private

router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Add to comment array
        post.comments.unshift(newComment);

        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ noPostFound: "No post was found" }));
  }
);

// @route DELETE to api/posts/comment/:id
// @desc Remove comment to a post
// @access private

router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // check to see if the comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentNotFound: "Comment doesn't exist" });
        }

        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.troString())
          .indexOf(req.params.comment_id);

        // Splice oput of array
        post.comments.splice(removeIndex, 1);

        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ noPostFound: "No post was found" }));
  }
);

module.exports = router;
