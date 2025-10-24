const joi = require('joi');

exports.validateSignup = (req, res, next) => {
    const signupSchema = joi.object({
        email: joi.string().email().required(),
        username: joi.string().min(1).max(255).required(),
        password: joi.string().min(3).max(10).required(),
        confirmPassword: joi.ref("password")
    });
    const { error } = signupSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
}

exports.validateLogin = (req, res, next) => {
    const loginSchema = joi.object({
        username: joi.string().required(),
        password: joi.string().required()
    });

    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};