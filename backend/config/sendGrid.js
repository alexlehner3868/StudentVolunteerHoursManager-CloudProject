const fs = require('fs');
const sgMail = require('@sendgrid/mail');

// Read and set the api key
const sendGridApiKeyFile = process.env.SENDGRID_API_KEY_FILE || './secrets/sendgrid_api_key.txt';
const sendGridApiKey = fs.readFileSync(sendGridApiKeyFile, 'utf-8').trim();
sgMail.setApiKey(sendGridApiKey);

// the email address to be used to send all emails
const single_sender = 'm.alkahil@mail.utoronto.ca';

// function used to send emails
async function sendEmail({to, subject, html, text}){
    const msg ={
        to,
        from: single_sender,
        subject,
        html,
        text,
    };
    try{
        await sgMail.send(msg);
        console.log(`Email successfully sent to ${to}`);
    } catch(error){
        console.log(`SendGrid error: ${error}`);
        throw error;
    }
}

module.exports = {sendEmail, sgMail};

