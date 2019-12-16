let DarkSkyURL = "https://api.darksky.net/forecast";
let DarkSkyApiKey = "8f6edf05aa71913936c234de6de39425";
let DarkSkyApiParams = "exclude=currently,flags,hourly";

const Hapi = require("hapi");
const Mongoose = require("mongoose");
/*
const server = new Hapi.Server({
    "host": "localhost",
    "port": 3001,
    routes: {
      cors: true
    }
});
*/

const server = new Hapi.Server({
  "host": "darksky-backend.herokuapp.com",
  port: 8080,
  routes: {
    cors: false
  }
});


let LookupModel = require('./models/lookup.js');
let DayModel = require('./models/day.js');
//establish connection to atlas mongodb
Mongoose.connect('mongodb+srv://mongouser:6a4QLWmDqwrLP3Bx@dark-sky-qs3yc.mongodb.net/DarkSkyDB?retryWrites=true&w=majority', {
    useNewUrlParser: true

});
 

//get the weather report from dark sky api for each of past seven days 

function getSevenDayReport(lat,long,lookupID) {     
      for (var i = 1; i < 8; i++) {
              var d = new Date();
              d.setDate(d.getDate() - i);
              var fd = d.toISOString().replace(/\..+/, ''); 
              
              
                const request = require('request');
                //build url string 
                url = DarkSkyURL + '/' + DarkSkyApiKey + '/' + lat + ',' + long + ',' + fd + '?' + DarkSkyApiParams;
                request(url, {
                  json: true,
                  time : true
                }, (err, res, body) => {
                  if (err) { 
                      return console.log(err);
                  }
                  var formattedDate = new Date(body.daily.data[0].time*1000);

                  if(body.daily.data[0].precipType == 'snow') {
                
                      var precipType = body.daily.data[0].precipType;
                      var inches = body.daily.data[0].precipAccumulation;
                  }
                     

                  var day = new DayModel({
                    lookup: lookupID,
                    day:{
                      date: formattedDate,
                      summary: body.daily.data[0].summary,
                      humidity: body.daily.data[0].humidity,
                      temperatureMin: body.daily.data[0].temperatureMin,
                      temperatureMax: body.daily.data[0].temperatureMax,
                      precipType: precipType,
                      inches: inches,
                      
                      
                    }
                  })
                  
                  day.save()
                  .then(doc => {
                      //console.log(doc)
                      //console.log(doc.id)
                     
                  })
                  .catch(err => {
                      console.error(err)
                  })  

                 
                })    
                
               
            }//end of for loop
          
  }          

          

  server.route({
    method: "POST",
    path: "/lookup",
    
    handler: async (request, h) => {
        try {

            var lookup = new LookupModel(request.payload);

            lat = request.payload.lookupLat;
            long = request.payload.lookupLong;
            
            var result = await lookup.save(); 
            var lookupID = result.id;
            getSevenDayReport(lat,long,lookupID);
            return h.response(result);

        } catch (error) {
            return h.response(error).code(500);
        }
    }
  });
 

server.route({
  method: "GET",
  path: "/all-lookups",
  handler: async (request, h) => {
      try {

        //get all past lookups along with days
         var pastLookups = await LookupModel.find();
         return h.response(pastLookups);

      } catch (error) {
          return h.response(error).code(500);
      }
  }
});

server.route({
  method: "GET",
  path: "/lookup-days",
  handler: async (request, h) => {
      try {
        const params = request.query
        //console.log(params.id)
        //const id = '5df538bf6f1d035a36aee569';
        //get all past lookups along with days
        
          var days = await DayModel
              .find({lookup: params.id})
              .select('day');
           console.log(days);   
          return h.response(days);
   
          


      } catch (error) {
          return h.response(error).code(500);
      }
  }
});

server.start();