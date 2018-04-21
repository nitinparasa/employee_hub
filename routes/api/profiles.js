const express = require("express");

const router = express.Router();

// @route GET to api/profiles/test
// @desc test profiles route
// @access public
router.get("/test", (req, res) => {
  res.json({ msg: "Profiles works." });
});

module.exports = router;
