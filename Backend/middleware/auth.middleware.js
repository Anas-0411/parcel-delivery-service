import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: true,
      message: "No access token provided. Please login first.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded; // contains user id or payload
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: true,
      message: "Invalid or expired access token. Please login again.",
    });
  }
};
