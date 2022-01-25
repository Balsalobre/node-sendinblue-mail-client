require('dotenv').config();

const express = require('express');
const cors = require('cors');
const {
  ApiClient,
  ContactsApi,
  CreateContact,
  TransactionalEmailsApi
} = require('sib-api-v3-sdk');
const package = require('../package.json');

const app = express();

app.use(cors({ origin: process.env.ALLOW_ORIGIN }));
app.use(express.json({ limit: '1MB' }));
app.use(express.urlencoded({ extended: true }));

const port = process.env.API_PORT ?? 3347;
app.listen(port, () => {
  console.log(`Service working in port: ${port}`);
});

app.get('/', (req, res) => {
  res.status(200).json({ 'api-version': package.version });
});

app.post('/join-newsletter', async (req, res) => {
  const { email } = req.body;
  const { authentications } = ApiClient.instance;
  authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;

  const apiInstance = new ContactsApi();
  const createContact = new CreateContact();
  createContact.email = email;
  createContact.listIds = [2];

  try {
    await apiInstance.createContact(createContact);
    res.status(200).json({ message: 'User added to our newsletter' });
  } catch (e) {
    if (e.status === 400) {
      const error = JSON.parse(e.response.text);
      res.status(e.status).json({ ...error });
    } else {
      res.status(500).json({ error: e });
    }
  }
});

app.post('/sendemail', async (req, res) => {
  if(req.get('origin') !== process.env.ALLOW_ORIGIN) {
    console.error('Origin not allowed');
    res.status(405).json({ message: 'Not allowed'});
    return;
  }
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`IP address: ${ip.replace(/^.*:/, '')}`);
  console.log(req.get('origin'));

  const { name, email, subject, emailBody } = req.body;
  const { authentications } = ApiClient.instance;
  authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;
  const apiInstance = new TransactionalEmailsApi();
  const sendSmtpEmail = {
    sender: {
      name,
      email
    },
    to: [
      {
        email: process.env.SENDER_EMAIL_TO,
        name: process.env.SENDER_NAME_TO,
      },
    ],
    subject,
    htmlContent:
      `<html><head></head><body><p>${emailBody}</p></body></html>`,
  };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error sending email' });
  }
});
