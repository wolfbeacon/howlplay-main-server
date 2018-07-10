//Imports and Requirements
const express = require('express');
const Sequelize = require('sequelize');
const shelljs = require('shelljs');
const crypto = require('crypto');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

//Database config
const env = "dev";
const config = require('./config.json')[env];

// JWT stuff
const secret = 'super-secret';

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
const Organizers = sequelize.define('organizers', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    username: {type: Sequelize.STRING(512),},
    access_token: {type: Sequelize.STRING,}
});

const Quizzes = sequelize.define('quizzes', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING(512),},
    questions: {type: Sequelize.STRING,},
    organizer: {type: Sequelize.INTEGER},
    url: {type: Sequelize.STRING(128)}, // url to their game server
    code: {type: Sequelize.STRING(5), unique: true}
});


// Create Server
const server = express();

const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

whitelist = (process.env.ENV === 'PROD') ? ["https://dashboard.howlplay.com", 'https://howlplay.com'] : ['http://localhost:3000'];

// CORS settings
const corsSettings = {
    "origin": whitelist, // note this cannot be a wildcard or true
    "credentials" : true
};

// Initialize Body Parser
server.use(bodyParser.json());
server.use(cors(corsSettings));
server.use(morgan('tiny'));

const verifyUser = (req, res, next) => {
  let parsedCookie = cookie.parse(req.headers.cookie);
  console.log(parsedCookie);
  let token = parsedCookie.token;
  jwt.verify(token, secret, function(err, decoded) {
    if (err) {console.log(err); return res.send(401, 'access denied') }
    else {
        req.id = decoded.id;
    }
    next();
  });
};

// PWA quiz login
server.post('/pwa/game', function(req, res) {
    const code = req.body.code;
    if (!code) {
        res.status(400).send();
        return;
    }

    Quizzes.findOne({
        attributes: ['id', 'url'],
        where: {'code' : code}
    }).then(quiz => {
        console.log(quiz.dataValues);
        if (!quiz) {
            res.status(500).send();
            return;
        }
        res.send(quiz.dataValues);
    })
});

server.post('/dashboard/signin', function (req, res, next) {
    let accessToken = req.body.token;
    if (!accessToken) {
        return res.send(400, "Requires accessToken");
    }

    Organizers.findOne({where: {"access_token": accessToken}})
    .then(quizzes => {
      console.log(quizzes.dataValues.id);
      let id = quizzes.dataValues.id;
      let token = jwt.sign({id : id}, secret);
      res.cookie('token', token, {
          path : '/',
          maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
      });

      res.send({token: token});
    })
});

server.get('/quizzes', verifyUser, async function (req, res) {
    let {id} = req;
    try {
        let quizzes = await Quizzes.findAll({where: {"organizer": id}});
        res.send(quizzes);
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});

// Spin up a game server
server.post('/spinup', function(req, res){
    let data = body;
    let quiz_hash = crypto.createHash('md5').update(data.details).digest('base64');
    let admin_key = data.key;

    shelljs.exec('bash ./create-game-server.sh QUIZ_HASH:' + quiz_hash + ' ADMIN_KEY:' + admin_key);

    res.send();
});

// Quiz End Points
// Create New Quiz
server.post('/quiz', [verifyUser, QuizMiddleware.setQuizValidator], function (req, res) {
    if (!req.body.name || !req.body.questions || !req.body.url)  {
        res.status(400).send();
    } else {
        console.log(req.body.questions);
        Quizzes.create({
            name: req.params.name,
            questions: JSON.stringify(req.params.questions),
            organizer: req.id,
            url: req.params.url,
            code: Math.floor(Math.random()*90000) + 10000
        }).then(quiz => {
            res.send(quiz);
        });
    }
});

// Get Quiz by ID
server.get('/quiz/:quizId', function (req, res) {
    const quizId = req.params.quizId;
    Quizzes.findOne({
        attributes: ['id', 'name', 'questions', 'url', 'code'],
        where: {
            id: quizId,
        }
    }).then(Quiz => {
        if (Quiz == null) {
            res.status(400).send();
        }
        else {
            Quiz.questions = JSON.parse(Quiz.questions);
            res.status(200).send(Quiz)
        }
    });
});

// Get Quiz by Code
server.get('/quiz/:quizId', function (req, res) {
    const {code} = req.params;
    Quizzes.findOne({
        attributes: ['id', 'name', 'questions', 'url', 'code'],
        where: {
            code: code
        }
    }).then(Quiz => {
        if (Quiz == null) {
            res.status(400).send();
        }
        else {
            Quiz.questions = JSON.parse(Quiz.questions);
            res.status(200).send(Quiz)
        }
    });
});


// Update Quiz
server.patch('/quiz/:id', [verifyUser, QuizMiddleware.updateQuizValidator], function (req, res) {
    let json = {};
    if (req.body.name != null) {
        json.name = req.body.name;
    }
    Quizzes.update(json, {
        where: {
            id: req.params.id,
            organizer: req.id
        }
    }
    ).catch(err => {
        res.status(400).send(err);
    });

    Quizzes.findOne({
        attributes: ['id', 'name', 'questions'],
        where: {
            id: req.params.id,
            organizer: req.id
        }
    }).then(Quiz => {
        Quiz.questions = JSON.parse(Quiz.questions);
        res.status(200).send(Quiz);
    });
});

server.delete('/quiz/:id', verifyUser, (req, res) => {
    Quizzes.destroy({
        where: {
            id: req.params.id
        }
    }).then(() => {
        res.send(`Deleted Quiz with id ${req.params.id}`);
    }).catch((err) => {
        console.log(err);
        res.status(500).send("Could not delete quiz");
    });
});



server.post('/login', function (req, res) {
    let { username, password } = req.body;
    if (username !== "LeBron" || password !== "James") {
        res.statu(401).send("Invalid Username or Password");
    } else {
        res.send({
            access_token: "ABC123"
        })
    }
});

server.get('/', (req, res) => {
    res.send('API is Running');
});


// Start Server
server.listen(port, function () {
    console.log(`Server listening on ${port}`);
});
