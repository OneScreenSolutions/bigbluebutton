import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import _ from 'lodash';
import { Session } from 'meteor/session';
import Toggle from '/imports/ui/components/common/switch/component';
import LiveResult from './live-result/component';
import Checkbox from '/imports/ui/components/common/checkbox/component';
import Styled from './styles';
import { PANELS, ACTIONS } from '../layout/enums';
import Modal from '/imports/ui/components/common/modal/simple/component';
import { alertScreenReader } from '/imports/utils/dom-utils';

const intlMessages = defineMessages({
  askQuestionPaneTitle: {
    id: 'app.askQuestion.askQuestionPaneTitle',
    description: 'heading label for the ask question menu',
  },
  addingQuestionInstructionsText: {
    id: 'app.askQuestion.addingQuestionInstructionsText',
    description: 'heading instructions for entering question and options.',
  },
  addingCorrectOptionInstructionsText: {
    id: 'app.askQuestion.correctOptionInstructionsText',
    description: 'heading instructions for entering correct options.',
  },
  previewBtnLabel: {
    id: 'app.askQuestion.previewQuestionBtn',
    description: 'Label of button to preview question',
  },
  askQuestionBtnLabel: {
    id: 'app.askQuestion.askQuestionBtn',
    description: 'Label of button to ask question',
  },
  correctOptionLabel: {
    id: 'app.askQuestion.correctOptionLabel',
    description: 'label for the correct option',
  },
  invalidQuestionAndOptions: {
    id: 'app.askQuestion.error.invalidQuestionAndOptions',
    description: 'Error for invalid or null entry',
  },
  maxOptionsLength: {
    id: 'app.askQuestion.error.maxOptionsLength',
    description: 'Error for max number of options',
  },
  minOptionsLength: {
    id: 'app.askQuestion.error.minOptionsLength',
    description: 'Error for min number of options',
  },
  correctOptionErr: {
    id: 'app.askQuestion.error.selectCorrectOpt',
    description: 'Error for selecting correct option',
  },
  optionEmptyError: {
    id: 'app.askQuestion.error.optionEmptySpace',
    description: '',
  },
  closeLabel: {
    id: 'app.poll.closeLabel',
    description: 'label for poll pane close button',
  },
  hidePollDesc: {
    id: 'app.poll.hidePollDesc',
    description: 'aria label description for hide poll button',
  },
  activePollInstruction: {
    id: 'app.askQuestion.activeQuestioningInstruction',
    description: 'instructions displayed when a poll is active',
  },
  customPlaceholder: {
    id: 'app.poll.customPlaceholder',
    description: 'custom poll input field placeholder text',
  },
  noPresentationSelected: {
    id: 'app.poll.noPresentationSelected',
    description: 'no presentation label',
  },
  clickHereToSelect: {
    id: 'app.poll.clickHereToSelect',
    description: 'open uploader modal button label',
  },
  questionErr: {
    id: 'app.poll.questionErr',
    description: 'question text area error label',
  },
  questionAndOptionsPlaceholder: {
    id: 'app.askQuestion.questionAndoptions.label',
    description: 'poll input questions and options label',
  },
  modalClose: {
    id: 'app.modal.close',
    description: 'Close',
  },
  optionsLabel: {
    id: 'app.askQuestion.optionsHeading',
    description: 'label for options heading',
  },
  maxOptionsWarning: {
    id: 'app.poll.maxOptionsWarning.label',
    description: 'poll max options error',
  },
  delete: {
    id: 'app.poll.optionDelete.label',
    description: '',
  },
  questionLabel: {
    id: 'app.askQuestion.questionHeading',
    description: '',
  },
  addOptionLabel: {
    id: 'app.poll.addItem.label',
    description: '',
  },
  askQuestionLabel: {
    id: 'app.askQuestion.askQuestionBtn',
    description: '',
  },
  secretPollLabel: {
    id: 'app.askQuestion.secretQuestioning.label',
    description: '',
  },
  isSecretPollLabel: {
    id: 'app.poll.secretPoll.isSecretLabel',
    description: '',
  },
  enableMultipleResponseLabel: {
    id: 'app.poll.enableMultipleResponseLabel',
    description: 'label for checkbox to enable multiple choice',
  },
  startPollDesc: {
    id: 'app.poll.startPollDesc',
    description: '',
  },
  showRespDesc: {
    id: 'app.poll.showRespDesc',
    description: '',
  },
  addRespDesc: {
    id: 'app.poll.addRespDesc',
    description: '',
  },
  deleteRespDesc: {
    id: 'app.poll.deleteRespDesc',
    description: '',
  },
  on: {
    id: 'app.switch.onLabel',
    description: 'label for toggle switch on state',
  },
  off: {
    id: 'app.switch.offLabel',
    description: 'label for toggle switch off state',
  },
  removePollOpt: {
    id: 'app.poll.removePollOpt',
    description: 'screen reader alert for removed poll option',
  },
  emptyPollOpt: {
    id: 'app.poll.emptyPollOpt',
    description: 'screen reader for blank poll option',
  },
});

