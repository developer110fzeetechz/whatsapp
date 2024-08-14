const express = require('express')
const body_parser = require('body-parser')
const axios = require('axios')


const app = express()
const PORT = 5000

const token =  "no token here"
    let _token = "mynameis"

    app.get('/',(req,res)=>{
        res.send('Working fine')
    })
app.get('/webhook', (req, res) => {

    const mode = req.query['hub.mode']
    const challenge = req.query['hub.challenge']
    const token = req.query['hub.token']


    if (mode && token) {
        res.status(200).send(challenge)
    } else {
        res.sendStatus(403)
    }
    
})


app.post('/webhook', body_parser.json(), (req, res) => {
    const body = req.body

    if (body.object) {
        if (body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.message && value.message[0]
        ) {
            const phone = body.entry[0].changes[0].value.metadata.phone_number_id;
            const from = body.entry[0].changes[0].value.messages[0].from;
            const message = body.entry[0].changes[0].value.messages[0].text.body;

            axios({
                method: 'POST',
                url: `https://graph.facebook.com/v20.0/${phone}/messages?access_token=${_token}`,
                data: {
                    messaging_product: "whatsapp",
                    to: from,
                    text: {
                        body: "Hii I am ,d atiqur rahman"
                    }
                },
                Headers: {
                    "Content-Type": "application/json"
                }

            })

            res.sendStatus(200);

        }else{
            res.sendStatus(404);
        }

    }
})
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
