#Howlplay Main Server

**This package is the main server hosting the quiz creation and archive functionality.**
**Included in this readme is a list of endpoints:**
  * Quiz:
    * Create New Quiz
    * Get Quiz
    * Update Quiz
    * Upload Answers
  * Questions:
  * Hackers:

#Endpoints
##Create New Quiz
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