const POLL_SETTINGS = Meteor.settings.public.poll;

const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;
const MAX_INPUT_CHARS = POLL_SETTINGS.maxTypedAnswerLength;
const QUESTION_MAX_INPUT_CHARS = 1200;
const MIN_OPTIONS_LENGTH = 2;
const CORRECT_OPTION_SYMBOL = POLL_SETTINGS.correct_opt_symbol;

const validateInput = (i) => {
  let _input = i;
  while (/^\s/.test(_input)) _input = _input.substring(1);
  return _input;
};

const isCorrectOption = (opt) => {
  const trimmedOption = opt.trim();
  const trimmedOptLength = trimmedOption.length
  const correctOptSymLength = CORRECT_OPTION_SYMBOL.length
  return (
    trimmedOptLength > correctOptSymLength &&
    trimmedOption.substring(trimmedOptLength -
    correctOptSymLength) === CORRECT_OPTION_SYMBOL
  )
}

const getCorrectOptions = (options) => {
  const correctOptions = []
  let isCorrect = false;
  options.forEach((opt) => {
    isCorrect = false
    while(isCorrectOption(opt)){
      opt = opt.substring(0,
      opt.length - CORRECT_OPTION_SYMBOL.length)
      isCorrect = true
    }
    isCorrect && correctOptions.push(opt)
  });
  return correctOptions;
}

const verifiedOptionList = (optList) => {
  const newOptList = optList.map((o) => {
    const trimmedOpt = o.trim()
    // if (isCorrectOption(o)) {
    //   return trimmedOpt.replace(CORRECT_OPTION_SYMBOL, "")
    // }
    return trimmedOpt;
  })
  return newOptList;
}

const getSplittedQuestionAndOptions = (questionAndOptions) => {
  const inputList = questionAndOptions.split('\n');
  const splittedQuestion = inputList.length > 0 ? inputList[0] : questionAndOptions;
  const optionsList = inputList.slice(1);
  return {
    splittedQuestion,
    optionsList,
  };
};

const checkIfAnyOptionIsEmpty = (options) => {
  let isOptionEmpty = false;
  options.forEach((opt) => {
    if ((!opt.trim()) || 
    (opt.trim().replace(CORRECT_OPTION_SYMBOL, '') === '')) {
      isOptionEmpty = true;
      return isOptionEmpty;
    }
  });
  return isOptionEmpty;
}

