const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "networkdashboardbyds@gmail.com",
    pass: "umrx mbqv njav cxsn",
  },
});//we need to find any way to hide this info

module.exports = transporter;