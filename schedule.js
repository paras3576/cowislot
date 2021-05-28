var cron = require('cron');
//console.log('hello');
var index=require('./index.js');
var cronJob = cron.job("*/20 * * * * *", function(){
    index.scheduleEmail();
    console.info('cron job completed');
}); 
cronJob.start();