const redshiftClient = require('../../config/redshiftConfig');

const logger = require('../../config/logger');

const _ = require("lodash");

let moment = require("moment");
if ("default" in moment) {
  moment = moment["default"];
}

exports.createdb = async (req, res) => {
  try {
    
    const data = await redshiftClient.query(`CREATE DATABASE ${req.params.db_name}`, null);

    res.status(200).json({
      success: true
    });

  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllOpportunity = async (req, res) => {
  try {

    const data = await redshiftClient.query("select * from salesforcelive.opportunity limit 10", null);

    res.status(200).json({
      success: true,
      data: data.rows
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
exports.getOpportunityFiltered = async (req, res) => {
  try {
    const conditions = [];
    if (req.query.fiscalyear) {
      conditions.push(`fiscalyear` + " = " + req.query.fiscalyear);
    }
    if (req.query.fiscalquarter) {
      conditions.push(`fiscalquarter` + " = " + req.query.fiscalquarter);
    }
    if (req.query.amountmin && req.query.amountmax) {
      conditions.push(`amount` + " BETWEEN " + req.query.amountmin + " AND " + req.query.amountmax);
    }
    if (req.query.forecastcategory) {
      conditions.push(`forecastcategory` + " LIKE '" + req.query.forecastcategory + "'");
    }

    if (req.query.fiscalmonth) {
      conditions.push(`fiscalmonth` + " = " + req.query.fiscalmonth);
    }

    //  let sql = "SELECT TOP " + Total_todo + " *  FROM opportunity ORDER BY  rowid DESC ";
    let sql = "SELECT TOP 10 * FROM salesforcelive.opportunity " + (conditions.length ? ("WHERE " + conditions.join(" AND ")) : "");
    //console.log("sql :" + sql);

    await redshiftClient.query(sql, null, (err, data) => {
      if (err) throw err;
      else {
        data.totalamount = 0;
        data.totalnumber = 0;
        data.totalOmmited = 0;
        data.totalPipeline = 0;
        data.totalBest_Case = 0;
        data.totalCommit = 0;
        data.totalClosed = 0;
        data.totalnumber = data.rows.length;
        if (data.rows.length != 0) {
          data.totalamount = data.rows.map(row => row.amount).reduce((acc, row) => row + acc);
          data.totalOmmited = data.rows.filter(item => item.forecastcategory === 'Ommited').length;
          data.totalPipeline = data.rows.filter(item => item.forecastcategory === 'Pipeline').length;
          data.totalBest_Case = data.rows.filter(item => item.forecastcategory === 'Best Case').length;
          data.totalCommit = data.rows.filter(item => item.forecastcategory === 'Commit').length;
          data.totalClosed = data.rows.filter(item => item.forecastcategory === 'Closed').length;
        }
        res.json(data);
      }
    });


  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
 */


exports.getAllStage = async (req, res) => {
  try {

    const data = await redshiftClient.query("select * from salesforcelive.opportunitystage", null);

    res.status(200).json({
      success: true,
      data: data.rows
    });

  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllHistoryLog = async (req, res) => {
  try {

    const data = await redshiftClient.query("select * from salesforcelive.opportunityhistorylog", null);
    res.status(200).json({
      success: true,
      data: data.rows
    });


  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllHistoryLogbyOppo = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("ID Opportunity not given");
    const id = req.params.id;
    const data = await redshiftClient.query(`select * from salesforcelive.opportunityhistorylog where opportunityid = '${id}'`, null);


    res.status(200).json({
      success: true,
      data: data.rows
    });


  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllForecastingowneradjustment = async (req, res) => {
  try {
    const data = await redshiftClient.query("select * from salesforcelive.forecastingowneradjustment", null);


    res.status(200).json({
      success: true,
      data: data.rows
    });


  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllForecastingquota = async (req, res) => {
  try {
    const data = await redshiftClient.query("select * from salesforcelive.forecastingquota", null);

    res.status(200).json({
      success: true,
      data: data.rows
    });


  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllPeriod = async (req, res) => {
  try {
    const data = await redshiftClient.query("select * from salesforcelive.period", null);



    res.status(200).json({
      success: true,
      data: data.rows
    });

  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllAccount = async (req, res) => {
  try {
    const data = await redshiftClient.query("select * from salesforcelive.account", null);

    res.status(200).json({
      success: true,
      data: data.rows
    });


  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getAllContact = async (req, res) => {
  try {
    const data = await redshiftClient.query("select * from salesforcelive.contact", null);

    res.status(200).json({
      success: true,
      data: data.rows
    });


  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.messages
    });
  }
};