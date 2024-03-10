var nodemailer = require('nodemailer');

enviarmail = function (mailfrom, mailto, subject, text) {

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'practicamariomail@gmail.com',
            pass: 'oshj ntlr qokm xqde'
        }
    });

    var mailOptions = {
        from: mailfrom,
        to: mailto,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email enviado: ' + info.response);
        }
    });
};




