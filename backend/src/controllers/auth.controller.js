const db = require('../models');
const User = db.User;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// ─── FR 1: User Registration ────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const {
      first_name, last_name, email, password, role,
      dob, national_id, phone_number, guardian_id,
    } = req.body;

    // FR 1.2: If DOB provided and age < 16, guardian_id is required
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 16 && !guardian_id) {
        return res.status(400).json({
          message: 'Users under 16 must provide a guardian_id (FR 1.2)',
        });
      }
    }

    // Ensure at least one login identifier is provided
    if (!email && !phone_number && !national_id) {
      return res.status(400).json({
        message: 'Provide at least one of: email, phone_number, or national_id',
      });
    }

    const user = await User.create({
      first_name,
      last_name,
      email: email || null,
      password_hash: bcrypt.hashSync(password, 8),
      role,
      dob: dob || null,
      national_id: national_id || null,
      phone_number: phone_number || null,
      guardian_id: guardian_id || null,
    });

    res.status(201).json({ message: 'User registered successfully!', user_id: user.user_id });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email or National ID already in use.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 1: Signin by Email ───────────────────────────────────────────────────
exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) return res.status(404).json({ message: 'User not found.' });

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password_hash);
    if (!passwordIsValid) {
      return res.status(401).json({ accessToken: null, message: 'Invalid password.' });
    }

    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: 86400,
    });

    res.status(200).json({
      id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      phone_number: user.phone_number,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 1.1: Signin by Phone Number ─────────────────────────────────────────
exports.signinByPhone = async (req, res) => {
  try {
    const { phone_number, password } = req.body;
    const user = await User.findOne({ where: { phone_number } });

    if (!user) return res.status(404).json({ message: 'No user found with that phone number.' });

    const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordIsValid) {
      return res.status(401).json({ accessToken: null, message: 'Invalid password.' });
    }

    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: 86400,
    });

    res.status(200).json({
      id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      phone_number: user.phone_number,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 1.1: Signin by National ID ──────────────────────────────────────────
exports.signinByNationalId = async (req, res) => {
  try {
    const { national_id, password } = req.body;
    const user = await User.findOne({ where: { national_id } });

    if (!user) return res.status(404).json({ message: 'No user found with that National ID.' });

    const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordIsValid) {
      return res.status(401).json({ accessToken: null, message: 'Invalid password.' });
    }

    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: 86400,
    });

    res.status(200).json({
      id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      national_id: user.national_id,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Current User Profile ────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update Own Profile ───────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number } = req.body;
    await User.update(
      { first_name, last_name, email, phone_number },
      { where: { user_id: req.userId } }
    );
    const updated = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash'] },
    });
    res.status(200).json({ message: 'Profile updated.', user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ message: 'current_password and new_password are required.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ message: 'new_password must be at least 6 characters.' });
    }

    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const valid = bcrypt.compareSync(current_password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect.' });

    await User.update(
      { password_hash: bcrypt.hashSync(new_password, 8) },
      { where: { user_id: req.userId } }
    );
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
