require('dotenv').config();
const sgMail = require('@sendgrid/mail')
const mail_api = process.env.SENDGRID_MAIL_API
var trycatch = require('trycatch')
const MongoClient = require('mongodb').MongoClient;
const pass = process.env.DB_PASSWORD_TOKEN;
const outlook_pass = process.env.DB_PASSWORD_OUTLOOK;
const uri = "mongodb+srv://paras:" + pass + "@cluster0.ia9fk.mongodb.net/cowislot_app?retryWrites=true&w=majority";
const express = require('express');
const nodemailer = require('nodemailer');
const Datastore = require('nedb');
const app = express();
const fetch = require('node-fetch');
const cors = require('cors');
const schedule = require('node-schedule');
var nodeoutlook = require('nodejs-nodemailer-outlook')
//const accountSid=process.env.TWILIO_ACCOUNT_SID;
//const autheToken=process.env.TWILIO_AUTH_TOKEN;
//const mobile_from=process.env.MOBILE_FROM;
//const email_from=process.env.EMAIL_FROM;
//const email_pass_token=process.env.EMAIL_PASS_TOKEN;
//const client=require('twilio')(accountSid,autheToken);
const email_from = process.env.EMAIL_FROM;
const email_pass_token = process.env.EMAIL_PASS_TOKEN;
const port = process.env.PORT || 3000;


sgMail.setApiKey(mail_api);

const meta = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
};

let transporter = nodemailer.createTransport({
  service: 'gmail',
  //host: 'smtp.office365.com',
  //port: '587',
  auth: {
    user: email_from,
    pass: email_pass_token
  },
  //secureConnection: true,
  //tls: { ciphers: 'SSLv3' }
});

let transporter2 = nodemailer.createTransport({
  //service: 'gmail',
  host: 'smtp.office365.com',
  port: '587',
  auth: {
    //user: email_from,
    //pass: email_pass_token
    user: "cowislot@outlook.com",
    pass: outlook_pass
  },
  secureConnection: true,
  tls: {
    ciphers: 'SSLv3'
  }
});

var mailOptions;

app.listen(port, () => console.log('listening at 3000'));
app.use(express.static('public'));
app.use(express.json({
  limit: '1mb'
}));

app.use(cors());



//To unsubscribe a user
app.all('/unsubscribe/:remove_params', async (request, response) => {
  const remove_params = request.params.remove_params.split(',');
  const remove_pin = remove_params[0];
  const remove_mob = remove_params[1];
  const remove_email = remove_params[2];
  const remove_age = remove_params[3];

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const db = client.db('cowislot_app');
  try {
    const db_remove_data = await db.collection('user_data').find({}).toArray();
    //console.log(db_remove_data);

    //Finding the user in the database to unsubscribe it from the alerts
    //database.find({}, async (err, db_remove_data) => {
    var dbRemove, db_remove_email, db_remove_pin, db_remove_mob, db_remove_age, user_data_remove;
    var entry_found = 0;
    for (dbRemove = 0; dbRemove < db_remove_data.length; dbRemove++) {
      db_remove_email = db_remove_data[dbRemove].Email;
      db_remove_pin = db_remove_data[dbRemove].Pin;
      db_remove_mob = db_remove_data[dbRemove].Mob;
      db_remove_age = db_remove_data[dbRemove].Age;

      if (db_remove_email == remove_email && db_remove_pin == remove_pin && db_remove_age == remove_age) {
        user_data_remove = {
          Email: db_remove_email,
          Pin: db_remove_pin,
          Mob: db_remove_mob,
          Age: db_remove_age
        };
        var age_email;
        if (remove_age == 18) {
          age_email = '18-45';
        } else {
          age_email = '45+';
        }
        mailOptions_unsubscribe = {
          from: email_from,
          to: remove_email,
          subject: 'Cowislot UnSubscription Successful',
          text: 'Dear User,\n\n You are successfully unsubscribed to the email alerts for the vaccine availability at the requested pincode-' + remove_pin + ' and age group:' + age_email + '.\n' +
            'Thank you for the connection we had and we hope to get connected again soon.Stay Safe!' + '\n\n\n Happy To Help,\n Cowislot Team.'

        };


        const del = await db.collection('user_data').removeOne(user_data_remove);
        //console.log("Del"+del);

        if (del) {
          console.log("Successfully removed " + remove_email);
        } else {
          console.log("Error deleting ");
        }
        //   , function(err, res) {
        //   if (err) {
        //     //client.close();
        //     console.log("Error deleting " + err);
        //   } else {
        //     console.log("Successfully removed " + remove_email);
        //   }
        // });

        console.log('You are successfully unsubscribed');
        transporter.sendMail(mailOptions_unsubscribe, function(err, data) {
          if (err) {
            console.log(err);
          } else {
            console.log('Mail Sent for Unsubscription to ' + remove_email);
          }
        });
        /////////////Using Send Grid///
        // console.log("sending mail");
        // sgMail
        //   .send(mailOptions_unsubscribe)
        //   .then((response) => {
        //     console.log(response[0].statusCode)
        //     console.log(response[0].headers)
        //   })
        //   .catch((error) => {
        //     console.error(error)
        //   })
        //   try{
        //   transporter.sendMail({
        //     from :"cowislot@outlook.com",
        //     to:"paras3576@gmail.com",
        //     subject:"Unsubscibe from Outlook",
        //     text:"hello"
        //   });
        // }catch(error){
        //   console.log(error);
        // }


        //         nodeoutlook.sendEmail({
        //     auth: {
        //         user: "cowislot@outlook.com",
        //         pass: "dandimatlaA26@"
        //     },
        //     from: "cowislot@outlook.com",
        //     to: "paras.moveon@gmail.com",
        //     subject: "Cowislot Unsubscription Successful",
        //     text: "Thanks for your time",
        //     onError: (e) => console.log(e),
        //     onSuccess: (i) => console.log(i)
        // });
        //console.log('You are successfully unsubscribed');
        response.json({
          color: 'green',
          message: 'You are successfully unsubscribed!!'
        });
        entry_found = 1;
        break;
      }
    }


    if (entry_found == 0) {
      console.log('You are not yet subscribed ' + remove_email);
      response.json({
        color: 'red',
        message: 'You are not yet subscribed!!'
      });
    }

  } finally {
    client.close();
    console.log("Connection closed in Unsubscribe");
  }
});

