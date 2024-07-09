require('dotenv').config();
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

class Mpesa {
    /**
     * This class represents M-pesa functionalities for STK push integration.
     */
    constructor() {
        /**
         * Initialize the Mpesa object with credentials from environment variables.
         */
        this.consumerKey = process.env.CONSUMER_KEY;
        this.consumerSecret = process.env.CONSUMER_SECRET;
        this.initiatorName = process.env.INITIATOR_NAME;
        this.initiatorPassword = process.env.INITIATOR_PASSWORD;
        this.businessShortCode = process.env.BUSINESS_SHORTCODE;
        this.securityCredential = process.env.SECURITY_CREDENTIAL;
        this.passKey = process.env.PASS_KEY;
        this.accessToken = null; // Placeholder for access token
    }

    generateAccessToken() {
        /**
         * This obtains an access token using OAuth 1.0a.
         */
        const oauth = OAuth({
            consumer: { key: this.consumerKey, secret: this.consumerSecret },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string, key) {
                return crypto
                    .createHmac('sha1', key)
                    .update(base_string)
                    .digest('base64');
            },
        });

        const request_data = {
            url: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            method: 'POST',
        };

        const token = {
            key: this.initiatorName,
            secret: this.initiatorPassword,
        };

        return axios({
            url: request_data.url,
            method: request_data.method,
            headers: oauth.toHeader(oauth.authorize(request_data, token)),
        })
        .then(response => {
            this.accessToken = response.data.access_token;
            return this.accessToken;
        })
        .catch(error => {
            console.error('Error generating access token:', error);
            throw error; // Ensure error is propagated
        });
    }

    buildStkPushRequest(phoneNumber, amount, description) {
        /**
         * The code below builds STK request payload.
         */
        const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14); // Adjust timestamp logic

        const data = {
            Business_ShortCode: this.businessShortCode,
            Password: this.generatePassword(timestamp), // Generate password based on timestamp
            Timestamp: timestamp,
            InitiatorName: this.initiatorName,
            Security_Credetial: this.securityCredential,
            phone_number: phoneNumber,
            Amount: amount,
            Currency: 'KES',
            TransactionType: 'CustomerPayBillOnline',
            AccountReference: 'YOUR_ACCOUNT_REFERENCE', // OPTIONAL
            TransactionDesc: description,
        };
        return data;
    }

    sendStkPushRequest(url, data) {
        /**
         * This part sends an STK push POST request to the Daraja API using the access token and payload.
         */
        const headers = {
            Authorization: `Bearer ${this.accessToken}`,
        };
        return axios.post(url, data, { headers })
            .then(response => {
                return response;
            })
            .catch(error => {
                console.error('Error sending STK push request:', error);
                throw error; // Ensure error is propagated
            });
    }

    generatePassword(timestamp) {
        /**
         * Generate password based on provided timestamp and PASS_KEY.
         * Adjust according to your specific requirements and security policies.
         */
        const hashInput = `${this.passKey}${timestamp}`;
        const hash = crypto.createHash('md5').update(hashInput).digest('hex');
        return hash;
    }
}

// Example on how to use the class
const mpesa = new Mpesa();
const phoneNumber = process.env.PHONE_NUMBER;
const amount = 100;
const description = 'tests STK push payment';

// Obtain access token (optional)
mpesa.generateAccessToken().then(() => {
    const data = mpesa.buildStkPushRequest(phoneNumber, amount, description);
    const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/process'; // replace with actual stk push url

    mpesa.sendStkPushRequest(url, data).then(response => {
        if (response.status === 200) {
            console.log('STK Push request sent successfully!');
        } else {
            console.log(`Error: ${response.status}, ${response.data}`);
        }
    });
});
