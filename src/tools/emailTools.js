import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_KEY);

export const sendRegistrationEmail = async (recipientAddress) => {
  const msg = {
    to: recipientAddress,
    from: process.env.SENDER_EMAIL,
    subject: "subject of the email",
    text: "bla bla bla",
    html: "<p>hello</p>",
  };
  await sgMail.send(msg);
};
