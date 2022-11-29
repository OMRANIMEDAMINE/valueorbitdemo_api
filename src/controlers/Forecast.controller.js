const logger = require('../../config/logger');
//const ObjectID = require('mongoose').Types.ObjectId;


const ForecastModel = require("../models/Forecast.model");
const SalesModel = require("../models/SalesUser.model");
const ManagerModel = require("../models/ManagerUser.model");
const FiscalYearSettingModel = require("../models/FiscalYearSetting.model");

let moment = require("moment");
if ("default" in moment) {
  moment = moment["default"];
}



const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204);
    return;
  }
};


exports.getAll = async (req, res) => {
  try {
/*     const data = await ForecastModel.find().sort({
      createddate: 1
    }) */
    const data = await ForecastModel.find().sort({ field: 'asc', _id: -1 });
    res.status(200).json(data);
  } catch (error) {
    logger.error(error.message);
    res.status(400).json(error);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await ForecastModel.findById(req.params.id);

    res.status(200).json(data);
  } catch (error) {
    logger.error(error.message);
    res.status(400).json(error);
  }
};

function datesToArray(startDate, endDate) {
  const diffInMs = new Date(endDate) - new Date(startDate)
  const diffInDays = (diffInMs / (1000 * 60 * 60 * 24)) + 1;
  let arrayOfDays = []
  let newStartDate = new Date(startDate)
  let day = 0
  for (var i = 1; i <= diffInDays; i++) {
    arrayOfDays.push({
      date: new Date(newStartDate.setDate(newStartDate.getDate() + day)),
      value: 0
    })
    day = 1
  }
  return arrayOfDays
}

