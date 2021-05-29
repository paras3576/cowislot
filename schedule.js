var cron = require('cron');
const express = require('express');
const app = express();
//console.log('hello');
//var index=require('./index.js');
var cronJob = cron.job("*/20 * * * * *", function(){
    //index.scheduleEmail();
    app.get("/where", (req, res) => {

        res.status(301).redirect("https://cowislot.herokuapp.com/scheduling")

    })
    console.info('cron job completed');
});
cronJob.start();
