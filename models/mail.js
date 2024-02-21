//Requerimos el paquete
var nodemailer = require('nodemailer');

methods.enviarmail = function(mailfrom, mailto, subject, text) {
    
    //Creamos el objeto de transporte
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'luisvgf30@gmail.com',
            pass: 'atiq xlqv lppz fwvp'
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




