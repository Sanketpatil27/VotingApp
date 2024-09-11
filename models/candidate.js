const mongoose = require('mongoose');

// person who appeared for election
const candidateSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },

    party: {
        type: String, 
        required: true,
    },

    age: {
        type: Number, 
        required: true
    },  

    votes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            votedAt: {
                type: Date,
                default: Date.now(),
            }
        }
    ],

    voteCount: {
        type: Number,
        default: 0
    }
});

const Candidate = mongoose.model('candidates', candidateSchema);
module.exports = Candidate;