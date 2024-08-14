const express = require('express');
const body_parser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 5000;

const VERIFY_TOKEN = "mynameisatiq"; // Replace with your actual verify token
const ACCESS_TOKEN = "EAAL9E25aiJ8BO2AaSLprp4bhG5OvBg6qC07Jj1cKVjIOzTvxu8nFnNbrSTctnTmI0TUWvzBSEe6CCcS1ZAmv77Ry5u8ZC4VSDMvZCpxXmb59x7RsXOX7ewOoHZBQ0cyakooWbsdHaZCYJZAnKGR9O68OfBi5PXBjMdYx2K72ti5F9K95JpzvQZA8TAUsFZAh2yz95kvIZCnMb4SQK5JBV9ecZD"; // Replace with your actual access token

app.use(body_parser.json());

app.get('/', (req, res) => {
    res.send('Working fine');
});

app.get('/webhook', (req, res) => {
    console.log('called')
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token']; // Fixed: 'hub.verify_token' is the correct query parameter
    const challenge = req.query['hub.challenge'];

    // Check if a token is being sent by Facebook for verification
    if (mode && token === VERIFY_TOKEN) { // Validate the token sent by Facebook
        console.log(`Verified the webhook. Challenge: ${challenge}`); // Log the challenge for debugging purposes
        res.status(200).send(challenge);
    } else {
        console.log('else')
        res.sendStatus(403); // If tokens do not match, respond with 403 Forbidden
    }
});

app.post('/webhook', (req, res) => {

    const body = req.body;
    console.log(JSON.stringify(body_param, null, 2));

    if (body.object === 'whatsapp_business_account') {
        if (body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {
            const phone = body.entry[0].changes[0].value.metadata.phone_number_id;
            const from = body.entry[0].changes[0].value.messages[0].from;
            const message = body.entry[0].changes[0].value.messages[0].text.body;


            console.log({phone})
            console.log({from})
            console.log({message})
            axios({
                method: 'POST',
                url: `https://graph.facebook.com/v20.0/${phone}/messages?access_token=${ACCESS_TOKEN}`,
                data: {
                    messaging_product: "whatsapp",
                    to: from,
                    text: {
                        body: `Hii I am Atiqur Rahman ${message}`
                    }
                },
                headers: { // Fixed typo: 'Headers' to 'headers'
                    "Content-Type": "application/json"
                }
            })
                .then(() => {
                    res.sendStatus(200);
                })
                .catch(err => {
                    console.error('Error sending message:', err);
                    res.sendStatus(500);
                });
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(404);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
