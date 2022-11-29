//Import Packages/Libraries
const express = require("express");
const axios = require('axios');
const setTZ = require("set-tz");
const bodyParser = require("body-parser");
const fs = require('fs');
const jwt = require('jsonwebtoken')
const salesUserModel = require("./src/models/SalesUser.model");
const ManagerUser = require("./src/models/ManagerUser.model");
const cors = require("cors");
const morgan = require('morgan');
const logger = require('./config/logger');

const https = require('https');

// Two log files are created in logs folder-->
// 1.app.log with all the recent logs and,
// 2.application- date.log with date wise logs of application



// Import Routes 
const opportunityRoute = require("./src/routes/opportunity.routes");
const processFlowRoute = require("./src/routes/ProcessFlow.routes");
const processFlowTemplateRoute = require("./src/routes/ProcessFlowTemplate.routes");
const categoryRoute = require("./src/routes/Category.routes");
const categoryTemplateRoute = require("./src/routes/CategoryTemplate.routes");
const itemRoute = require("./src/routes/Item.routes");
const itemTemplateRoute = require("./src/routes/ItemTemplate.routes");
const optionRoute = require("./src/routes/Option.routes");
const optionTemplateRoute = require("./src/routes/OptionTemplate.routes");
const managerUserRoute = require("./src/routes/ManagerUser.routes");
const salesUserRoute = require("./src/routes/SalesUser.routes");
const userRoute = require("./src/routes/User.routes");
const userRoleRoute = require("./src/routes/UserRole.routes");
const messageRoute = require("./src/routes/Message.routes");
const ai_PredictionRoute = require("./src/routes/AI_Prediction.routes");
 const fileRoutes = require("./src/routes/File.routes")
const managerJudgementRoute = require("./src/routes/ManagerJudgement.routes");
const OpportunityStageRoute = require("./src/routes/OpportunityStage.routes"); 
const noteRoute = require("./src/routes/Note.routes");
const dealBandRoute = require("./src/routes/DealBand.routes");
const conditionBuilderRoute = require("./src/routes/ConditionBuilder.routes");
const actionBuilderRoute = require("./src/routes/ActionBuilder.routes");
const actionParamsBuilderRoute = require("./src/routes/ActionParamsBuilder.routes");
const redshiftRoute = require("./src/aws/Redshift.routes");


const variableBuilderRoute = require("./src/routes/VariableBuilder.routes");
const variableTypeBuilderRoute = require("./src/routes/VariableTypeBuilder.routes");
const variableTypeInputBuilderRoute = require("./src/routes/VariableTypeInputBuilder.routes");
const rollUpRoute = require("./src/routes/RollUp.routes");
 const accountRoute = require("./src/routes/Account.routes");
const contactRoute = require("./src/routes/Contact.routes");
const guidanceRoute = require("./src/routes/Guidance.routes");
const FiscalYearRoute = require("./src/routes/FiscalYear.routes");
const ForecastRoute = require("./src/routes/Forecast.routes");
const TargetRoute = require("./src/routes/Target.routes");
const TeamProgressRoute = require("./src/routes/TeamProgress.routes");
const SignalMRRoute = require("./src/routes/SignalMR.routes");
const ActionMRRoute = require("./src/routes/ActionMR.routes");

const app = express();

// streamed with ist and utc
app.use(morgan('combined', {
  stream: logger.stream
}));

app.use(bodyParser.json());



//Set Time Zone
setTZ('Europe/Jersey')

// Moment Config
let moment = require("moment");
if ("default" in moment) {
  moment = moment["default"];
}

//Get Env Configs
require("dotenv").config();


//DB CONFIG
require("./config/db");


//JSON CONFIG
app.use(express.json());

//Cors policy
app.use(
  cors({
    origin: "*",
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
  })
);
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});


// Assets Folders Creation If not Exists
//var fs = require('fs');
var assets_dir = './assets';
if (!fs.existsSync(assets_dir)) {
  fs.mkdirSync(assets_dir);
}

var pdf_dir = './assets/pdf';
if (!fs.existsSync(pdf_dir)) {
  fs.mkdirSync(pdf_dir);
}

var img_dir = './assets/img';
if (!fs.existsSync(img_dir)) {
  fs.mkdirSync(img_dir);
}


