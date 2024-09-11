const express = require('express');
const router = express.Router();


const userRoutes = require('./userRoutes');
const candidateRoutes = require('./candidateRoutes');

router.use('/user', userRoutes)
router.use('/candidate', candidateRoutes);


module.exports = router; 