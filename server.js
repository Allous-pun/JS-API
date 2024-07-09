// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Mpesa = require('./Mpesa');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

const mpesa = new Mpesa();

app.post('/api/stkpush', async (req, res) => {
    const { phoneNumber, amount, description } = req.body;

    try {
        await mpesa.generateAccessToken();
        const data = mpesa.buildStkPushRequest(phoneNumber, amount, description);
        const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/process';
        
        const response = await mpesa.sendStkPushRequest(url, data);
        res.status(200).send(response.data);
    } catch (error) {
        res.status(500).send({ error: 'Failed to initiate STK push' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