//To subscribe a user
app.get('/vaccine/:pind', async (request, response) => {
  const pind = request.params.pind.split(',');
  const pin = pind[0];
  const mob = pind[1];
  const email = pind[2];
  const age = pind[3];

  const client2 = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const db2 = client2.db('cowislot_app');
  try {
    const db_data = await db2.collection('user_data').find({}).toArray();
    //console.log(db_data);

    var dbFind, db_email, db_pin, db_mob, db_age, user_data;
    var found = 0;
    for (dbFind = 0; dbFind < db_data.length; dbFind++) {
      db_email = db_data[dbFind].Email;
      db_pin = db_data[dbFind].Pin;
      db_mob = db_data[dbFind].Mob;
      db_age = db_data[dbFind].Age;

      if (db_email == email && db_pin == pin && db_age == age) {
        console.log('You are already subscribed ' + email);
        response.json({
          color: 'red',
          message: 'You are already subscribed!!'
        });
        found = 1;
        break;
      }
    }

    if (found == 0) {
      user_data = {
        Email: email,
        Pin: pin,
        Mob: mob,
        Age: age
      };
      var email_age1;
      if (age == 18) {
        email_age1 = '18-45';
      } else {
        email_age1 = '45+';
      }
      mailOptions_subscribe = {
        from: email_from,
        to: email,
        subject: 'Cowislot Subscription Successful',
        text: 'Dear User,\n\n You are successfully subscribed to the email alerts for the vaccine availability at the requested pincode-' + pin + ' and age group:' + email_age1 + '.\n' +
          'We will alert you in every 15 minutes about the available doses once they come in stock.\n\nPlease check your emails regularly and please let us know in case of any issues' + '\n\n\n Happy To Help,\n Cowislot Team.'

      };


      const items = await db2.collection('user_data').insertOne(user_data);

      if (items) {
        console.log("Successfully inserted " + email)
      } else {
        console.log("Error inserting ");
      }
      // , function(err, res) {
      //   if (err) {
      //     //client.close();
      //     console.log("Error inserting " + err);
      //   } else {
      //     console.log("Successfully inserted " + email);
      //   }
      // });


      console.log('You are successfully subscribed');
      transporter.sendMail(mailOptions_subscribe, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log('Mail Sent for subscription to ' + email);
        }
      });
      response.json({
        color: 'green',
        message: 'You are successfully subscribed!!'
      });
    }

  } finally {
    client2.close();
    console.log("Connection closed in Subscribe");
  }




});

//});

//Scheduling the job to fetch details from db and search the details for the subscribed users
//schedule.scheduleJob('*/20 * * * * *',()=>{
//console.log('inside schdeuler');

app.get('/scheduling', async (request, response) => {
  console.log("Schedule started");
  scheduleEmail();
  console.log("Schedule completed");
  response.json({
    message: 'Successfully called'
  })
})

