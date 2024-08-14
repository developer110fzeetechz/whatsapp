const express = require('express');
const body_parser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

const VERIFY_TOKEN = "mynameisatiq"; // Replace with your actual verify token
const ACCESS_TOKEN = "EAAL9E25aiJ8BO2AaSLprp4bhG5OvBg6qC07Jj1cKVjIOzTvxu8nFnNbrSTctnTmI0TUWvzBSEe6CCcS1ZAmv77Ry5u8ZC4VSDMvZCpxXmb59x7RsXOX7ewOoHZBQ0cyakooWbsdHaZCYJZAnKGR9O68OfBi5PXBjMdYx2K72ti5F9K95JpzvQZA8TAUsFZAh2yz95kvIZCnMb4SQK5JBV9ecZD"; // Replace with your actual access token

// MongoDB connection
mongoose.connect('mongodb+srv://developer107fzeetechz:R6ghViuV4z4mHxfd@cluster0.yskrwdj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Define the Message schema and model
const messageSchema = new mongoose.Schema({
    from: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

app.use(body_parser.json());

app.get('/', (req, res) => {
    res.send('Working fine');
});

app.get('/webhook', (req, res) => {
    console.log('Webhook GET request received');
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        console.log(`Webhook verified. Challenge: ${challenge}`);
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post('/webhook', (req, res) => {
    const body = req.body;
    console.log(JSON.stringify(body, null, 2));

    if (body.object === 'whatsapp_business_account') {
        if (body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {
            const phone = body.entry[0].changes[0].value.metadata.phone_number_id;
            const from = body.entry[0].changes[0].value.messages[0].from;
            const message = body.entry[0].changes[0].value.messages[0].text.body;

            // Save the message to the database
            const newMessage = new Message({ from, message });
            newMessage.save().then(() => {
                console.log('Message saved to database');
            }).catch(err => {
                console.error('Error saving message:', err);
            });

            // axios({
            //     method: 'POST',
            //     url: `https://graph.facebook.com/v20.0/${phone}/messages?access_token=${ACCESS_TOKEN}`,
            //     data: {
            //         messaging_product: "whatsapp",
            //         to: from,
            //         text: {
            //             body: `Hii I am Atiqur Rahman ${message}`
            //         }
            //     },
            //     headers: {
            //         "Content-Type": "application/json"
            //     }
            // })
            //     .then(() => {
            //         res.sendStatus(200);
            //     })
            //     .catch(err => {
            //         console.error('Error sending message:', err);
            //         res.sendStatus(500);
            //     });
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
