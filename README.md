# Howlplay Main Server

**This package is the main server hosting the quiz creation and archive functionality.**
**Included in this readme is a list of endpoints:**
  * Quiz:
    * Create New Quiz
    * Get Quiz
    * Update Quiz
    * Upload Answers
  * Questions:
  * Hackers:

## Endpoints
### Create New Quiz
* description: Create a new quiz
* request: POST /quiz
  * body: Array of objects
    * name (String): Name of the quiz
    * questions (Array of Strings) : Questions in the quiz
    * owner (String) : Owner of the quiz
* response:
  * status : 200
  * body : Quiz that was created
* response
  * status : 400

### Join Game (PWA)
* description : Client joins a game that is hosting a quiz
* request : POST /pwa/game
  * body : Object
    * code (String) : code of the game the client wishes to join
* response :
  * status : 200
  * body : The respective WebSocket link for the game
* response :
  * status : 400

### Get Quiz
* description : Get a quiz
* request GET /quiz/:quizId
  * quizId : id of the quiz user wants to retrieve
* response:
  * status : 200
  * body : Quiz with id `quizId`
* response:
  * status : 400

### Update Quiz
* description : Update a quiz
* request : PATCH /quiz/:id
  * id : id of the quiz to update
  * body : object
    * name (String) : new name of the quiz
* response:
  * status : 200
* response:
  * status : 400

### Get User's Answered Quizzes
* description : get all quizzes that a user has answered
* request : GET /quizzes/:userID
  * userID : id of the user
* response:
  * status : 200
  * body : Array of all quizzes user has answered
* response:
  * status : 500
  * body (String) : Could not get quizzes for `userID`

### User Login
* description : Login the user
* request : POST /login
  * username (String) : Username of the user
  * password (String) : Password of the user
* response:
  * status : 200
  * body : Access token for the user
