const express = require("express");

const router = express.Router();

// @route GET to api/users/test
// @desc test users route
// @access public
router.get("/test", (req, res) => {
  res.json({ msg: "Users works." });
});

module.exports = router;
