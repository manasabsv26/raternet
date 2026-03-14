const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

process.on('uncaughtException', (err,origin) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err);
    console.log(`Exception origin: ${origin}`)
    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
const Review = require('./models/reviewmodel');
console.log(process.env.NODE_ENV);
const DB = process.env.DATABASE;

const dropLegacyReviewIndexes = async () => {
    try {
        const indexes = await Review.collection.indexes();
        const hasLegacyUserEmailIndex = indexes.some(idx => idx && idx.name === 'user_email_1');
        if (hasLegacyUserEmailIndex) {
            await Review.collection.dropIndex('user_email_1');
            console.log('Dropped legacy reviews index: user_email_1');
        }
    } catch (err) {
        console.log('Index cleanup skipped:', err.message);
    }
};

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(async() => {
        console.log('DB connection successful!');
        await dropLegacyReviewIndexes();
    });

const port = process.env.PORT || 7000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});