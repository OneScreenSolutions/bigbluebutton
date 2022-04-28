const POLL_SETTINGS = Meteor.settings.public.poll;
const CORRECT_OPTION_SYMBOL = POLL_SETTINGS.correct_opt_symbol;

const isCorrectOption = (opt) => {
  const trimmedOption = opt.trim();
  const trimmedOptLength = trimmedOption.length
  const correctOptSymLength = CORRECT_OPTION_SYMBOL.length
  return (
    (trimmedOptLength > correctOptSymLength &&
    trimmedOption.substring(trimmedOptLength -
    correctOptSymLength) === CORRECT_OPTION_SYMBOL) || 
    (opt.isCorrect)
  )
}

const checkCorrectAnswers = (answers) => {
  answers.forEach((opt, i) => {
    const pollAnswer = answers[i]
    pollAnswer.isCorrect = false;
    if(isCorrectOption(opt.key)){
      pollAnswer.key = pollAnswer.key.substring(0, pollAnswer.key.length - CORRECT_OPTION_SYMBOL.length)
      pollAnswer.isCorrect = true;
    }
  })
  return answers;
}

export default {
    checkCorrectAnswers
}
