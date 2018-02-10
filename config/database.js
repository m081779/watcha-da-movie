// config/database.js
module.exports = {
    database: process.env.MONGODB_URI || 'mongodb://localhost:27017/movie_list'
};
