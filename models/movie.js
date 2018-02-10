var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const movieSchema = new Schema({
	movie_name: {
		type: String,
	},
	watched: {
		type: Boolean,
		default: false
	},
	addedAt: {
		type: String
	},
	watchedAt: {
		type: String
	}
});

const Movie = module.exports = mongoose.model('Movie', movieSchema);






















// const orm = require('../config/orm.js');

// let movie = {
// 	selectAll: function (table, callback) {
// 		orm.selectAll(table, function (result) {
// 			callback(result);
// 		})
// 	},

// 	insertOne: function (table, col, value, callback) {
// 		orm.insertOne(table, col, value, function (result) {
// 			callback(result);
// 		});
// 	},

// 	updateOne: function (table, setColumn, setValue, col, val, callback) {
// 		orm.updateOne(table, setColumn, setValue, col, val, function (result) {
// 			callback(result);
// 		});
// 	},

// 	updateTime: function (table, setColumn, setValue, col, val, callback) {
// 		orm.updateOne(table, setColumn, setValue, col, val, function (result) {
// 			callback(result);
// 		});
// 	}
// }

// module.exports = movie;
