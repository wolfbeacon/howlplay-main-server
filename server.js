//Imports and Requirements
const restify = require('restify');
const Sequelize = require('sequelize');
const uuidv4 = require('uuid/v4');

//Database config
const env = "dev";
const config = require('./config.json')[env];
const password = config.password ? config.password : null;

//middleware
const QuizMiddleware = require('./quizMiddleware');

const port = process.env.port || 8080;

//initiate database connection
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

//Authenticate Database connection
sequelize
    .authenticate()
    .then(function (err) {
        console.log('Connection has been established successfully.');
    })
    .catch(function (err) {
        console.log('Unable to connect to the database:', err);
    });

//Models
const Quizzes = sequelize.define('quizzes', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING(512),},
    questions: {type: Sequelize.STRING,},
    access_token: {type: Sequelize.STRING(128)}
});

//Global Constants
const WIP = 'Endpoint not implemented yet';

// Create Server
const server = restify.createServer();

// Initialize Body Parser
server.use(restify.plugins.bodyParser({mapParams: true}));


// Start Server
server.listen(port, function () {
    console.log('%s listening at %s', server.name, server.url);
});

// Quiz End Points
// Create New Quiz
server.post('/quiz', QuizMiddleware.setQuizValidator, function (req, res, next) {
    if (req.params.name == null || req.params.questions == null) {
        res.send(400);
    }
    else {
        Quizzes.create({
            name: req.params.name,
            questions: JSON.stringify(req.params.questions),
            access_token: uuidv4()
        }).then(quiz => {
            res.send(200, quiz);
        });
    }
    next();
});

// Get Quiz
server.get('/quiz/:quizId', function (req, res, next) {
    const quizId = req.params.quizId;
    Quizzes.findOne({
        attributes: ['id', 'name', 'questions'],
        where: {
            "id": quizId
        }
    }).then(Quiz => {
        if (Quiz == null) {
            res.send(400);
        }
        else {
            const outString = (Quiz);
            res.send(200, outString)
        }
    });
    next();
});

// Update Quiz
server.patch('/quiz/:id', QuizMiddleware.updateQuizValidator, function (req, res, next) {
    let json = {};
    if (req.params.name != null) {
        json.name = req.params.name;
    }
    if (req.params.questions != null) {
        json.questions = JSON.stringify(req.params.questions);
    }
    Quizzes.update(json,
        {where: {id: req.params.id, access_token: req.params.access_token}}
    ).then(quiz => {
            res.send(200, JSON.stringify(quiz));
        }
    ).catch(err => {
        res.send(400, err);
    });
    next();
});


server.get('/', function (req, res, next) {
   res.send('Hello World');
   next();
});