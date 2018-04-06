const fs = require('fs');
const Sequelize = require('sequelize');
var env = "dev";
const config = require('./config.json')[env];
const sequelize = new Sequelize(
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

sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
    runSqlScript('sql/migration.sql');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

function runSqlScript(path) {
  fs.readFile(path, 'utf-8', function(err, res){
    if (err) {
      console.log(err);
      return;
    }
    console.log(res);
    sequelize.query(res);
  });
}