//******** Defining ROUTES ********//
app.use("/v1/forecasthealthcheckcategory", managerJudgementRoute);
app.use("/v1/redshift", redshiftRoute);
app.use("/v1/opportunity", opportunityRoute);
app.use("/v1/managerjuggement", managerJudgementRoute);
app.use("/v1/processflowtemplate", processFlowTemplateRoute);
app.use("/v1/processflow", processFlowRoute);
app.use("/v1/category", categoryRoute);
app.use("/v1/categorytemplate", categoryTemplateRoute);
app.use("/v1/item", itemRoute);
app.use("/v1/itemtemplate", itemTemplateRoute);
app.use("/v1/option", optionRoute);
app.use("/v1/optiontemplate", optionTemplateRoute);
app.use("/v1/manager", managerUserRoute);
app.use("/v1/sales", salesUserRoute);
app.use("/v1/message", messageRoute);
app.use("/v1/ai_prediction", ai_PredictionRoute);
app.use("/v1/stage", OpportunityStageRoute);
app.use("/v1/note", noteRoute);
app.use("/v1/user", userRoute);
app.use("/v1/userrole", userRoleRoute);
app.use("/v1/dealband", dealBandRoute);
app.use("/v1/conditionbuilder", conditionBuilderRoute);
app.use("/v1/actionbuilder", actionBuilderRoute);
app.use("/v1/actionparamsbuilder", actionParamsBuilderRoute);

//app.use("/v1/signalbuilder", signalBuilderRoute);
app.use("/v1/variablebuilder", variableBuilderRoute);
app.use("/v1/variabletypebuilder", variableTypeBuilderRoute);
app.use("/v1/variabletypeinputbuilder", variableTypeInputBuilderRoute);
app.use("/v1/rollup", rollUpRoute); 
app.use("/v1/account", accountRoute);
app.use("/v1/contact", contactRoute);
app.use("/v1/guidance", guidanceRoute);
app.use("/v1/fiscalyear", FiscalYearRoute);
app.use("/v1/forecast", ForecastRoute);
app.use("/v1/target", TargetRoute);
app.use("/v1/teamprogress", TeamProgressRoute);
app.use("/v1/signal_mr", SignalMRRoute);
app.use("/v1/action_mr", ActionMRRoute);


//******** img *******//
app.use('/v1/file', fileRoutes);

//Oauth SalesForce
var passport = require('passport');
var Strategy = require('passport-salesforce-oauth2').Strategy;
var HubSpotStrategy = require('passport-hubspot-oauth2').Strategy;

passport.use('hubspot', new HubSpotStrategy({
    clientID: process.env.CLIENT_ID_AUTH_HS,
    clientSecret: process.env.CLIENT_SECRET_AUTH_HS,
    callbackURL: process.env.CLIENT_CALLBACK_AUTH_HS,
    passReqToCallback: true
  },
  function (request, accessToken, refreshToken, profile, cb) {
    //console.log(profile) ;
    // Information is sent back here.
    return cb(null, profile);
  }
));




passport.use(new Strategy({
    clientID: process.env.CLIENT_ID_AUTH_SF,
    clientSecret: process.env.CLIENT_SECRET_AUTH_SF,
    callbackURL: process.env.CLIENT_CALLBACK_URL_AUTH_SF
    // callbackURL: 'http://localhost:3000/login/salesforce/return'
  },
  function (accessToken, refreshToken, profile, cb) {
    console.log("accessToken: ", accessToken)
    console.log("refreshToken: ", refreshToken)
    return cb(null, profile);
  }));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({
  extended: true
}));
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));


app.use(passport.initialize());
app.use(passport.session());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', (req, res, next) => {
  res.status(200).send('Welcome To the Value Orbit API world!');
});

app.get('/v1/auth/salesforce/login',
  passport.authenticate('salesforce'));

app.get('/v1/auth/salesforce/callback',
  passport.authenticate('salesforce', {
    successRedirect: '/sucess_from_auth_sf',
    failureRedirect: '/fail_from_auth_sf'
  }));


/*   }),
  function (req, res) {
    // console.log('https://value-orbit.vercel.app/?user=' + JSON.stringify(req.user))
    console.log(req);
    res.redirect(`${process.env.FRONTEND_APP_HOST_URL}/?user=${JSON.stringify(req.user)}`);
  }); */


app.get('/v1/auth/hubspot/login',
  passport.authenticate('hubspot', {
    scope: 'oauth'
  }));
