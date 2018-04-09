//Imports and Requirements
const restify = require('restify');
const Sequelize = require('sequelize');
const uuidv4 = require('uuid/v4');
const shelljs = require('shelljs');
const crypto = require('crypto');

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

Quizzes.belongsTo(Organizers, {as: 'quizzesfk'});

//Global Constants
const WIP = 'Endpoint not implemented yet';

const socketUrl = "ws://localhost:9090";

// Create Server
const server = restify.createServer();

const corsMiddleware = require('restify-cors-middleware');

const cors = corsMiddleware({origins: ['https://howlplaydashboard.azurewebsites.net']});

// Initialize Body Parser
server.use(restify.plugins.bodyParser({mapParams: true}));

server.pre(cors.preflight);
server.use(cors.actual);

// Start Server
server.listen(port, function () {
    console.log('%s listening at %s', server.name, server.url);
});

//Middleware
const authenticate = function checkAuthorization(req, res, next) {
    const tokens = req.header("Authorization");
    if (tokens == null) {
        res.send(401,{message: "not authenticated"} );
        return next(false);
    } else {
        const token = tokens.split(" ")[1];
        const id = req.params.id;
        Organizers.findOne({
            attributes: ['access_token'], where: {
                "id": id,
            }
        }).then(org => {
            console.log(org);
            if(org == null) {
                res.send(401,{message: "not authenticated"} );
                return next(false);
            }
        });
        return next();
    }
};

// Quiz End Points
// Create New Quiz
server.post('/quiz', QuizMiddleware.setQuizValidator, function (req, res, next) {
    if (!req.params.name || !req.params.questions || !req.params.url)  {
        res.send(400);
    } else {
        console.log(req.params.questions);
        Quizzes.create({
            name: req.params.name,
            questions: JSON.stringify(req.params.questions),
            organizer: req.params.owner,
            url: req.params.url,
            code: Math.floor(Math.random()*90000) + 10000
        }).then(quiz => {
            res.send(200, quiz);
        });
    }
    next();
});

// PWA quiz login
server.post('/pwa/game', function(req, res, next) {
  const code = req.params.code;
  if (!code) {
    res.send(400);
    return;
  }

  Quizzes.findOne({
    attributes: ['id', 'url'],
    where: {'code' : code}
  }).then(quiz => {
    console.log(quiz.dataValues);
    if (!quiz) {
      res.send(500);
      return;
    }
    res.status(200);
    res.send(quiz.dataValues);
  })
});

// Spin up a game server
server.post('/spinup', function(req, res, next){
  let data = JSON.parse(req.body);
  let quiz_hash = crypto.createHash('md5').update(data.details).digest('base64');
  let admin_key = data.key;

  shelljs.exec('bash ./create-game-server.sh QUIZ_HASH:' + quiz_hash + ' ADMIN_KEY:' + admin_key);

  res.send(200);
});

// Get Quiz
server.get('/quiz/:quizId',function (req, res, next) {
    const quizId = req.params.quizId;
    Quizzes.findOne({
        attributes: ['id', 'name', 'questions', 'url'],
        where: {
            "id": quizId
        }
    }).then(Quiz => {
        if (Quiz == null) {
            res.send(400);
        }
        else {
            Quiz.questions = JSON.parse(Quiz.questions);
            res.send(200, Quiz);
        }
    });
    next();
});

// Get access codes for all quizzes
server.get('/quizzes/codes', function(req, res, next) {
  Quizzes.findAll({
    attributes: ['code']
  }).then(data => {
    if (data == null) {
      res.send(500);
      return;
    }
    res.send(200, data);
  })
});

server.get('/quizzes/codes/:code', function(req, res, next){
  let code = req.params.code;
  Quizzes.findOne({
    attributes: ['id', 'url'],
    where: {
      "code" : code
    }
  }).then(quiz => {
    if (quiz == null) {
      res.send(400);
      return;
    }
    res.send(200, quiz);
  });
});

// Update Quiz

server.patch('/quiz/:id', QuizMiddleware.updateQuizValidator, authenticate, function (req, res, next) {
    let json = {};
    if (req.params.name != null) {
        json.name = req.params.name;
    }
    Quizzes.update(json,
        {where: {id: req.params.id}}
    ).catch(err => {
        res.send(400, err);
    });

    Quizzes.findOne({
        attributes: ['id', 'name', 'questions'],
         where: {
            "id": req.params.id
        }
    }).then(Quiz => {
        Quiz.questions = JSON.parse(Quiz.questions);
        res.send(200, Quiz);
    });
    next();
});

server.get('/quizzes/:userID', async function (req, res, next) {
    let { userID } = req.params;
    console.log(userID);
    if (!userID) {
        res.send(400, "Requires UserID");
    } else {
        try {
            let quizzes = await Organizers.findAll({where: {"access_token": userID}});
            res.send(quizzes);
        } catch (e) {
            console.log(e);
            res.send(500, `Could not get quizzes for ${userID}`);
        }

    }
});

server.post('/login', function (req, res, next) {
   let { username, password } = req.params;
   if (username !== "LeBron" || password !== "James") {
       res.send(401, "Invalid Username or Password");
   } else {
       res.send({
           access_token: "ABC123"
       })
   }
});
