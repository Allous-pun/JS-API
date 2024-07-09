const Mpesa = require('./Mpesa'); // Adjust the path to your Mpesa class file
const axios = require('axios');
const nock = require('nock');

describe('Mpesa Integration Tests', () => {
    let mpesa;

    beforeAll(() => {
        // Initialize Mpesa instance
        mpesa = new Mpesa();
    });

    it('should generate access token', async () => {
        // Mocking the HTTP request to generate access token
        nock('https://sandbox.safaricom.co.ke')
            .post('/oauth/v1/generate?grant_type=client_credentials')
            .reply(200, { access_token: 'mock_access_token' });

        await mpesa.generateAccessToken();
        expect(mpesa.accessToken).toEqual('mock_access_token');
    });

    it('should build STK push request payload', () => {
        const phoneNumber = '+254xxxxxxxxx';
        const amount = 100;
        const description = 'tests STK push payment';

        const data = mpesa.buildStkPushRequest(phoneNumber, amount, description);

        // Add assertions to validate the structure of data object
        expect(data.phone_number).toEqual(phoneNumber);
        expect(data.Amount).toEqual(amount);
        expect(data.TransactionDesc).toEqual(description);
        // Add more assertions as per your payload structure
    });

    it('should send STK push request', async () => {
        // Mocking the HTTP POST request to send STK push request
        const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/process';
        const data = { /* mock data */ };

        nock(url)
            .post('/')
            .reply(200, { /* mock response */ });

        const response = await mpesa.sendStkPushRequest(url, data);
        expect(response.status).toEqual(200);
        // Add more assertions based on expected response
    });
});