app.get('/v1/auth/hubspot/callback',
  passport.authenticate('hubspot', {
    successRedirect: '/sucess_from_auth_hs',
    failureRedirect: '/fail_from_auth_hs'
  }));

 
app.get("/sucess_from_auth_sf", (req, res) => {
  //res.send("Success"); 
  res.redirect(`${process.env.FRONTEND_APP_HOST_URL}/salesforceauth?user=${JSON.stringify(req.user)}&success = true`);
});

app.get("/fail_from_auth_sf", (req, res) => {
  //res.send("Failed attempt");
  //res.redirect(`${process.env.FRONTEND_APP_HOST_URL}/?valid= Failed attempt`);
  res.redirect(`${process.env.FRONTEND_APP_HOST_URL}/salesforceauth?user=${JSON.stringify(req.user)}&success = false`);
});

app.get("/sucess_from_auth_hs", (req, res) => {
  //res.send("Success"); 
  res.redirect(`${process.env.FRONTEND_APP_HOST_URL}/hubspotauth?user=${JSON.stringify(req.user)}&success = true`);
});

app.get("/fail_from_auth_hs", (req, res) => {
  //res.send("Failed attempt");
  //res.redirect(`${process.env.FRONTEND_APP_HOST_URL}/?valid= Failed attempt`);
  res.redirect(`${process.env.FRONTEND_APP_HOST_URL}/hubspotauth?user=${JSON.stringify(req.user)}&success = false`);
});

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    res.render('profile', {
      user: req.user
    });
  });


// ****** JWT SECURITY SYSTEM ******* //
let refreshTokens = []

app.post('/v1/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = generateAccessToken({
      username: user.name
    })
    res.json({
      accessToken: accessToken
    })
  })

});

app.delete('/v1/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.status(204).json({
    success: true,
  })
})


app.post('/v1/login2', async (req, res) => {
  try {
    //Authentificate  user 
    const user = {
      username: req.body.username,
      password: req.body.password
    }

    if (req.body.username == "admin" && req.body.password == "VO_Best_Team2022!") {
      console.log("Successfully Sales connected.. ! ")
      const accessToken = generateAccessToken(user)
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
      refreshTokens.push(refreshToken)
      res.status(200).json({
        success: true,
        information: 'Successfully Admin connected..',
        accessToken: accessToken,
        refreshToken: refreshToken,
        isfound: true,
        data: "admin",
        role: "admin"
      })

    } else {
      let managerfinded = await ManagerUser.findOne({
          username: req.body.username,
          password: req.body.password
        }).select('-password -opportunities -__v -processflowtemplate')
        .populate([{
          path: 'salesusers',
          select: ('id idorigin username firstname lastname ')
        }])

      if (managerfinded) {
        managerfinded.role = "manager";
        console.log("Successfully Manager connected.. ! ")
        const accessToken = generateAccessToken(user)
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
        refreshTokens.push(refreshToken)
        res.status(200).json({
          success: true,
          information: 'Successfully Manager connected..',
          accessToken: accessToken,
          refreshToken: refreshToken,
          isfound: true,
          data: managerfinded,
          role: "manager"
        })
      } else {
        let salesuserfinded = await salesUserModel.findOne({
          username: req.body.username,
          password: req.body.password
        }).select('-password -opportunities -__v');
        if (salesuserfinded) {
          //console.log("Successfully Sales connected.. ! ")
          const accessToken = generateAccessToken(user)
          const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
          refreshTokens.push(refreshToken)
          res.status(200).json({
            success: true,
            information: 'Successfully Sales connected..',
            accessToken: accessToken,
            refreshToken: refreshToken,
            isfound: true,
            data: salesuserfinded,
            role: "sales"
          })
        } else {
          console.log("Wrong credentials .. ! ")
          res.status(200).json({
            success: false,
            information: 'Wrong credentials ..',
            accessToken: null,
            refreshToken: null,
            isfound: false,
            data: [],
            role: null
          })
        }
      }
    }
  } catch (error) {
    console.log(error)
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
})


app.post('/v1/login', async (req, res) => {
  //Authentificate  user 
  const user = {
    username: req.body.username,
    password: req.body.password
  }

  if (req.body.username == "admin" && req.body.password == "VO_Best_Team2022!") {
    console.log("Successfully Sales connected.. ! ")
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.status(200).json({
      success: true,
      information: 'Successfully Admin connected..',
      accessToken: accessToken,
      refreshToken: refreshToken,
      isfound: true,
      data: "admin",
      role: "admin"
    })

  } else {
    let managerfinded = await ManagerUser.findOne({
        username: req.body.username,
        password: req.body.password
      }).select('-password -opportunities -__v -processflowtemplate')
      .populate([{
        path: 'salesusers',
        select: ('id idorigin username firstname lastname ')
      }])

    if (managerfinded) {
      managerfinded.role = "manager";
      console.log("Successfully Manager connected.. ! ")
      const accessToken = generateAccessToken(user)
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
      refreshTokens.push(refreshToken)
      res.status(200).json({
        success: true,
        information: 'Successfully Manager connected..',
        accessToken: accessToken,
        refreshToken: refreshToken,
        isfound: true,
        data: managerfinded,
        role: "manager"
      })
    } else {
      let salesuserfinded = await salesUserModel.findOne({
        username: req.body.username,
        password: req.body.password
      }).select('-password -opportunities -__v');
      if (salesuserfinded) {
        //console.log("Successfully Sales connected.. ! ")
        const accessToken = generateAccessToken(user)
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
        refreshTokens.push(refreshToken)
        res.status(200).json({
          success: true,
          information: 'Successfully Sales connected..',
          accessToken: accessToken,
          refreshToken: refreshToken,
          isfound: true,
          data: salesuserfinded,
          role: "sales"
        })
      } else {
        console.log("Wrong credentials .. ! ")
        res.status(403).json({
          success: false,
          information: 'Wrong credentials ..',
          accessToken: null,
          refreshToken: null,
          isfound: false,
          data: [],
          role: null
        })
      }
    }
  }
})


function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.EXPIRATION_DELAY
  })
}



