const mongoose = require("mongoose");


 const DaySchema = new mongoose.Schema({ 
        
        lookup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lookup'
        },
       day:{
        date: String,
        summary: String,
        temperatureMin: String,
        temperatureMax: String,
        humidity: String,
        precipType: String,
        inches: Number, 
        
        
    }
    });   




const Day = mongoose.model("Day", DaySchema);
module.exports = Day;
