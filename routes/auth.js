const express = require("express");
const { createUser, loginUser, logout } = require("../controllers/user");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", createUser);
router.post("/signin", loginUser);
router.post("/logout", logout);

module.exports = router;
