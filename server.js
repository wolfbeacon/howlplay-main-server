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
    access_token: {type: Sequelize.STRING(128)},
    url: {type: Sequelize.STRING(128)}, // url to their game server
    code: {type: Sequelize.STRING(5), unique: true}
});

//Global Constants
const WIP = 'Endpoint not implemented yet';

const socketUrl = "ws://localhost:9090";

// Create Server
const server = restify.createServer();

// Initialize Body Parser
server.use(restify.plugins.bodyParser({mapParams: true}));

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
        Quizzes.findOne({
            attributes: ['access_token'], where: {
                "id": id,
            }
        }).then(Quiz => {
            console.log(Quiz);
            if(Quiz == null) {
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
            access_token: req.params.owner,
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
  console.log(code);
  Quizzes.findOne({
    attributes: ['id', 'url'],
    where: {'code' : code}
  }).then(quiz => {
    console.log(quiz);
    if (!quiz) {
      res.send(500);
      return;
    }
    res.status(200);
    res.send(quiz);
  })
});

// Get Quiz
server.get('/quiz/:quizId',function (req, res, next) {
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
            Quiz.questions = JSON.parse(Quiz.questions);
            res.send(200, Quiz);
        }
    });
    next();
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
    if (!userID) {
        res.send(400, "Requires UserID");
    } else {
        try {
            let quizzes = await Quizzes.findAll({where: {"access_token": userID}});
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
