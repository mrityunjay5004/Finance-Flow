const ApiError = require('../utils/ApiError');
const { ROLES } = require('../utils/constants');

/**
 * Standardized RBAC middleware
 * @param {...string} allowedRoles - The roles that are allowed to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if user is authenticated (should be done by 'auth' middleware first)
    if (!req.user) {
      return next(new ApiError(401, 'Authentication is required to access this resource'));
    }

    // 2. Check if user's role is in the whitelist
    const hasAccess = allowedRoles.includes(req.user.role);
    
    if (!hasAccess) {
      const message = `Forbidden: ${req.user.role.toUpperCase()} role does not have permission to ${req.method} this resource`;
      return next(new ApiError(403, message));
    }

    next();
  };
};

module.exports = authorize;

module.exports = authorize;