async function scheduleEmail() {
  var today = new Date();
  var month_today = (today.getMonth() + 1);
  if ((month_today.toString().length) < 2) {
    month_today = "0" + month_today.toString();
  }

  var date_today = today.getDate() + '-' + month_today + '-' + today.getFullYear();

  const client3 = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const db3 = client3.db('cowislot_app');
  try {
    const data = await db3.collection('user_data').find({}).toArray();
    //console.log(data.length);
    //database.find({}, async (err, data) => {
    var dbCounter;
    for (dbCounter = 0; dbCounter < data.length; dbCounter++) {
      email_db = data[dbCounter].Email;
      pin_db = data[dbCounter].Pin;
      age_db = data[dbCounter].Age;


      const api_url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pin_db}&date=${date_today}`;
      //  try {
      const fetch_response = await fetch(api_url, {
        headers: meta,
        method: 'GET'
      });
      //console.log(fetch_response);

      const json = await fetch_response.json();
      //console.log("json "+json);

      const centers = json['centers'];
      //console.log("Centers: "+centers);
      if (centers != undefined) {
        var i, j, iter, sessions, Name, Address, Block, District, PinCode, Fees, Available_capacity, Available_capacity_Dose1, Available_capacity_Dose2, Date1, Age_Limit, Vaccine;
        var availability = [];
        var match;
        for (i = 0; i < centers.length; i++) {
          Name = centers[i].name;
          Address = centers[i].address;
          Block = centers[i].block_name;
          District = centers[i].district_name;
          PinCode = centers[i].pincode;
          Fees = centers[i].fee_type;
          sessions = centers[i].sessions;

          for (j = 0; j < sessions.length; j++) {
            Available_capacity = sessions[j].available_capacity;
            Date1 = sessions[j].date;
            Age_Limit = sessions[j].min_age_limit;
            Available_capacity_Dose1 = sessions[j].available_capacity_dose1;
            Available_capacity_Dose2 = sessions[j].available_capacity_dose2;

            if (sessions[j] != null) {

              //console.log(availability);
              if (Available_capacity > 0 && Age_Limit == age_db) {
                match = 0;
                for (iter = 0; iter < availability.length; iter++) {
                  if (availability[iter].Date == Date1 && availability.length != 0) {
                    availability[iter].Available[0] = (+availability[iter].Available[0]) + (+Available_capacity_Dose1);
                    availability[iter].Available[1] = (+availability[iter].Available[1]) + (+Available_capacity_Dose2);
                    match = 1;
                    break;
                  }
                }
                if (match == 0) {
                  availability.push({
                    Date: Date1,
                    Age: Age_Limit,
                    Available: [Available_capacity_Dose1, Available_capacity_Dose2]
                  });
                }
              }
            }
          }
        }

        //console.log('Availability for user '+email_db+'age'+age_db+'pin:'+pin_db);
        //console.log(availability);
        if (availability.length > 0) {

          var data_mail = '';
          var email_age2;
          var data_counter;
          for (data_counter = 0; data_counter < availability.length; data_counter++) {
            if (availability[data_counter].Age == 18) {
              email_age2 = '18-45';
            } else {
              email_age2 = '45+';
            }
            data_mail += 'Date: ' + availability[data_counter].Date + '\n' + 'Age: ' + email_age2 + '\n' +
              'Available_Dose1: ' + availability[data_counter].Available[0] + '\n' + 'Available_Dose2: ' + availability[data_counter].Available[1] + '\n\n';
          }
          mailOptions = {
            from: email_from,
            to: email_db,
            subject: 'Vaccine Available Alert',
            text: 'Dear User,\n\n Vaccine is available now at your pincode-' + PinCode + '.The details are as below:\n\n' + data_mail +
              'Please book your slots fast on Cowin website before they get booked' + '\n\n\n Happy To Help,\n Cowislot Team.'

          };

          mailOptions_outlook = {
            from: "cowislot@outlook.com",
            to: email_db,
            subject: 'Vaccine Available Alert',
            text: 'Dear User,\n\n Vaccine is available now at your pincode-' + PinCode + '.The details are as below:\n\n' + data_mail +
              'Please book your slots fast on Cowin website before they get booked' + '\n\n\n Happy To Help,\n Cowislot Team.'

          };
          ///commenting temporary for using outlook functionality
          // transporter.sendMail(mailOptions, function(err, data) {
          //   if (err) {
          //     console.log(err);
          //   } else {
          //     console.log('Mail Sent For Vaccine Details to ' + data.envelope.to[0]);
          //     //envelope: { from: 'cowislot@gmail.com', to: [ 'paras3576@gmail.com' ] },
          //     //console.log(data.envelope.to[0]);
          //   }
          // });
          console.log("sending outlook mail");

          await transporter2.sendMail(mailOptions_outlook, function(err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log('Mail Sent For Vaccine Details to ' + data.envelope.to[0]);
              //envelope: { from: 'cowislot@gmail.com', to: [ 'paras3576@gmail.com' ] },
              //console.log(data.envelope.to[0]);
            }
          });
          //await delay(2000);

        }

        console.log('\n');

      }
      //  } catch (error) {
      //    console.error(error);

      //  }
    }
    //await client3.close();
  } finally {
    client3.close();
    console.log("Connection closed in Scheduling");
  }
  //});
}

app.get('/count', async (request, response) => {
  console.log("Count function ");

  const client_count = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const db_count = client_count.db('cowislot_app');

  try {
    const db_count_data = await db_count.collection('user_data').countDocuments();
    console.log(db_count_data);

  response.json({
    count: db_count_data
  })
}finally{
  client_count.close();
}
});

module.exports = {
  scheduleEmail
};
