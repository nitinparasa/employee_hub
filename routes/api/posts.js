const express = require("express");

const router = express.Router();

// @route GET to api/posts/test
// @desc test posts route
// @access public
router.get("/test", (req, res) => {
  res.json({ msg: "Posts works." });
});

module.exports = router;
