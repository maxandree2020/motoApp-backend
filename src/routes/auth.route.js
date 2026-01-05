import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = Router();

// Simulación de base de datos
// Contraseña: "1234" encriptada
const hashedPassword = bcrypt.hashSync("1234", 10);
const USERS = [
    { username: "admin", password: hashedPassword }
];

// POST /auth/login
router.post("/login", (req, res) => {
    
    const { username, password } = req.body;

    const user = USERS.find(u => u.username === username);
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Credenciales inválidas" });

const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.json({ token });
});

export default router;
