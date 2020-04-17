//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
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey( process.env.SENDGRID_API_KEY );

const sendWelcomeEmail = (email, name) => {
    const msg = {
        from: email,
        to: "yanmoenaing@ucsm.edu.mm",
        subject: `Welcome ${name}`,
        text: "Please confirm"
    }

    sgMail.send( msg );
}

const cancelEmail = (email, name) => {
    const msg = {
        from: email,
        to: "yanmoenaign@ucsm.edu.mm",
        subject: "Removed you",
        text: `${name}, please tell us why you don't enjoy our app`,
    }

    sgMail.send( msg );
}

module.exports = {
    sendWelcomeEmail,
    cancelEmail
}


