const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
    const { nama_lengkap, email, password } = req.body;

    if (!nama_lengkap || !email || !password) {
        return res.status(400).json({ message: "Semua field harus diisi" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password minimal 6 karakter" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Format email tidak valid" });
    }

    try {
        const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email sudah digunakan" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.promise().query("INSERT INTO users (nama_lengkap, email, password) VALUES (?, ?, ?)", 
            [nama_lengkap, email, hashedPassword]);

        res.status(201).json({ message: "Registrasi berhasil!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email dan Password wajib diisi" });
    }

    try {
        const [users] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: "Email tidak ditemukan" });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password salah" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login berhasil", token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const token = req.header("Authorization");
        if (!token) {
            return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan" });
        }

        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        const userId = decoded.id;

        const [users] = await db.promise().query("SELECT id, nama_lengkap, email FROM users WHERE id = ?", [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        res.json(users[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};
