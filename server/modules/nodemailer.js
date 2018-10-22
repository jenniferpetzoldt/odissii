const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        user: process.env.my_gmail_username,
        clientId: process.env.my_oauth_client_id,
        clientSecret: process.env.my_oauth_client_secret,
        refreshToken: process.env.my_oauth_refresh_token,  
    }
});

module.exports = transporter;