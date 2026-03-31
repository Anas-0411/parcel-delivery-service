import UserModel from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUserController = async (req, res) => {
  try {
    // Extract user details from request body
    const { fullname, email, age, country, address, password } = req.body;

    // Validate required fields
    if (!fullname || !email || !country || !address || !password) {
      // If any required field is missing, return error
      return res.status(400).json({
        success: false,
        error: true,
        message: "Please provide all required fields",
      });
    }

    // Check if user already exists in the database
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      // If user exists, return error
      return res.status(400).json({
        success: false,
        error: true,
        message: "User with this email already exists",
      });
    }

    // Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user document
    const newUser = new UserModel({
      fullname,
      email,
      age,
      country,
      address,
      password: hashedPassword,
    });
    await newUser.save();

    const payload = {
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    // Store access token in httpOnly cookie for security
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

    // Return user data (excluding password) and success message
    const { password: pwd, ...userData } = newUser._doc;
    return res.status(201).json({
      success: true,
      error: false,
      message: "User registered successfully",
      data: userData,
    });
  } catch (error) {
    // Handle server errors
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
    // Extract email and password from request body
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      // If email or password is missing, return error
      return res.status(400).json({
        success: false,
        error: true,
        message: "Please provide email and password",
      });
    }

    // Check if user exists in the database
    const user = await UserModel.findOne({ email });
    if (!user) {
      // If user does not exist, return error
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid email or password",
      });
    }

    // Compare provided password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // If password does not match, return error
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid email or password",
      });
    }

    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role, // ✅ important
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    // Store access token in httpOnly cookie for security
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

    // Return user data (excluding password) and success message
    const { password: pwd, ...userData } = user._doc;
    return res.status(200).json({
      success: true,
      error: false,
      message: "User logged in successfully",
      data: userData,
    });
  } catch (error) {
    // Handle server errors
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
  // Define cookie options for clearing cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // Clear access and refresh token cookies
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  // Respond with logout success message
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
  // Get refresh token from cookies
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    // If no refresh token is provided, return error
    return res.status(401).json({
      success: false,
      error: true,
      message: "No refresh token provided",
    });
  }
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // Generate new access token
    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );
    // Store new access token in httpOnly cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    // Respond with success message
    return res.status(200).json({
      success: true,
      error: false,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    // If refresh token is invalid or expired, return error
    return res.status(401).json({
      success: false,
      error: true,
      message: "Invalid or expired refresh token",
    });
  }
};
