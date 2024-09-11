const express = require('express');
const candidateRouter = express.Router();
const zod = require('zod');
const Candidate = require('../models/Candidate');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../authMiddleware');
const bcrypt = require('bcrypt');
const User = require('../models/user');
require('dotenv').config();


// Only admin should be able to create candidate
const checkAdmin = async (userId) => {
    try {
        const user = await User.findById(userId);
        return (user.role === 'admin');

    } catch (e) {
        return false;
    }
}


// Routes
// api: api/v1/candidate
// route to add a candidate
candidateRouter.post('/', authMiddleware, async (req, res)=> {
    try {
        if(!(await checkAdmin(req.userId))) 
            return res.status(403).json({msg: "You don't have premissions!!!"})

        
        const body = req.body;

        const newCandidate = await Candidate.create(body);

        return res.status(200).json({ msg: "Candidated Registration successfull!", newCandidate });

    } catch (error) {
        return res.status(411).json({msg: "Error occured: ", error});
    }
})

candidateRouter.get('/', async (req, res) => {
    const candidates = await Candidate.find().select('-votes -_id -voteCount -__v'); 
    
    return res.status(200).json(candidates);
})

candidateRouter.put('/:candidateID', authMiddleware, async (req, res) => {
    if(!(await checkAdmin(req.userId))) 
        return res.status(403).json({ msg: "You don't have premissions!!!" })

    const updatedData = req.body;
    const candidateID = req.params.candidateID;          // get candidate ID from URL, can't use req.userId coz its userID not candidateID

    const candidate = await Candidate.findByIdAndUpdate(candidateID, updatedData, {
        new: true,              // return new updated document
        runValidators: true,    // run mongoose validation
    })

    if(!candidate)
        return res.status(411).json({ msg: "Candidate not found!!!" })

    return res.status(200).json({ msg: "Candidate updated successfully!", candidate});
})

candidateRouter.delete('/:candidateID', authMiddleware, async (req, res) => {
    if(!(await checkAdmin(req.userId))) 
        return res.status(403).json({ msg: "You Don't have permissions!!!" })

    const candidateID = req.params.candidateID;          // get candidate ID from URL, can't use req.userId coz its userID not candidateID

    const response = await Candidate.findByIdAndDelete(candidateID);

    if(!response)
        return res.status(404).json({ msg: "candidate not found!!!" });

    return res.status(200).json({ msg: "Candidate deleted successfully!" });
})


// start voting
candidateRouter.put('/vote/:candidateID', authMiddleware, async (req, res) => {
    // now admin can vote
    // user can only vote once 

    try {

        const candidateID = req.params.candidateID;
        const userId = req.userId;

        const user = await User.findById(userId);

        // check if user is admin or already has been voted
        if(user.role === 'admin')
            return res.json({ msg: "Admin can't Vote!!" });
        else if(user.isVoted)
            return res.json({ msg: "You can only vote once!!" });

        const candidate = await Candidate.findById(candidateID);
        if(!candidate)
            return res.status(404).json({ msg: "Candidate Not found!!!" });

        // update user & candidate 
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        user.isVoted = true;
        await candidate.save();
        await user.save();

        return res.json({ msg: "your vote is registered!!" });
    }
    catch(e) {
        return res.json({ error: e });
    }
})

candidateRouter.get('/vote/count', async(req, res) => {
    // find all candidates & sort them by voteCount in descending order
    const candidates = await Candidate.find().sort({voteCoutn: 'desc'});

    const record = candidates?.map((data) => {
        return {
            name: data?.name, 
            party: data?.party,
            voteCount: data?.voteCount
        }
    })

    console.log('rec', record);
    return res.json({ counts: record });
})


module.exports = candidateRouter;