exports.getby = async (req, res) => {

  try {

    var query = {};

    if (req.query.forecastcategoryname) {
      query["forecastcategoryname"] = req.query.forecastcategoryname
    } else {
      throw TypeError(`forecastcategoryname not defined !`);
    }
    if (req.query.createdbyid) {
      query["createdbyid"] = req.query.createdbyid
    } else {
      throw TypeError(`createdbyid not defined !`);
    }

    if (req.query.periodtype) {
      query["periodtype"] = req.query.periodtype
    }
    if (req.query.fiscalyear) {
      query["fiscalyear"] = req.query.fiscalyear
    }
    if (req.query.fiscalquarter) {
      query["fiscalquarter"] = req.query.fiscalquarter
    }
    if (req.query.fiscalmonth) {
      query["fiscalmonth"] = req.query.fiscalmonth
    }


    var current_date = moment((new Date()), "DD-MM-YYYY");
    const current_year = current_date.year();
    const current_month = current_date.month() + 1;
    const current_day = current_date.date();
    let finded
    let repsSalesForecast = []
    let RepsSalesSum = []
    let datesToArrays = []
    // MONTHLY SEEKING
    if ((req.query.fiscalyear) && (req.query.fiscalquarter) && (req.query.fiscalmonth)) {
      console.log('Monthly Seeking')
      //Get the forecast
      finded = await ForecastModel.find(query).sort({ field: 'asc', _id: -1 });

      //IF MANAGER SEEK FOR REPS FORECAST
      const relatedManager = await ManagerModel.findById(req.query.createdbyid);
      if (relatedManager) {
        for (let sales of relatedManager.salesusers) {
          // RELATED SALES
          let relatedSales = await SalesModel.findById(sales);
          if (relatedSales) {
            query["createdbyid"] = relatedSales.id;
            // console.log(relatedSales.id)
            // GET Forecast
            const findedForecastSales = await ForecastModel.find(query).sort({ field: 'asc', _id: -1 });
            if (findedForecastSales) {
              repsSalesForecast.push(findedForecastSales)
            } else {
              repsSalesForecast.push(null)
            }
          }
        }


        var date = new Date();
        date.setDate(01);
        date.setYear(req.query.fiscalyear);
        date.setMonth(req.query.fiscalmonth - 1);
        const daysInmonth = moment(date, "DD-MM-YYYY").daysInMonth()
        //Fill the reps of each sales
        let RepsSales = []
        repsSalesForecast.forEach(repsOfOneSaleForecast => {
          const arr = Array(daysInmonth).fill(0);
          repsOfOneSaleForecast.reverse().forEach(forecast => {
            const date = moment(forecast.createddate);
            const dow = date.date();
            //console.log(dow);
            arr[dow - 1] = forecast.value;
          })
          repsOfOneSaleForecast.reverse();//adddddd
          RepsSales.push(arr);
        });

        //console.log(RepsSales)
        //Generation of arrays and set the empty ..
        RepsSales.forEach(v => {
          for (var i = v.length; i > 0; i--) {
            if (v[i] != 0) {
              j = i + 1
              while ((v[j] == 0) && (j <= v.length)) {
                v[j] = v[i]
                j++;
              }
            }
          }
        })
        console.log(RepsSales)
        // To Sum sales forecasts in one reps array "RepsSalesSum"
        for (var j = 0; j < daysInmonth; j++) {
          s = 0;
          for (var i = 0; i < RepsSales.length; i++) {
            s += RepsSales[i][j];
          }
          let obj = {
            "date": date,
            "value": s
          }
          RepsSalesSum.push(obj)
        }
        console.log(RepsSalesSum)
        // Formatting "RepsSalesSum" Data to be setted in Graphics
        for (var i = 0; i < daysInmonth; i++) {
          RepsSalesSum[i].date = moment(RepsSalesSum[i].date).set("date", i + 1)
        }
        // If we are in the current Month, values must stop in current day  
        if ((current_year == req.query.fiscalyear) && (current_month == req.query.fiscalmonth)) {
          for (var i = 0; i < daysInmonth; i++) {
            if (i > current_day) {
              RepsSalesSum[i].value = undefined
            }
          }
        }
        console.log(RepsSalesSum)
        
      }
      res.status(200).json({
        success: true,
        data: finded,
        repsSalesForecast: repsSalesForecast,
        RepsSalesSum: RepsSalesSum
      });

    }


    // QUARTERLY SEEKING
    if ((req.query.fiscalyear) && (req.query.fiscalquarter) && (!req.query.fiscalmonth)) {
      console.log('QUARTERLY SEEKING')
      // Get FiscalYearSetting in quarter
       const data = await FiscalYearSettingModel.findOne().sort({
        _id: -1
      }); 

      var date = new Date();
      /*console.log(date.year)
      console.log(date.fiscalyear)
      console.log(date.startmonth)*/
      
      date.setDate(01);
      date.setYear(req.query.fiscalyear);
      date.setMonth(data.startmonth - 1 + ((3 * req.query.fiscalquarter) - 3));


      const firstmonthstartdate = moment(date);
      const daysInfirstmonth = firstmonthstartdate.daysInMonth()
      console.log(`firstmonthstartdate : ${firstmonthstartdate}  daysInmonth:${daysInfirstmonth}    firstmonth:${firstmonthstartdate.month()+1}  `)
      const secondmonthstartdate = moment(firstmonthstartdate).add(1, 'months');
      const daysInsecondmonth = moment(secondmonthstartdate).daysInMonth()
      console.log(`secondmonthstartdate : ${secondmonthstartdate}  daysInsecondmonth:${daysInsecondmonth}    secondmonth:${secondmonthstartdate.month()+1}  `)
      const thirdmonthstartdate = moment(secondmonthstartdate).add(1, 'months');
      const daysInthirdmonth = moment(thirdmonthstartdate).daysInMonth()
      console.log(`thirdmonthstartdate : ${thirdmonthstartdate}  daysInthirdmonth:${daysInthirdmonth}    thirdmonth:${thirdmonthstartdate.month()+1}  `)

      //const totaldays = daysInfirstmonth+secondmonthstartdate+firstmonthstartdate

      query["fiscalmonth"] = {
        $gte: firstmonthstartdate.month() + 1,
        $lte: thirdmonthstartdate.month() + 1,
      }
      //Get the forecast
      finded = await ForecastModel.find(query).find(query).sort({ field: 'asc', _id: -1 });
      //console.log('HHHHHHHH ' + thirdmonthstartdate.endOf("month").format("YYYY-DD-MM"));
      datesToArrays = datesToArray(firstmonthstartdate, thirdmonthstartdate.endOf("month"))
      const totaldays = datesToArrays.length

      //IF MANAGER SEEK FOR REPS FORECAST
      const relatedManager = await ManagerModel.findById(req.query.createdbyid);
      if (relatedManager) {
        for (let sales of relatedManager.salesusers) {
          // RELATED SALES
          let relatedSales = await SalesModel.findById(sales);
          if (relatedSales) {
            query["createdbyid"] = relatedSales.id;
            // GET Forecast
            const findedForecastSales = await ForecastModel.find(query).find(query).sort({ field: 'asc', _id: -1 });
            if (findedForecastSales) {
              repsSalesForecast.push(findedForecastSales)
            } else {
              repsSalesForecast.push(null)
            }
          }
        }
       
        //Fill the reps of each sales
        let RepsSales = []
        repsSalesForecast.forEach(repsOfOneSaleForecast => {
          const arr = Array(totaldays).fill(0);
          repsOfOneSaleForecast.reverse().forEach(forecast => {
            const date = moment(forecast.createddate);
            const dow = date.date();
            //console.log(dow);
            arr[dow - 1] = forecast.value;
          })
          repsOfOneSaleForecast.reverse();//adddddd
          RepsSales.push(arr);
        });
        console.log(RepsSales)
        //Generation of arrays and set the empty ..
        RepsSales.forEach(v => {
          for (var i = v.length; i > 0; i--) {
            if (v[i] != 0) {
              j = i + 1
              while ((v[j] == 0) && (j <= v.length)) {
                v[j] = v[i]
                j++;
              }
            }
          }
        })
        console.log(RepsSales)
        // To Sum sales forecasts in one reps array "RepsSalesSum"
        for (var j = 0; j < totaldays; j++) {
          s = 0;
          for (var i = 0; i < RepsSales.length; i++) {
            s += RepsSales[i][j];
          }
          datesToArrays[j].value = s
          //RepsSalesSum.push(obj)
        }
        console.log(datesToArrays)

/*
        // Formatting "RepsSalesSum" Data to be setted in Graphics
        for (var i = 0; i < totaldays; i++) {
          RepsSalesSum[i].date = moment(RepsSalesSum[i].date).set("date", i + 1)
        }*/

        // If we are in the current Month, values must stop in current day  
        if ((current_year == req.query.fiscalyear) && (current_month == req.query.fiscalmonth)) {
          for (var i = 0; i < totaldays; i++) {
            if (i > current_day) {
              datesToArrays[i].value = undefined
            }
          }
        }
      }
      res.status(200).json({
        success: true,
        data: finded,
        repsSalesForecast: repsSalesForecast,
        RepsSalesSum: datesToArrays
      });

    }
 

 


  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.create = async (req, res) => {
  try {
    /*  if (!req.params.id) throw TypeError("ID not exist : " + req.params.id);

     const manager  = await ManagerModel.findById(req.params.id);   
     if (!manager) throw TypeError(`User with ID : ${req.params.id} not found !`); */

    let newForecast = new ForecastModel({
      ...req.body,
      createddate: Date.now(),
      lastmodifieddate: Date.now(),
      /*    
          createdbyid: manager._id,
          lastmodifiedbyid:  manager._id, 
      */
    });
    const saved = await newForecast.save();


    res.status(200).json({
      success: true,
      data: saved
    });

  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.update = async (req, res) => {
  verifyData(res, req.body);
  try {
    const edited = await ForecastModel.findByIdAndUpdate(req.params.id, {
      ...req.body,
      lastmodifieddate: Date.now(),
    });

    res.status(200).json({
      success: true,
      data: edited
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* 

exports.createCommitForSales = async (req, res) => {
  try {  
    if (!req.params.id) throw TypeError("ID not exist : " + req.params.id);

    const sales  = await SalesModel.findById(req.params.id);   
    if (!sales) throw TypeError(`User with ID : ${req.params.id} not found !`);

    let newForecast = new ForecastModel({
      ...req.body,  
      createddate: Date.now(),
      lastmodifieddate: Date.now(),
      createdbyid: sales._id,
      lastmodifiedbyid:  sales._id,
    });
  
    const saved  = await newForecast.save();   

    res.status(200).json({
      success: true, 
        data: saved
    });

  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; */

exports.delete = async (req, res) => {
  try {
    const deleted = await ForecastModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      data: deleted
    });

  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};