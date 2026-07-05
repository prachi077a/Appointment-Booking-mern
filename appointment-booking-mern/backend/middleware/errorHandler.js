// Central error handler - catches errors passed via next(err) and thrown in async routes
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose duplicate key error (e.g. email already registered, slot already booked)
  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate entry - this record already exists (e.g. slot already booked, or email in use).",
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Server error",
  });
};

module.exports = errorHandler;
