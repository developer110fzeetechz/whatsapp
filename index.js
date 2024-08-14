const express = require('express');
const body_parser = require('body-parser');
const axios = require('axios');
const path = require('path'); // Import path to work with file paths

const app = express();
const PORT = 5000;

const VERIFY_TOKEN = "mynameisatiq"; // Replace with your actual verify token
const ACCESS_TOKEN = "your-access-token"; // Replace with your actual access token

let messages = []; // Store messages in-memory for simplicity

app.use(body_parser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve the HTML file
});

app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        if (body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {
            const phone = body.entry[0].changes[0].value.metadata.phone_number_id;
            const from = body.entry[0].changes[0].value.messages[0].from;
            const message = body.entry[0].changes[0].value.messages[0].text.body;

            // Store the message
            messages.push({ from, message });

            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(404);
    }
});

// API to get all messages
app.get('/messages', (req, res) => {
    res.json(messages);
});

// API to send a message
app.post('/send-message', (req, res) => {
    const { to, message } = req.body;

    axios({
        method: 'POST',
        url: `https://graph.facebook.com/v20.0/${to}/messages?access_token=${ACCESS_TOKEN}`,
        data: {
            messaging_product: "whatsapp",
            to,
            text: { body: message }
        },
        headers: {
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
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