//for Heroku
const PORT = process.env.PORT || 4000
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || '6a01ad4b07e69f941a8800478b086dc40ceebd21acb601883f5763e4f98b28eaee69c0a280b928aa584bc24c43aaba78b2281cbe1dcf12488dd080a1f39e7770'
const REFRESH_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || '8b8e6d2fb58b35af74d8121baca4d5d4f00b9846661dd7a870c1052af9399b94476163549069a65b7306dbfa47885779680195dadae19b9e7a4229d7cb8265a7'
const EXPIRATION_DELAY = process.env.EXPIRATION_DELAY || '2000s'




 /* //const https = require('https');
const server = https.createServer({ key, cert }, app);

server.listen(process.env.PORT, () => {
  console.log(`Server is listening on :${process.env.PORT}`); //https://localhost:${process.env.PORT}`);
}); */
 
/* 
// for Https Reason
const options = {
  key: fs.readFileSync('./cert/private.key'),
  cert: fs.readFileSync('./cert/valueorbit.crt')
};

/* app.use((req, res, next) => {  
    res.redirect(301, `https://${req.headers.host}${req.url}`);  
    next();
}); 

https.createServer(options, app, ).listen(process.env.PORT, () => {
  console.log("the server can be connect succesfuly on : " + process.env.PORT);
})
 */

  //Create server
app.listen(process.env.PORT, () => {
  console.log("the server can be connect succesfuly on : " + process.env.PORT);
});  
  

//General synchronization
setTimeout(() => {
  generalSynch();
  setInterval(() => {
    generalSynch();
  }, 60000); //1min
}, 90000); //1.5min 



const generalSynch = async () => {
  try {
    console.log(`${ moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000")}  - General synchronization is started . . .`)
    let res = await axios.post(`${process.env.AUTOSYNCH_URL_PROD}/synch/`);
    // Work with the response...
    console.log(`${ moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000")}  - General Sync works properly !`)
  } catch (err) {
    if (err.response) {
      // The client was given an error response (5xx, 4xx)      
      console.log(`${ moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000")} - General Sync not works - sync api return an error response !-- Details: ${err.message} `)

    } else if (err.request) {
      // The client never received a response, and the request was never left
      console.log(`${ moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000")} - General Sync Not works -  The api never received a response from sync api, and the request was never left ! -- Details: ${""+err.message}`)
    } else {
      // Anything else
      console.log(`${ moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000")}  - General Sync not works - unknown error ! -- Details: ${err.message} `)
    }
  }
};