const mongoose = require('mongoose');

const client = async () => {
    await mongoose
        .connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        })
        .then(() => console.log('🚀 connection succesful'))
        .catch(err => console.error(err));
};

module.exports = {
    client
}