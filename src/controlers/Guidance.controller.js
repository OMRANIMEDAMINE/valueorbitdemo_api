const logger = require('../../config/logger');
const axios = require('axios');



exports.getby = async (req, res) => {
  try {

    //const data = await AccountModel.find();

    const message = req.query.message;
    const id = req.query.id;

     logger.info(`Request Guidance is started . .  `);

    let data = await axios.get(`${process.env.AI_BASE_URL}/guidance?message=${message}&id=${id}`);
    // Work with the response...
    logger.info(`Request Guidance works properly !`);
    res.status(200).json({
      success: true,
      data: data?.data?.guidance_data?.guidance || []
    });

  } catch (error) {
    if (error.response) {
      // The client was given an error response (5xx, 4xx)    
      logger.error(`Request Guidance not works - AI api return an error response !-- Details: ${error.message} `);
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else if (error.request) {
      // The client never received a response, and the request was never left
      logger.error(`Request Guidance Not works -  The api never received a response from AI api, and the request was never left ! -- Details: ${""+error.message}`);
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      // Anything else
      logger.error(`Request Guidance not works - unknown error ! -- Details: ${error.message} `);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

}