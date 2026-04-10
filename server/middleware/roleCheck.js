export const checkRole = (...allowedRoles) => {
  // Flatten the array in case an array is passed as argument (e.g., checkRole(['donor']))
  const roles = allowedRoles.flat();
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Please select a role first',
        requiresRoleSelection: true,
        redirectTo: '/select-role'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ Role Check FAILED - User role:', req.user.role, 'Required:', roles);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        userRole: req.user.role,
        requiredRole: roles
      });
    }

    console.log('✅ Role Check PASSED - User role:', req.user.role);
    next();
  };
};

export const requireRoleSelection = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!req.user.role) {
    return res.status(400).json({
      success: false,
      message: 'Please complete your profile by selecting a role',
      requiresRoleSelection: true
    });
  }

  next();
};
