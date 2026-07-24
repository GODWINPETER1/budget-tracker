// register endpoint

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;

async function register(req , res) {

    try {

        const { name , email , password } = req.body;

        if (!name || !email || !password ) {
            return res.status(400).json({ error: 'name , email , and password are required '});
        }

        const existing = await userModel.findByEmail(email);

        if (existing) {
            return res.status(409).json({ error: 'Email already in use'})
        }

        const password_hash = await bcrypt.hash(password , SALT_ROUNDS);
        const user = await userModel.create({ name , email , password_hash });

        const token = jwt.sign( {userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d'} );

        res.status(201).json({
            token , 
            user: { id: user.id , name: user.name , email: user.email},
        });

    } catch (err) {
        console.error('Register error:', err.message)
        res.status(500).json({ error: "Something went wrong"})
    }
}

async function login( req , res ) {

    try {

        const { email , password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password is required'});
        }

        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password'})
        }

        const isMatch = await bcrypt.compare( password , user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password '})
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d'});

        res.json({ token , user: { id: user.id , name: user.name , email: user.email }});

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: "Something went wrong"})
    }
    
}

async function getMe( req , res) {

    try {
        const user = await userModel.findById(req.userId);
        
        res.json({ user: { id: user.id, name: user.name, email: user.email }});
    } catch (err) {
        console.error('GetMe error:', err.message)
        res.status(500).json({ error: 'Something went wrong'})
    }
    
}


module.exports = { register , login , getMe }