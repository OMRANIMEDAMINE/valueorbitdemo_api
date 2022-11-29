const stompit = require('stompit');
const express = require("express");
const mongoose = require("mongoose");

require("dotenv/config");

const connectOptions = {
    'host': 'b-f4551a8a-d493-48bc-bcb3-ad164dbfff9c-1.mq.us-east-2.amazonaws.com',
    'port': 61614,
    'ssl': true,
    'connectHeaders': {
        'host': '/',
        'login': 'awsuser',
        'passcode': 'QAZ123wsx!!QAZ123wsx!!',
        'heart-beat': '5000,5000'
    }
};


 
module.exports = { connectOptions };
