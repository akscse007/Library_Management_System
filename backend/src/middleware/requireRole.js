// backend/middleware/requireRole.js
module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role || req.currentUser?.role;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
};
