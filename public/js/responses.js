function getBotResponse(input) {
    //rock paper scissors
    if (input == "rock") {
        return "paper";
    } else if (input == "paper") {
        return "scissors";
    } else if (input == "scissors") {
        return "rock";
    }

    // Simple responses
    if (input == "hello") {
        return "Hello there! If you have an issues send a comment or complaint in the Complaint section.";
    } else if (input == "goodbye") {
        return "Talk to you later!";
    } else if (input == "hi") {
        return "Hello there! If you have an issues send a comment or complaint in the Complaint section.";
    }else {
        return "Try asking something else!";
    }
}