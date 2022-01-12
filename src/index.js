const express = require('express');
const nodemailer = require('nodemailer');

const app = express();

app.post('/send-email', (req, res) => {
  console.log('Email enviado');
});

app.listen(3001, () => {
  console.log('Service working in port 3001');
});