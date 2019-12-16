const mongoose = require("mongoose");

const LookupSchema = new mongoose.Schema({
        lookupDate: { type: Date, default: Date.now },
        lookupLat: String,
        lookupLong: String,
        
    });

 


const Lookup = mongoose.model("Lookup", LookupSchema);
module.exports = Lookup;

