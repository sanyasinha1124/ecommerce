"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
// Returns a middleware that only allows the specified roles through
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        next();
    };
}
