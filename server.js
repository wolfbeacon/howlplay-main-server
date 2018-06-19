//Imports and Requirements
const express = require('express');
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
const server = express();

const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

// Initialize Body Parser
server.use(bodyParser.json());
server.use(cors());
server.use(morgan('tiny'));


//Middleware
const authenticate = async (req, res, next) => {
    const tokens = req.header("Authorization");
    if (tokens == null) {
        res.status(401).send("Not authenticated");
    } else {
        const token = tokens.split(" ")[1];
        const id = req.params.id;
        try {
            let quiz = await Quizzes.findOne({
                attributes: ['access_token'], where: {
                    "id": id,
                }
            });
            if (!quiz) {
                res.status(404).send(`Could not find quiz with id: ${id}`);
            } else if (quiz.access_token === token) {
                next();
            } else {
                res.status(401).send();
            }
        } catch (err) {
            console.log(err);
            res.status(500).send();
        }
    }
};

// Quiz End Points
// Create New Quiz
server.post('/quiz', QuizMiddleware.setQuizValidator, (req, res) => {
    if (!req.body.name || !req.body.questions || !req.body.url || !req.body.owner)  {
        res.status(400).send();
    } else {
        console.log(req.body.questions);
        Quizzes.create({
            name: req.body.name,
            questions: JSON.stringify(req.body.questions),
            access_token: req.body.owner,
            url: req.body.url,
            code: Math.floor(Math.random()*90000) + 10000
        }).then(quiz => {
            res.send(quiz);
        });
    }
});

// PWA quiz login
server.post('/pwa/game', (req, res) => {
  const code = req.body.code;
  if (!code) {
    res.status(400).send();
    return;
  }
  console.log(code);
  Quizzes.findOne({
    attributes: ['id', 'url'],
    where: {'code' : code}
  }).then(quiz => {
    console.log(quiz);
    if (!quiz) {
      res.status(500).send();
      return;
    }
    res.send(quiz);
  })
});

// Get Quiz
server.get('/quiz/:quizId', (req, res) => {
    const quizId = req.params.quizId;
    Quizzes.findOne({
        attributes: ['id', 'name', 'questions', 'url'],
        where: {
            "id": quizId
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
server.patch('/quiz/:id', QuizMiddleware.updateQuizValidator, authenticate,  (req, res) => {
    let json = {};
    if (req.body.name != null) {
        json.name = req.body.name;
    }
    Quizzes.update(json,
        {where: {id: req.params.id}}
    ).catch(err => {
        res.status(400).send(err);
    });

    Quizzes.findOne({
        attributes: ['id', 'name', 'questions'],
         where: {
            "id": req.params.id
        }
    }).then(Quiz => {
        Quiz.questions = JSON.parse(Quiz.questions);
        res.status(200).send(Quiz);
    });
});


server.delete('/quiz/:id', authenticate, (req, res) => {
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


server.get('/quizzes/:userID', async (req, res) => {
    let { userID } = req.params;
    if (!userID) {
        res.status(400).send("Requires UserID");
    } else {
        try {
            let quizzes = await Quizzes.findAll({where: {"access_token": userID}});
            res.send(quizzes);
        } catch (e) {
            console.log(e);
            res.status(500).send(`Could not get quizzes for ${userID}`);
        }

    }
});

server.post('/login', (req, res) => {
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
   res.send('API is running')
});

// Start Server
server.listen(port, function () {
    console.log(`Server listening on ${port}`);
});