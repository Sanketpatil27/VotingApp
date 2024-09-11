const express = require('express');
const userRouter = express.Router();
const zod = require('zod');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../authMiddleware');
const bcrypt = require('bcrypt');
require('dotenv').config();

// creating zod schemas for signup
const signupSchema = zod.object({
    name: zod.string(),
    email: zod.string().email().optional(),
    password: zod.string(),
    mobile: zod.string().optional(),
    address: zod.string(),
    adharCardNumber: zod.number(),
    age: zod.number(),
    role: zod.string(),
})

// creating zod schemas for signin
const signinSchema = zod.object({
    adharCardNumber: zod.number(),
    password: zod.string(),
})


// Routes
// api: api/v1/user/signup
userRouter.post('/signup', async (req, res)=> {
    try {
        const body = req.body;
        const signup = signupSchema.safeParse(body);

        // if creating a admin then check no admin already exists!
        if(body.role === 'admin') {
            const flag = await User.findOne({ role: 'admin' });
            if(flag)
                return res.status(411).json({msg: "Admin already exists!"});   
        }
    
        if(!signup.success)
            return res.status(411).json({msg: "Invalid credentials!"});
        
        const findUser = await User.findOne({ adharCardNumber: body.adharCardNumber});
        if(findUser)
            return res.status(411).json({ msg: "adharCardNumber already exist!!!"});

        // hash the password before creating user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);
        body.password = hashedPassword;

        const newUser = await User.create(body);

        // create token for user after signup
        const token = jwt.sign({
            userId: newUser._id
        }, process.env.JWT_SECRET)

        return res.status(200).json({
            msg: "user created successfully!",
            token
        });

    } catch (error) {
        return res.status(411).json({msg: error});
    }
})


userRouter.post('/login', async (req, res) => {
    try {
        const body = req.body;
        const signin = signinSchema.safeParse(body);

        if(!signin.success)
            return res.status(411).json({msg: "Invalid credentials!"});

        const user = await User.findOne({ adharCardNumber: body.adharCardNumber });

        // check if password matches or not
        if(!user || !(await bcrypt.compare(body.password, user.password)))
            return res.status(411).json({ msg: "invalid adharcardNumber or password!" }); 

        const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET);

        return res.status(200).json({
            msg: "login successfully!",
            token
        });

    } catch (error) {
        return res.status(411).json({msg: error.message});
    }
})

userRouter.get('/profile', authMiddleware, async (req, res) => {
    const userId = req.userId;
    const user = await User.findOne({_id: userId}).select('-password');
    
    return res.status(200).json(user);
})

userRouter.put('/profile/password', authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;          // get Id from token
    
    const user = await User.findById(userId)

    if(!(await bcrypt.compare(currentPassword, user.password)))
        return res.status(404).json({ msg: "Password doesn't match!"});

    // update the password with new hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ msg: "Password updated successfully!"});
})
 
module.exports = userRouter;