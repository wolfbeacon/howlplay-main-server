const validateQustion = (quiz) => {
    const {title, choices, answers} = quiz;
    if (!title || !choices || !answers || typeof title !== "string" || typeof answers !== "number") {
        return false;
    } for (let i = 0; i < choices.length; i++) {
        // make sure none of the choices are set to null or undefined and that they're all strings
        if (!choices[i] || typeof choices[i] !== "string") {
            return false;
        }
    }
    return true;
};

const quizValidator = (req, res, next) => {
    const {name, questions} = req.params;
    if (!name || !questions) {
        return res.send(400, "Requires a name and questions");
    } else {
        for (let i = 0; i < questions.length; i++) {
            if (!validateQustion(questions[i])) {
                return res.send(403, "Questions could not be validated");
            }
        }
    }
};