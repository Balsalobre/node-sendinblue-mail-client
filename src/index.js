require('dotenv').config();

const express = require('express');
const {
  ApiClient,
  ContactsApi,
  CreateContact } = require('sib-api-v3-sdk');

const app = express();

const port = process.env.API_PORT ?? 3001;
app.listen(port, () => {
  console.log(`Service working in port: ${port}`);
});

app.post('/sendemail', async (req, res) => {
  req.body = {
    email: 'holi'
  };
  const email = req.body.email;
  const { authentications } = ApiClient.instance;
  authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;

  const apiInstance = new ContactsApi();
  const createContact = new CreateContact();
  createContact.email = email;
  console.log(createContact);
  console.log(apiInstance);
});
