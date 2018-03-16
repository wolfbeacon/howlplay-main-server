//Imports and Requirements
var restify = require('restify');
var Sequelize = require('sequelize');

//Database config
var env = "dev";
var config = require('./config.json')[env];
var password = config.password ? config.password : null;

//initiate database connection
var sequelize = new Sequelize(
    config.database,
    config.user,
    config.password,
    {
        dialect: config.dialect,
        port: config.port,
        host: config.host,
        logging: console.log,
        define: {
            timestamps: false
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
    }
);

//Authenticate Database connection
sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
    process.exit(0);
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
    process.exit(1);
  });
