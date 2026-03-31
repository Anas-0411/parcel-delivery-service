import UserModel from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUserController = async (req, res) => {
  try {
    const { fullname, email, age, country, address, password } = req.body;

    // Validate required fields
    if (!fullname || !email || !country || !address || !password) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Please provide all required fields",
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "User with this email already exists",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new UserModel({
      fullname,
      email,
      age,
      country,
      address,
      password: hashedPassword,
    });
    await newUser.save();

    // Generate access token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: newUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Store access token in httpOnly cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Store refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // return user data (no password) and success
    const { password: pwd, ...userData } = newUser._doc;
    return res.status(201).json({
      success: true,
      error: false,
      message: "User registered successfully",
      data: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Please provide email and password",
      });
    }

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid email or password",
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Store access token in httpOnly cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // set true in production
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Store refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // return user data (no password) and success
    const { password: pwd, ...userData } = user._doc;
    return res.status(200).json({
      success: true,
      error: false,
      message: "User logged in successfully",
      data: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private (requires authentication)
export const logoutUserController = (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json({
    success: true,
    error: false,
    message: "User logged out successfully",
  });
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshTokenController = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: true,
      message: "No refresh token provided",
    });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET);
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    return res.status(200).json({
      success: true,
      error: false,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: true,
      message: "Invalid or expired refresh token",
    });
  }
};
