// server.js
//
// Use this sample code to handle webhook events in your integration.
//
// 1) Paste this code into a new file (server.js)
//
// 2) Install dependencies
//   npm install stripe
//   npm install express
//
// 3) Run the server on http://localhost:4242
//   node server.js

//const stripe = require('stripe');
const express = require('express');
const app = express();

// This is your Stripe CLI webhook secret for testing your endpoint locally.
// const endpointSecret = "whsec_o0TcdZkMnWz9zZ0CObnd0ribekeMpuTP";
//
// app.post('/test', express.raw({type: 'application/json'}), (request, response) => {
//     const sig = request.headers['stripe-signature'];
//
//     let event;
//
//     try {
//         event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//     } catch (err) {
//         response.status(400).send(`Webhook Error: ${err.message}`);
//         return;
//     }
//     console.log(JSON.parse(request.body))
//     // Handle the event
//     switch (event.type) {
//         case 'checkout.session.completed':
//             const session = event.data.object;
//             // Then define and call a function to handle the event checkout.session.completed
//             break;
//         // ... handle other event types
//         default:
//             console.log(`Unhandled event type ${event.type}`);
//     }
//
//     // Return a 200 response to acknowledge receipt of the event
//     response.send();
// });

app.all('/', (req, res)=>{
    console.log(req.method)
    console.log(req.body)
    res.send('OK')
})
app.listen(3000, () => console.log('Running on port 3000'));