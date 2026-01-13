# LMS Missing Features Implementation TODO

## 1. Fix Auth Issues
- [x] Update authRoutes.js: Fix change-password and set-password to set passwordHash instead of password
- [x] Update test-auth.js: Use unique email per run; add referralCode to register payload

## 2. Enforce RBAC on All Endpoints
- [x] Update bookRoutes.js: Add protect and authorize for all routes
- [x] Update paymentRoutes.js: Add protect and authorize for all routes
- [x] Update lendRequestRoutes.js: Add protect and authorize for all routes
- [x] Update analyticsRoutes.js: Replace custom guard with standard authorize middleware

## 3. Add Audit Logging
- [x] Create models/AuditLog.js: Schema for logging user actions
- [x] Create middleware/audit.js: Middleware to log actions on protected routes
- [x] Integrate audit middleware into server.js

## 4. Enhance Error Handling
- [x] Update middleware/errorHandler.js: Add structured error responses with error codes

## 5. Add Refresh Token Logic
- [x] Update authRoutes.js: Add /refresh endpoint
- [x] Update models/User.js: Add refreshToken field
- [x] Update protect middleware: Handle refresh tokens

## Followup Steps
- [ ] Test all routes for proper RBAC enforcement
- [ ] Verify audit logs are created for actions
- [ ] Test error responses are standardized
- [ ] Test refresh token functionality
- [ ] Proceed to role-specific features
