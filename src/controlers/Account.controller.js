const AccountModel = require("../models/account.model");
const ContactModel = require("../models/contact.model");
const SalesModel = require("../models/SalesUser.model");
const ManagerModel = require("../models/ManagerUser.model");
const OppoModel = require("../models/Opportunity.model");
const logger = require('../../config/logger');

const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204);
    return;
  }
};



exports.getAllCountryNames = async (req, res) => {
  try { //sortorder: { $ne: null },
    const data = await AccountModel.find({
      "billingcountry": {
        "$exists": true,
        "$ne": ""
      }
    }).distinct('billingcountry');
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllRegionNames = async (req, res) => {
  try { //sortorder: { $ne: null },
    const data = await AccountModel.find({
      "billingstate": {
        "$exists": true,
        "$ne": ""
      }
    }).distinct('billingstate');
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getAll = async (req, res) => {
  try {
    const data = await AccountModel.find()
    .populate({
      path: 'opportunities',
      select: 'id idorigin name amount risk dealprogress dealcoaching forecastcategoryname iswon lastmodifieddate manageruser salesuser',
      populate: [{
        path: 'manageruser',
        select: ('id idorigin name'),
      },
      {
        path: 'salesuser',
        select: ('id idorigin name'),
      },
    ]
    }).sort({
      createddate: -1
    });

    if (!data) throw TypeError("Getting Accounts not works !");

    const contactsFound = await ContactModel.find().select('id accountid');
    if (!contactsFound) throw TypeError("Getting Contacts not works !");
    // console.log(contacts)
    let oppo_per_account = []
    let oppo_total_progress = []
    let oppo_total_coaching = []
    let oppo_total_risk = []
    let contacts = []
    let oppo_lastTouch = []
    data.map((account) => {

      /*  const managerFound = await ManagerModel.find({
         idorigin: account.ownerid
       }).select('id name');


       if (salesFound)  
       account.ownername = salesFound

       const salesFound = await SalesModel.findOne({
         idorigin: account.ownerid
       }).select('id name'); */



      oppo_per_account.push(account.opportunities.length);
      if (account.opportunities.length > 0) {
        totalProgress = account.opportunities.map(row => row.dealprogress).reduce((acc, row) => row + acc);
        oppo_total_progress.push(totalProgress / (account.opportunities.length));
      } else {
        oppo_total_progress.push(0);
      }
      if (account.opportunities.length > 0) {
        totalcoaching = account.opportunities.map(row => row.dealcoaching).reduce((acc, row) => row + acc);
        oppo_total_coaching.push(totalcoaching / (account.opportunities.length));
      } else {
        oppo_total_coaching.push(0);
      }



      let filteredContacts = contactsFound.filter(item => item.accountid === account.idorigin).length;
      //console.log(contacts.length)
      contacts.push(filteredContacts);

      account.opportunities.sort((a, b) => {
        return new Date(b.lastmodifieddate) - new Date(a.lastmodifieddate);
      })
      if (account.opportunities.length > 1) {
        //console.log(account.opportunities[0].lastmodifieddate)
        oppo_lastTouch.push(account.opportunities[0].lastmodifieddate)
      } else {
        oppo_lastTouch.push(null);
      }




    });

    // risk dealprogress dealcoaching forecastcategoryname iswon
    /* data.totalOpportunities = data.map(row => row.opportunities).reduce((acc, row) => row + acc);
      data.totalOpportunities = data.rows.map(row => row.amount).reduce((acc, row) => row + acc);
      data.totalOmmited = data.filter(item => item.forecastcategory === 'Ommited').length;
      data.totalPipeline = data.rows.filter(item => item.forecastcategory === 'Pipeline').length;
 */
    res.status(200).json({
      success: true,
      data: data,
      // length: data.length,
      // oppo_per_account: oppo_per_account,
      // oppo_total_progress: oppo_total_progress,
      // oppo_total_coaching: oppo_total_coaching,
      oppo_lastTouch: oppo_lastTouch,
      contacts: contacts

    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};



exports.getAllByManagerID_Origin = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("owner ID not given");
    // Related Manager 
    const relatedManager = await ManagerModel.findOne({
      idorigin: req.params.id
    }).populate({
      path: 'salesusers',
      select: 'id idorigin name',
    });
    if (!relatedManager) throw TypeError("relatedManager not found");


    let salesusersIDs = []
    salesusersIDs.push(relatedManager.idorigin)

    if (relatedManager.salesusers.length > 0) {
      let salesusersfound = [...relatedManager.salesusers];
      salesusersfound.forEach(({
        idorigin
      }) => {
        if (idorigin) salesusersIDs.push(idorigin)
      });
    }
    //console.log(salesusersIDs);

    const data = await AccountModel.find({
        ownerid: {
          $in: salesusersIDs
        }
      })
      .populate({
        path: 'opportunities',
        select: 'id idorigin name amount risk dealprogress dealcoaching forecastcategoryname iswon lastmodifieddate stagename manageruser salesuser',
        populate: [{
          path: 'manageruser',
          select: ('id idorigin name'),
        },
        {
          path: 'salesuser',
          select: ('id idorigin name'),
        },
    
      ]
      }).sort({
        createddate: -1
      });

    if (!data) throw TypeError("Getting Accounts not works !");

    const contactsFound = await ContactModel.find().select('id accountid');
    if (!contactsFound) throw TypeError("Getting Contacts not works !");
    // console.log(contacts)

    let contacts = []
    let oppo_lastTouch = []
    data.map((account) => {
      let filteredContacts = contactsFound.filter(item => item.accountid === account.idorigin).length;
      //console.log(contacts.length)
      contacts.push(filteredContacts);


      account.opportunities.sort((a, b) => {
        return new Date(b.lastmodifieddate) - new Date(a.lastmodifieddate);
      })
      if (account.opportunities.length > 1) {
        //console.log(account.opportunities[0].lastmodifieddate)
        oppo_lastTouch.push(account.opportunities[0].lastmodifieddate)
      } else {
        oppo_lastTouch.push(null);
      }



    });

    res.status(200).json({
      success: true,
      data: data,
      oppo_lastTouch: oppo_lastTouch,
      contacts: contacts


    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};



exports.getAllBySalesID_Origin = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("owner ID not given");
    const data = await AccountModel.find({
        ownerid: req.params.id
      })
      .populate({
        path: 'opportunities',
        select: 'id idorigin name amount risk dealprogress dealcoaching forecastcategoryname iswon lastmodifieddate stagename manageruser salesuser',
        populate: [{
          path: 'manageruser',
          select: ('id idorigin name'),
        },
        {
          path: 'salesuser',
          select: ('id idorigin name'),
        },
      ]
      }).sort({
        createddate: -1
      });
      

    if (!data) throw TypeError("Getting Accounts not works !");

    const contactsFound = await ContactModel.find().select('id accountid');
    if (!contactsFound) throw TypeError("Getting Contacts not works !");
    //console.log(contacts)

    let contacts = []
    let oppo_lastTouch = []
    data.map((account) => {
      let filteredContacts = contactsFound.filter(item => item.accountid === account.idorigin).length;
      //console.log(contacts.length)
      contacts.push(filteredContacts);



      account.opportunities.sort((a, b) => {
        return new Date(b.lastmodifieddate) - new Date(a.lastmodifieddate);
      })
      if (account.opportunities.length > 1) {
        //console.log(account.opportunities[0].lastmodifieddate)
        oppo_lastTouch.push(account.opportunities[0].lastmodifieddate)
      } else {
        oppo_lastTouch.push(null);
      }


    });


    res.status(200).json({
      success: true,
      data: data,
      oppo_lastTouch: oppo_lastTouch,
      contacts: contacts

    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};




exports.getById = async (req, res) => {
  try {
    const data = await AccountModel.findById(req.params.id); //.populate([ "opportunities"]);


    //          options: { sort: { last_modified: "ascending" } },

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.create = async (req, res) => {
  //data validator
  verifyData(res, req.body);

  const newAccount = new AccountModel({
    ...req.body
  });
  try {
    const saved = await newAccount.save();
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
    const edited = await AccountModel.findByIdAndUpdate(req.params.id, {
      ...req.body,
      last_modified: Date.now(),
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


exports.updatetest = async (req, res) => {
  verifyData(res, req.body);

  try {
    const oppos = await OppoModel.find().populate('account');

    for (let opp of oppos) {
      let account = await AccountModel.findOne({
        idorigin: opp.accountid
      }).populate('opportunities');
      if (!account.opportunities.includes(opp)) {
        await AccountModel.findOneAndUpdate({
          idorigin: opp.accountid
        }, {
          $push: {
            opportunities: opp
          }
        }, );
      }

    }

    /* 
    const edited = await AccountModel.findByIdAndUpdate(req.params.id, {
      ...req.body,
      last_modified: Date.now(),
    });
 */


    res.status(200).json({
      success: true,
      data: oppos
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.delete = async (req, res) => {
  try {
    const deleted = await AccountModel.findByIdAndDelete(req.params.id);
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