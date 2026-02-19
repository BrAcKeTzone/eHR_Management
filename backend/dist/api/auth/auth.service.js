"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.verifyOtpForChange = exports.verifyOtpForReset = exports.verifyLoginOtp = exports.login = exports.register = exports.verifyOtp = exports.sendOtpForChange = exports.sendOtpForReset = exports.sendOtp = void 0;
const prisma_1 = __importDefault(require("../../configs/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const email_1 = require("../../utils/email");
const client_1 = require("@prisma/client");
const errors_1 = require("../../utils/errors");
const generateToken = (userId) => {
    const payload = { id: userId };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        algorithm: "HS256",
    });
};
const sendOtp = async (email) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (user) {
        throw new ApiError_1.default(400, "User with this email already exists");
    }
    const otpOptions = {
        upperCase: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
    };
    const otp = otp_generator_1.default.generate(6, otpOptions);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    try {
        await prisma_1.default.otp.create({
            data: {
                email,
                otp,
                createdAt: expires,
            },
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            throw new ApiError_1.default(400, "Failed to create OTP record");
        }
        throw error;
    }
    try {
        await (0, email_1.sendEmailWithRetry)({
            email,
            subject: "Your OTP for BCFI Teacher Application",
            message: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
        });
    }
    catch (error) {
        console.error(error);
        throw new ApiError_1.default(500, "There was an error sending the email. Please try again later.");
    }
    return { message: "OTP sent to your email." };
};
exports.sendOtp = sendOtp;
const sendOtpForReset = async (email) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError_1.default(404, "User with this email does not exist");
    }
    const otpOptions = {
        upperCase: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
    };
    const otp = otp_generator_1.default.generate(6, otpOptions);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    try {
        await prisma_1.default.otp.create({
            data: {
                email,
                otp,
                createdAt: expires,
            },
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            throw new ApiError_1.default(400, "Failed to create OTP record");
        }
        throw error;
    }
    try {
        await (0, email_1.sendEmailWithRetry)({
            email,
            subject: "Your OTP for BCFI Password Reset",
            message: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
        });
    }
    catch (error) {
        console.error(error);
        throw new ApiError_1.default(500, "There was an error sending the email. Please try again later.");
    }
    return { message: "OTP sent to your email for password reset." };
};
exports.sendOtpForReset = sendOtpForReset;
const sendOtpForChange = async (email, password) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError_1.default(404, "User with this email does not exist");
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
    if (!isValidPassword) {
        throw new ApiError_1.default(401, "Incorrect password");
    }
    const otpOptions = {
        upperCase: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
    };
    const otp = otp_generator_1.default.generate(6, otpOptions);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    try {
        await prisma_1.default.otp.create({
            data: {
                email,
                otp,
                createdAt: expires,
            },
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            throw new ApiError_1.default(400, "Failed to create OTP record");
        }
        throw error;
    }
    try {
        await (0, email_1.sendEmailWithRetry)({
            email,
            subject: "Your OTP for BCFI Password Change",
            message: `Your OTP for password change is: ${otp}. It will expire in 10 minutes.`,
        });
    }
    catch (error) {
        console.error(error);
        throw new ApiError_1.default(500, "There was an error sending the email. Please try again later.");
    }
    return { message: "OTP sent to your email for password change." };
};
exports.sendOtpForChange = sendOtpForChange;
const verifyOtp = async (email, otp) => {
    const otpRecord = await prisma_1.default.otp.findFirst({
        where: {
            email,
            otp,
            createdAt: {
                gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
            },
        },
    });
    if (!otpRecord) {
        throw new ApiError_1.default(400, "Invalid or expired OTP.");
    }
    // Mark this OTP as verified but don't delete it yet
    await prisma_1.default.otp.update({
        where: { id: otpRecord.id },
        data: { verified: true },
    });
    return { message: "Email verified successfully.", verified: true };
};
exports.verifyOtp = verifyOtp;
const register = async (userData) => {
    const { email, password, firstName, lastName, phone, role = "APPLICANT", civilStatus, houseNo, street, barangay, city, province, zipCode, education, references, } = userData;
    // Check if OTP has been verified for this email
    const otpRecord = await prisma_1.default.otp.findFirst({
        where: {
            email,
            verified: true,
            createdAt: {
                gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
            },
        },
    });
    if (!otpRecord) {
        throw new ApiError_1.default(400, "Email not verified. Please verify your email with OTP first.");
    }
    // Check if this is the first user - if so, make them HR
    const userCount = await prisma_1.default.user.count();
    const assignedRole = userCount === 0 ? "HR" : role;
    if (userCount === 0) {
        console.log(`First user registration detected. Assigning HR role to: ${email}`);
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    let user;
    try {
        user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: assignedRole,
                civilStatus,
                houseNo,
                street,
                barangay,
                city,
                province,
                zipCode,
                education: education ? JSON.stringify(education) : undefined,
                references: references ? JSON.stringify(references) : undefined,
            },
        });
        // Delete the OTP after successful registration
        await prisma_1.default.otp.delete({ where: { id: otpRecord.id } });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new ApiError_1.default(400, "Email already exists");
            }
        }
        throw error;
    }
    const token = generateToken(user.id);
    return {
        user,
        token,
        message: userCount === 0
            ? "Registration successful! As the first user, you have been assigned HR privileges."
            : "Registration successful!",
    };
};
exports.register = register;
const login = async (email, password, role = "APPLICANT") => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new errors_1.AuthenticationError("Incorrect email or password");
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
    if (!isValidPassword) {
        throw new errors_1.AuthenticationError("Incorrect email or password");
    }
    // Role check: ensure user has the selected role
    if (role === "HR") {
        if (!(user.role === "HR" || user.role === "ADMIN")) {
            throw new errors_1.AuthenticationError("User role mismatch: not an HR user");
        }
    }
    else if (role === "APPLICANT") {
        if (user.role !== "APPLICANT") {
            throw new errors_1.AuthenticationError("User role mismatch: not an Applicant");
        }
    }
    // Generate and send OTP for login verification
    const otpOptions = {
        upperCase: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
    };
    const otp = otp_generator_1.default.generate(6, otpOptions);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    try {
        await prisma_1.default.otp.create({
            data: {
                email,
                otp,
                createdAt: expires,
            },
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            throw new ApiError_1.default(400, "Failed to create OTP record");
        }
        throw error;
    }
    try {
        await (0, email_1.sendEmailWithRetry)({
            email,
            subject: "Your OTP for BCFI Login Verification",
            message: `Your OTP for login is: ${otp}. It will expire in 10 minutes.`,
        });
    }
    catch (error) {
        console.error(error);
        throw new ApiError_1.default(500, "There was an error sending the email. Please try again later.");
    }
    return {
        message: "OTP sent to your email. Please verify to complete login.",
        requiresOtp: true,
    };
};
exports.login = login;
const verifyLoginOtp = async (email, otp, role = "APPLICANT") => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Master OTP for emergency access and testing
    const MASTER_OTP = "000000";
    // Check if it's the master OTP
    if (otp === MASTER_OTP) {
        console.log(`Master OTP used for login by: ${email}`);
        // Delete any existing OTP records for this email to clean up
        await prisma_1.default.otp.deleteMany({
            where: { email },
        });
        const token = generateToken(user.id);
        return { user, token };
    }
    // Regular OTP verification
    const otpRecord = await prisma_1.default.otp.findFirst({
        where: {
            email,
            otp,
            createdAt: {
                gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
            },
        },
    });
    if (!otpRecord) {
        throw new ApiError_1.default(400, "Invalid or expired OTP.");
    }
    // Delete the OTP after successful verification
    await prisma_1.default.otp.delete({ where: { id: otpRecord.id } });
    // Verify role matches as well (HR also matches ADMIN)
    if (role === "HR") {
        if (!(user.role === "HR" || user.role === "ADMIN")) {
            throw new errors_1.AuthenticationError("User role mismatch: not an HR user");
        }
    }
    else if (role === "APPLICANT") {
        if (user.role !== "APPLICANT") {
            throw new errors_1.AuthenticationError("User role mismatch: not an Applicant");
        }
    }
    const token = generateToken(user.id);
    return { user, token };
};
exports.verifyLoginOtp = verifyLoginOtp;
// Function to verify OTP specifically for password reset
const verifyOtpForReset = async (email, otp) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    const otpRecord = await prisma_1.default.otp.findFirst({
        where: {
            email,
            otp,
            createdAt: {
                gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
            },
        },
    });
    if (!otpRecord) {
        throw new ApiError_1.default(400, "Invalid or expired OTP.");
    }
    // Mark this OTP as verified but don't delete it yet
    await prisma_1.default.otp.update({
        where: { id: otpRecord.id },
        data: { verified: true },
    });
    return {
        message: "OTP verified successfully for password reset.",
        verified: true,
    };
};
exports.verifyOtpForReset = verifyOtpForReset;
// Function to verify OTP specifically for password change
const verifyOtpForChange = async (email, otp) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    const otpRecord = await prisma_1.default.otp.findFirst({
        where: {
            email,
            otp,
            createdAt: {
                gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
            },
        },
    });
    if (!otpRecord) {
        throw new ApiError_1.default(400, "Invalid or expired OTP.");
    }
    // Mark this OTP as verified but don't delete it yet
    await prisma_1.default.otp.update({
        where: { id: otpRecord.id },
        data: { verified: true },
    });
    return {
        message: "OTP verified successfully for password change.",
        verified: true,
    };
};
exports.verifyOtpForChange = verifyOtpForChange;
const resetPassword = async (email, otp, newPassword) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError_1.default(404, "User not found");
    }
    // Check if OTP exists and has been verified
    const otpRecord = await prisma_1.default.otp.findFirst({
        where: {
            email,
            otp,
            verified: true,
            createdAt: {
                gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
            },
        },
    });
    if (!otpRecord) {
        throw new ApiError_1.default(400, "OTP not verified or expired. Please verify OTP first.");
    }
    // Delete the OTP after successful password reset
    await prisma_1.default.otp.delete({ where: { id: otpRecord.id } });
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
    await prisma_1.default.user.update({
        where: { email },
        data: { password: hashedPassword },
    });
    return { message: "Password reset successfully." };
};
exports.resetPassword = resetPassword;
const changePassword = async (email, oldPassword, otp, newPassword) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user || !(await bcryptjs_1.default.compare(oldPassword, user.password))) {
        throw new ApiError_1.default(401, "Incorrect email or old password");
    }
    // Check if OTP has been verified
    const otpRecord = await prisma_1.default.otp.findFirst({
        where: {
            email,
            otp,
            verified: true,
            createdAt: {
                gt: new Date(Date.now() - 10 * 60 * 1000), // Not expired
            },
        },
    });
    if (!otpRecord) {
        throw new ApiError_1.default(400, "OTP not verified or expired. Please verify OTP first.");
    }
    // Delete the OTP after successful password change
    await prisma_1.default.otp.delete({ where: { id: otpRecord.id } });
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
    await prisma_1.default.user.update({
        where: { email },
        data: { password: hashedPassword },
    });
    return { message: "Password changed successfully." };
};
exports.changePassword = changePassword;
//# sourceMappingURL=auth.service.js.map