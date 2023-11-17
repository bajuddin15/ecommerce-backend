const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const { generateToken, generateRefreshToken } = require("../utils/jwtToken");

const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const findUser = await User.findOne({ email: email });
    if (findUser) {
      return res.status(400).json("User already exist");
    }
    const newUser = await User.create(req.body);
    await newUser.save();
    const user = { name: newUser.name, email: newUser.email };

    res.status(201).json({
      user,
      message: "User Sign Up Successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUser = await User.findOne({ email: email });
    if (findUser && (await findUser.isPasswordMatched(password))) {
      const refreshToken = await generateRefreshToken(findUser?._id);
      const updateuser = await User.findByIdAndUpdate(
        findUser._id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      const user = {
        name: findUser?.name,
        email: findUser?.email,
        token: generateToken(findUser?._id),
      };
      return res.status(200).json({
        user,
        message: "User login successfully",
      });
    } else {
      return res.status(404).json("User not found");
    }
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

// logout functionality

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken)
    return res.status(404).json({ message: "No Refresh Token in Cookies" });
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

module.exports = {
  createUser,
  loginUser,
  logout,
};
