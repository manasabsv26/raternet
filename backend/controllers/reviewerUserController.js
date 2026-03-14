exports.getReviewerUserById = async (req, res) => {
    try {
        const user = await ReviewerUser.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Reviewer user not found' });
        }
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const ReviewerUser = require('../models/reviewerUserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const existingUser = await ReviewerUser.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered.' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await ReviewerUser.create({
            name,
            email,
            password: hashedPassword,
            phone
        });
        // Create JWT token
        const token = jwt.sign({ id: newUser._id, type: 'customer', name: newUser.name }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });
        res.status(201).json({
            status: 'success',
            token,
            data: { user: newUser }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required.' });
        }
        const user = await ReviewerUser.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ id: user._id, type: 'customer', name: user.name }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });
        res.status(200).json({
            status: 'success',
            token,
            data: { user }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
