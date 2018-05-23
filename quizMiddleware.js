const validateQustion = (question) => {
    const {title, choices, answer} = question;
    if (choices.length <= 0 || typeof title !== "string" || typeof answer !== "number") {
        return false;
    }

    for (let i = 0; i < choices.length; i++) {
        // make sure none of the choices are set to null or undefined and that they're all strings
        if (!choices[i] || typeof choices[i] !== "string") {
            return false;
        }
    }
    return true;
};

const updateQuizValidator = (req, res, next) => {
    const {name, questions} = req.body;
    if (!name && !questions) {
        return res.send(400, "Requires a name or questions");
    } if (questions) {
        // validate questions
        for (let i = 0; i < questions.length; i++) {
            if (!validateQustion(questions[i])) {
                return res.send(400, "Questions could not be validated");
            }
        }
    }
    next();
};

const setQuizValidator = (req, res, next) => {
    const {name, questions} = req.body;
    if (!name || !questions || questions.length <= 0) {
        return res.send(400, "Requires a name and at least 1 question");
    } else {
        for (let i = 0; i < questions.length; i++) {
            if (!validateQustion(questions[i])) {
                return res.send(400, "Questions could not be validated");
            }
        }
    }
    next();
};

module.exports = {setQuizValidator: setQuizValidator, updateQuizValidator: updateQuizValidator};
