import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { findUserByUsername, createUser } from '../services/auth.service.js'

export const SignUp = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: "Username Already use" });
        }

        const hashedPassword = await argon2.hash(password);
        const newUser = await createUser(email, name, hashedPassword);

        res.status(201).json({
            message: "Register Succes",
            user: {id: newUser.id, username: newUser.username, name:newUser.name}
        });
    } catch (error) {
        res.status(500).json({ error: message });
    }
};

export const SignIn = async (req, res) => {
    try {
        const {username, password} = req.body;

        const user = findUserByUsername(username);
        if (!user) {
            return res.status(400).json({Message: "Wrong Email or Password"});
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );

        res.status(200).json({
            message: "Login Success",
            token,
            user: { id: user.id, username: user.username, name: user.name }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}