class Poll extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isQuestioning: false,
      question: '',
      questionAndOptions: '',
      optList: [],
      error: null,
      isMultipleResponse: false,
      secretPoll: false,
      openPreviewModal: false
    };
    this.handleBackClick = this.handleBackClick.bind(this);
    this.handleAddOption = this.handleAddOption.bind(this);
    this.handleRemoveOption = this.handleRemoveOption.bind(this);
    this.toogleCorrectOptionCheckBox = this.toogleCorrectOptionCheckBox.bind(this)
    this.handleTextareaChange = this.handleTextareaChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.toggleIsMultipleResponse = this.toggleIsMultipleResponse.bind(this);
    this.displayToggleStatus = this.displayToggleStatus.bind(this);
  }

  componentDidMount() {
    const { props } = this.hideBtn;
    const { className } = props;

    const hideBtn = document.getElementsByClassName(`${className}`);
    if (hideBtn[0]) hideBtn[0].focus();
  }

  componentDidUpdate() {
    const { amIPresenter, layoutContextDispatch } = this.props;

    if (Session.equals('resetPollPanel', true)) {
      this.handleBackClick();
    }

    if (!amIPresenter) {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: false,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.NONE,
      });
    }
  }

  componentWillUnmount() {
    Session.set('secretPoll', false);
  }

  handleBackClick() {
    const { stopPoll } = this.props;
    this.setState({
      isQuestioning: false,
      error: null,
    }, () => {
      stopPoll();
      Session.set('resetPollPanel', false);
      document.activeElement.blur();
    });
  }

  handleInputTextChange(index, text) {
    const { optList } = this.state;
    // This regex will replace any instance of 2 or more consecutive white spaces
    // with a single white space character.
    const option = text.replace(/\s{2,}/g, ' ').trim();

    if (index < optList.length) optList[index] = option === '' ? '' : option;

    this.setState({ optList });
  }

  handleInputChange(e, index) {
    const {
      optList, questionAndOptions, error
    } = this.state;
    
    const list = [...optList];
    const validatedVal = validateInput(e.target.value).replace(/\s{2,}/g, ' ');
    const charsRemovedCount = e.target.value.length - validatedVal.length;
    const input = e.target;
    const caretStart = e.target.selectionStart;
    const caretEnd = e.target.selectionEnd;
    const valWithoutEsterik = validatedVal.substring(0,
       validatedVal.length - CORRECT_OPTION_SYMBOL.length)
    list[index] = isCorrectOption(validatedVal) ? valWithoutEsterik : validatedVal
    let questionAndOptionsList = [];
    if (questionAndOptions.length > 0) {
      questionAndOptionsList = questionAndOptions.split('\n');
      const modifiedOpt = questionAndOptionsList[index + 1]
      if (isCorrectOption(modifiedOpt))
        questionAndOptionsList[index + 1] = validatedVal.concat(CORRECT_OPTION_SYMBOL)
      else
        questionAndOptionsList[index + 1] = validatedVal
    }
    const newQuestionAndOptions = questionAndOptionsList.join('\n')
    let clearError = error && this.isAllErrorsCleared(newQuestionAndOptions)
    this.setState({
      optList: list,
      questionAndOptions: questionAndOptionsList.length > 0
        ? newQuestionAndOptions : '',
      error: clearError ? null : error,
    },
      () => {
        input.focus();
        input.selectionStart = caretStart - charsRemovedCount;
        input.selectionEnd = caretEnd - charsRemovedCount;
      });
  }

  handleTextareaChange(e) {
    let { error } = this.state
    const { intl } = this.props
    const maxOptionsErrorMsg = intl.formatMessage(
      intlMessages.maxOptionsLength,
    );
    const validatedInput = validateInput(e.target.value);
    const { splittedQuestion, optionsList } =
      getSplittedQuestionAndOptions(validatedInput)
    optionsList.forEach((opt, i) => {
      if (isCorrectOption(opt)) {
        const verifiedOpt = opt.substring(0, 
        opt.length - CORRECT_OPTION_SYMBOL.length)
        optionsList[i] = verifiedOpt
      }
    })
    let clearError = false
    if (error) clearError = this.isAllErrorsCleared(validatedInput);
    if (optionsList.length > MAX_CUSTOM_FIELDS) error = maxOptionsErrorMsg
    this.setState({
      error: clearError ? null : error, questionAndOptions: validatedInput,
      question: splittedQuestion, optList: optionsList,
    });
  }

  // handlePollValuesText(text) {
  //   if (text && text.length > 0) {
  //     this.pushToCustomPollValues(text);
  //   }
  // }

  handleRemoveOption(index) {
    const { intl } = this.props;
    const { optList, questionAndOptions, error } = this.state;
    const list = [...optList];
    const removed = list[index];
    list.splice(index, 1);
    let questionAndOptionsList = [];
    questionAndOptionsList = questionAndOptions.split('\n');
    delete questionAndOptionsList[index + 1];
    questionAndOptionsList = questionAndOptionsList
      .filter((val) => val !== undefined);
    const newQuestionAndOptions = questionAndOptionsList.join('\n')
    const clearError = this.isAllErrorsCleared(newQuestionAndOptions)
    this.setState({
      optList: list,
      questionAndOptions: newQuestionAndOptions,
      error: clearError ? null : error,
    }, () => {
      alertScreenReader(`${intl.formatMessage(intlMessages.removePollOpt,
        { 0: removed || intl.formatMessage(intlMessages.emptyPollOpt) })}`);
    });
  }

  toogleCorrectOptionCheckBox(index) {
    const { intl } = this.props;
    const { optList, error, question, questionAndOptions } = this.state
    const optListArray = [...optList]
    const { optionsList: options } = getSplittedQuestionAndOptions(questionAndOptions)
    const correctOptionErrorMsg = intl.formatMessage(
      intlMessages.correctOptionErr,
    );
    const selectedOption = options[index].trim()
    if (!selectedOption) {
      this.setState({
        error: intl.formatMessage(
          intlMessages.optionEmptyError,
        )
      })
      return null;
    }
    const isCorrectOpt = isCorrectOption(selectedOption)
    if (!isCorrectOpt) {
      options[index] = selectedOption.concat(CORRECT_OPTION_SYMBOL)
    }
    else {
      options[index] = selectedOption.slice(0, 
      selectedOption.length - CORRECT_OPTION_SYMBOL.length)
      optListArray[index] = options[index]
    }
    const questionAndOptionsString = `${question}\n${options.join('\n')}`
    const correctOptions = getCorrectOptions(options)
    const clearError = (error === correctOptionErrorMsg
      && correctOptions.length > 0)
    this.setState({
      optList: optListArray,
      error: clearError ? null : error,
      questionAndOptions: questionAndOptionsString
    })
  }

  handleAddOption() {
    const { optList, questionAndOptions } = this.state;
    this.setState({
      optList: [...optList, ''],
      questionAndOptions: questionAndOptions.concat("\n")
    });
  }

  handleToggle() {
    const { secretPoll } = this.state;
    const toggledValue = !secretPoll;
    Session.set('secretPoll', toggledValue);
    this.setState({ secretPoll: toggledValue });
  }

  setOptListLength(len) {
    const { optList } = this.state;
    let diff = len > MAX_CUSTOM_FIELDS
      ? MAX_CUSTOM_FIELDS - optList.length
      : len - optList.length;
    if (diff > 0) {
      while (diff > 0) {
        this.handleAddOption();
        diff -= 1;
      }
    } else {
      while (diff < 0) {
        this.handleRemoveOption();
        diff += 1;
      }
    }
  }

  seperateQuestionsAndOptionsFromString() {
    const { intl } = this.props;
    const { questionAndOptions } = this.state;
    const { splittedQuestion, optionsList } =
      getSplittedQuestionAndOptions(questionAndOptions)
    //empty field error
    if (!splittedQuestion) {
      this.setState({
        error: intl.formatMessage(intlMessages.invalidQuestionAndOptions),
      });
      return true;
    }

    // empty option error
    if (checkIfAnyOptionIsEmpty(optionsList)) {
      this.setState({
        error: intl.formatMessage(intlMessages.optionEmptyError),
      });
      return true
    }

    // min options error
    if (optionsList.length < MIN_OPTIONS_LENGTH) {
      this.setState({
        error: intl.formatMessage(intlMessages.minOptionsLength),
      })
      return true;
    }

    // max options error
    if (optionsList.length > MAX_CUSTOM_FIELDS) {
      this.setState({
        error: intl.formatMessage(intlMessages.maxOptionsLength),
      })
      return true;
    }

    // not set correct option error
    const correctOptions = getCorrectOptions(optionsList)
    if (!correctOptions.length > 0) {
      this.setState({
        error: intl.formatMessage(intlMessages.correctOptionErr),
      })
      return true;
    }
    return { question: splittedQuestion, optList: optionsList };
  }

  toggleIsMultipleResponse() {
    const { isMultipleResponse } = this.state;
    return this.setState({ isMultipleResponse: !isMultipleResponse });
  }

  pushToCustomPollValues(text) {
    const lines = text.split('\n');
    this.setOptListLength(lines.length);
    for (let i = 0; i < MAX_CUSTOM_FIELDS; i += 1) {
      let line = '';
      if (i < lines.length) {
        line = lines[i];
        line = line.length > MAX_INPUT_CHARS ?
          line.substring(0, MAX_INPUT_CHARS) :
          line;
      }
      this.handleInputTextChange(i, line);
    }
  }

  displayToggleStatus(status) {
    const { intl } = this.props;

    return (
      <Styled.ToggleLabel>
        {status ? intl.formatMessage(intlMessages.on)
          : intl.formatMessage(intlMessages.off)}
      </Styled.ToggleLabel>
    );
  }

  isAllErrorsCleared(validatedInput) {
    const { intl } = this.props;
    const { error } = this.state;
    const { optionsList: optionList } = getSplittedQuestionAndOptions(validatedInput)
    const correctOptions = getCorrectOptions(optionList)
    const maxOptionsErrorMsg = intl.formatMessage(
      intlMessages.maxOptionsLength,
    );
    const minOptionsErrorMsg = intl.formatMessage(
      intlMessages.minOptionsLength,
    );
    const invalidEmptyTextErrorMsg = intl.formatMessage(
      intlMessages.invalidQuestionAndOptions,
    );
    const emptyOptionErrorMsg = intl.formatMessage(
      intlMessages.optionEmptyError,
    );
    const correctOptionErrorMsg = intl.formatMessage(
      intlMessages.correctOptionErr,
    );
    if (
      (
        error === invalidEmptyTextErrorMsg
        && validatedInput.length > 0
      ) ||
      (
        error !== invalidEmptyTextErrorMsg
        && validatedInput.trim().length === 0
      ) ||
      (
        error === maxOptionsErrorMsg
        && optionList.length <= MAX_CUSTOM_FIELDS
      ) ||
      (
        error === minOptionsErrorMsg
        && optionList.length >= MIN_OPTIONS_LENGTH
      ) ||
      (
        error === emptyOptionErrorMsg
        && !checkIfAnyOptionIsEmpty(optionList)
      ) ||
      (
        error === correctOptionErrorMsg
        && correctOptions.length > 0
      )
    ) {
      return true
    }
    return false
  }

  renderActivePollOptions() {
    const {
      intl,
      isMeteorConnected,
      stopPoll,
      currentPoll,
      pollAnswerIds,
      usernames,
      isDefaultPoll,
    } = this.props;
    return (
      <div>
        <Styled.Instructions style={{ textAlign: 'justify' }}>
          {intl.formatMessage(intlMessages.activePollInstruction)}
        </Styled.Instructions>
        <LiveResult
          {...{
            isMeteorConnected,
            stopPoll,
            currentPoll,
            pollAnswerIds,
            usernames,
            isDefaultPoll,
          }}
          handleBackClick={this.handleBackClick}
        />
      </div>
    );
  }

  renderPollOptions() {
    const { secretPoll, questionAndOptions, error,
      isMultipleResponse, optList: optionsList } = this.state;
    const { intl, startCustomPoll } = this.props;
    const questionAndOptionsPlaceholderLabel = intlMessages.questionAndOptionsPlaceholder;
    const hasQuestionError = (error !== null);
    return (
      <div>

        <Styled.Instructions style={{ marginBottom: '0.9rem', textAlign: 'justify' }}>
          {intl.formatMessage(intlMessages.addingQuestionInstructionsText)}
          <Styled.CorrectOptionInstructions>
            {" "}{intl.formatMessage(intlMessages.addingCorrectOptionInstructionsText)}
          </Styled.CorrectOptionInstructions>
        </Styled.Instructions>

        <div>
          <Styled.PollQuestionArea
            hasError={hasQuestionError}
            data-test="QuizQuestionArea"
            value={questionAndOptions}
            onChange={(e) => this.handleTextareaChange(e)}
            rows="8"
            cols="35"
            maxLength={QUESTION_MAX_INPUT_CHARS}
            aria-label={intl.formatMessage(questionAndOptionsPlaceholderLabel)}
            placeholder={intl.formatMessage(questionAndOptionsPlaceholderLabel)}
          />
          {hasQuestionError ? (
            <Styled.InputError>{error}</Styled.InputError>
          ) : (
            <Styled.ErrorSpacer>&nbsp;</Styled.ErrorSpacer>
          )}
          {/* {hasWarning ? (
            <Styled.Warning>{warning}</Styled.Warning>
          ) : null} */}

          <div>
            <Styled.PollCheckbox>
              <Checkbox
                onChange={this.toggleIsMultipleResponse}
                checked={isMultipleResponse}
                ariaLabelledBy="multipleResponseCheckboxLabel"
              />
            </Styled.PollCheckbox>
            <Styled.InstructionsLabel id="multipleResponseCheckboxLabel">
              {intl.formatMessage(intlMessages.enableMultipleResponseLabel)}
            </Styled.InstructionsLabel>
          </div>
          {this.renderInputs()}
          {
            questionAndOptions && (
              <Styled.AddItemButton
                data-test="addQuestionOption"
                label={intl.formatMessage(intlMessages.addOptionLabel)}
                aria-describedby="add-item-button"
                color="default"
                icon="add"
                disabled={optionsList.length >= MAX_CUSTOM_FIELDS}
                onClick={() => this.handleAddOption()}
              />
            )
          }
        </div>

        <Styled.Row>
          <Styled.Col aria-hidden="true">
            <Styled.SectionHeading>
              {intl.formatMessage(intlMessages.secretPollLabel)}
            </Styled.SectionHeading>
          </Styled.Col>
          <Styled.Col>
            <Styled.Toggle>
              {this.displayToggleStatus(secretPoll)}
              <Toggle
                icons={false}
                defaultChecked={secretPoll}
                onChange={() => this.handleToggle()}
                ariaLabel={intl.formatMessage(intlMessages.secretPollLabel)}
                showToggleLabel={false}
                data-test="anonymousPollBtn"
              />
            </Styled.Toggle>
          </Styled.Col>
        </Styled.Row>
        {secretPoll
          && (
            <Styled.AnonymousPollParagraph>
              {intl.formatMessage(intlMessages.isSecretPollLabel)}
            </Styled.AnonymousPollParagraph>
          )}
        <Styled.StartPollBtn
          data-test="startPoll"
          label={intl.formatMessage(intlMessages.askQuestionLabel)}
          color="primary"
          onClick={() => {
            const { question, optList } = this.seperateQuestionsAndOptionsFromString();
            const { questionAndOptions } = this.state
            // const { optionsList } = getSplittedQuestionAndOptions(questionAndOptions)
            // const correctOptions = getCorrectOptions(optionsList)
            // const answers = [];
            const verifiedQuestionType = 'CUSTOM';
            if (question && optList && !error) {
              // this.state.optList.forEach((opt, index) => {
              //   answers.push({
              //     id: index,
              //     key: opt,
              //     isCorrect: correctOptions.includes(opt)
              //   });
              // });
              return this.setState({ isQuestioning: true, optList, question }, () => {
                let verifiedOptions = verifiedOptionList(optList)
                startCustomPoll(
                  verifiedQuestionType,
                  secretPoll,
                  question ? question
                    : questionAndOptions.split('\n')[0],
                  isMultipleResponse,
                  _.compact(verifiedOptions),
                  // answers
                );
              })
            }
            return null;
          }
          }
        />

        <Styled.PreviewModalButton
          label={intl.formatMessage(intlMessages.previewBtnLabel)}
          aria-describedby="preview-question-button"
          color="default"
          onClick={() => {
            const { question, optList } = this.seperateQuestionsAndOptionsFromString();
            if (question && optList && !error) {
              this.setState({ openPreviewModal: true });
            }
          }
          }
        />
        {/* {
          FILE_DRAG_AND_DROP_ENABLED
          && type !== PollTypes.Response
          && this.renderDragDrop()
        } */}
      </div>
    )
  }

  renderNoSlidePanel() {
    const { intl } = this.props;
    return (
      <Styled.NoSlidePanelContainer>
        <Styled.SectionHeading>
          {intl.formatMessage(intlMessages.noPresentationSelected)}
        </Styled.SectionHeading>
        <Styled.PollButton
          label={intl.formatMessage(intlMessages.clickHereToSelect)}
          color="primary"
          onClick={() => Session.set('showUploadPresentationView', true)}
        />
      </Styled.NoSlidePanelContainer>
    );
  }

  renderPollPanel() {
    // const { isQuestioning } = this.state;
    const {
      currentPoll,
      currentSlide,
    } = this.props;
    if (!currentSlide) return this.renderNoSlidePanel();
    if ( currentPoll && !currentPoll.isPublished ) {
      return this.renderActivePollOptions();
    }

    return this.renderPollOptions();
  }

  renderInputs() {
    const { intl } = this.props;
    const { optList, error, questionAndOptions } = this.state;
    const { optionsList } = getSplittedQuestionAndOptions(questionAndOptions)
    const correctOptions = getCorrectOptions(optionsList)
    const emptyOptionErrorMsg = intl.formatMessage(
      intlMessages.optionEmptyError,
    );
    return optList.slice(0, MAX_CUSTOM_FIELDS).map((o, i) => {
      const pollOptionKey = `poll-option-${i}`;
      const option = isCorrectOption(o) ? o.substring(0,
         o.length - CORRECT_OPTION_SYMBOL.length) : o
      return (
        <span key={pollOptionKey}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'spaceBetween',
            }}
          >
            <Styled.PollOptionInput
              type="text"
              value={o}
              placeholder={intl.formatMessage(intlMessages.customPlaceholder)}
              data-test="pollOptionItem"
              onChange={(e) => this.handleInputChange(e, i)}
              maxLength={MAX_INPUT_CHARS}
              isCorrect={correctOptions.includes(option)}
            />
            <Styled.PollCheckbox>
              <Checkbox
                onChange={() => this.toogleCorrectOptionCheckBox(i)}
                checked={correctOptions.includes(option)}
                ariaLabelledBy="optionsCheckboxLabel"
              />
            </Styled.PollCheckbox>
            {
              optList.length > MIN_OPTIONS_LENGTH && (
                <Styled.DeletePollOptionButton
                  label={intl.formatMessage(intlMessages.delete)}
                  aria-describedby={`option-${i}`}
                  icon="delete"
                  data-test="deletePollOption"
                  hideLabel
                  circle
                  color="default"
                  onClick={() => {
                    this.handleRemoveOption(i);
                  }}
                />
              )
            }

            <span className="sr-only" id={`option-${i}`}>
              {intl.formatMessage(intlMessages.deleteRespDesc,
                { 0: (o || intl.formatMessage(intlMessages.emptyPollOpt)) })}
            </span>
          </div>
          {(!o.trim() || (o.trim().replace(CORRECT_OPTION_SYMBOL, '') === ''))
            && error === emptyOptionErrorMsg ? (
            <Styled.InputError>{error}</Styled.InputError>
          ) : (
            <Styled.ErrorSpacer>&nbsp;</Styled.ErrorSpacer>
          )}
        </span>
      );
    });
  }

  render() {
    const {
      intl,
      stopPoll,
      currentPoll,
      layoutContextDispatch,
    } = this.props;
    const { question, openPreviewModal, optList, questionAndOptions } = this.state;
    const { optionsList } = getSplittedQuestionAndOptions(questionAndOptions)
    const correctOptions = getCorrectOptions(optionsList)
    return (
      <div>
        <Styled.Header>
          <Styled.PollHideButton
            ref={(node) => { this.hideBtn = node; }}
            data-test="hidePollDesc"
            tabIndex={0}
            label={intl.formatMessage(intlMessages.askQuestionPaneTitle)}
            icon="left_arrow"
            aria-label={intl.formatMessage(intlMessages.hidePollDesc)}
            onClick={() => {
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                value: false,
              });
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                value: PANELS.NONE,
              });
            }}
          />
          <Styled.PollCloseButton
            label={intl.formatMessage(intlMessages.closeLabel)}
            aria-label={`${intl.formatMessage(intlMessages.closeLabel)} ${intl.formatMessage(intlMessages.askQuestionPaneTitle)}`}
            onClick={() => {
              if (currentPoll) stopPoll();
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                value: false,
              });
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                value: PANELS.NONE,
              });
              Session.set('forcePollOpen', false);
              Session.set('pollInitiated', false);
            }}
            icon="close"
            size="sm"
            hideLabel
            data-test="closeQuestioning"
          />
        </Styled.Header>
        {this.renderPollPanel()}
        <span className="sr-only" id="Poll-config-button">{intl.formatMessage(intlMessages.showRespDesc)}</span>
        <span className="sr-only" id="add-item-button">{intl.formatMessage(intlMessages.addRespDesc)}</span>
        <span className="sr-only" id="start-Poll-button">{intl.formatMessage(intlMessages.startPollDesc)}</span>

        {/* Modal To Preview Question */}
        <Modal
          isOpen={openPreviewModal}
          onRequestClose={() => {
            this.setState({ openPreviewModal: false });
          }}
          hideBorder
          data-test="audioModal"
          title={intl.formatMessage(intlMessages.previewBtnLabel)}
        >
          <Styled.PreviewModalContainer>
            <div style={{ borderBottom: '0.3px solid #e5e5e5' }}>
              <Styled.ModalHeading>
                {intl.formatMessage(intlMessages.questionLabel)}
              </Styled.ModalHeading>
              <p>{question}</p>
            </div>
            <Styled.ModalHeading>
              {intl.formatMessage(intlMessages.optionsLabel)}
            </Styled.ModalHeading>
            <ul style={{ listStyle: 'none' }}>
              {optList
                ? optList.map((opt, index) => {
                  const uniqueKey = `opt-list-question-${index}`;
                  const option = isCorrectOption(opt) ? opt.substring(0, 
                    opt.length - CORRECT_OPTION_SYMBOL.length) : opt
                  return (
                    <Styled.OptionListItem key={uniqueKey} 
                    isCorrect={correctOptions.includes(option)}>
                      {`${index + 1}.  `}
                      {!correctOptions.includes(option) ? (
                        opt
                      ) : (
                        <span>
                          {' '}
                          {option}
                          {' '}
                          <strong>
                            {' '}
                            (
                            {intl.formatMessage(
                              intlMessages.correctOptionLabel,
                            )}
                            )
                            {' '}
                          </strong>
                        </span>
                      )}
                    </Styled.OptionListItem>
                  );
                })
                : null}
            </ul>
          </Styled.PreviewModalContainer>
        </Modal>
      </div>
    );
  }
}

export default withModalMounter(injectIntl(Poll));

Poll.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  pollTypes: PropTypes.instanceOf(Object).isRequired,
  startPoll: PropTypes.func.isRequired,
  startCustomPoll: PropTypes.func.isRequired,
  stopPoll: PropTypes.func.isRequired,
};
