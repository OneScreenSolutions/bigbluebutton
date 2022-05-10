import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import fastdom from 'fastdom';
import { injectIntl } from 'react-intl';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import Styled from './styles';
import Modal from '/imports/ui/components/common/modal/simple/component';
import Chart from "react-apexcharts";

const propTypes = {
  text: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  pollResultData: PropTypes.object,
  lastReadMessageTime: PropTypes.number,
  handleReadMessage: PropTypes.func.isRequired,
  scrollArea: PropTypes.instanceOf(Element),
  className: PropTypes.string.isRequired,
};

const defaultProps = {
  lastReadMessageTime: 0,
  scrollArea: undefined,
};

const eventsToBeBound = [
  'scroll',
  'resize',
];

const isElementInViewport = (el) => {
  if (!el) return false;
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0
    // This condition is for large messages that are bigger than client height
    || rect.top + rect.height >= 0
  );
};

class MessageChatItem extends PureComponent {
  constructor(props) {
    super(props);

    this.ticking = false;
    this.state = {
      isOpenStatsPreviewModal: false,
    }
    this.handleMessageInViewport = _.debounce(this.handleMessageInViewport.bind(this), 50);
  }

  componentDidMount() {
    this.listenToUnreadMessages();
  }

  componentDidUpdate(prevProps, prevState) {
    ChatLogger.debug('MessageChatItem::componentDidUpdate::props', { ...this.props }, { ...prevProps });
    ChatLogger.debug('MessageChatItem::componentDidUpdate::state', { ...this.state }, { ...prevState });
    this.listenToUnreadMessages();
  }

  componentWillUnmount() {
    // This was added 3 years ago, but never worked. Leaving it around in case someone returns
    // and decides it needs to be fixed like the one in listenToUnreadMessages()
    // if (!lastReadMessageTime > time) {
    //  return;
    // }
    ChatLogger.debug('MessageChatItem::componentWillUnmount', this.props);
    this.removeScrollListeners();
  }

  addScrollListeners() {
    const {
      scrollArea,
    } = this.props;

    if (scrollArea) {
      eventsToBeBound.forEach(
        e => scrollArea.addEventListener(e, this.handleMessageInViewport),
      );
    }
  }

  handleMessageInViewport() {
    if (!this.ticking) {
      fastdom.measure(() => {
        const node = this.text;
        const {
          handleReadMessage,
          time,
          read,
        } = this.props;

        if (read) {
          this.removeScrollListeners();
          return;
        }

        if (isElementInViewport(node)) {
          handleReadMessage(time);
          this.removeScrollListeners();
        }

        this.ticking = false;
      });
    }

    this.ticking = true;
  }

  removeScrollListeners() {
    const {
      scrollArea,
      read,
    } = this.props;

    if (scrollArea && !read) {
      eventsToBeBound.forEach(
        e => scrollArea.removeEventListener(e, this.handleMessageInViewport),
      );
    }
  }

  pollStatsModal() {
    const { isOpenStatsPreviewModal } = this.state
    const { pollResultData } = this.props
    const options = [];
    const votesOfOptions = [];
    const question = pollResultData?.questionText
    pollResultData.answers.forEach((opt) => {
      options.push(opt.key)
      votesOfOptions.push(opt.numVotes)
    })
    const chartData = {
      series: [{
        data: votesOfOptions
      }],
      options: {
        chart: {
          height: 350,
          type: 'bar',
          events: {
            click: function (chart, w, e) {
              // console.log(chart, w, e)
            }
          }
        },
        colors: ['#F44336', '#E91E63', '#9C27B0'],
        plotOptions: {
          bar: {
            columnWidth: '45%',
            distributed: true,
          }
        },
        dataLabels: {
          enabled: false
        },
        legend: {
          show: false
        },
        xaxis: {
          categories: options,
          labels: {
            // formatter: function (value) {
            //   if(value.length > 20)
            //     return `${value.substring(0,20)}...`;
            //   return value
            // },
            trim: true,
            style: {
              colors: ['#F44336', '#E91E63', '#9C27B0'],
              fontSize: '14px',
            }
          },
          title: {
            text: question.length > 60 ? `${question.substring(0,60)}...` : question,
            trim: true,
            align: 'left',
            margin:3,
            // offsetX: 0,
            // offsetY: -330,
            floating: true,
            style: {
              fontSize:  '15px',
              fontWeight:  'normal',
              color:  '#263238',
              textAnchor:'middle'
            },
          },
        },
        yaxis: [
          {
            labels: {
              formatter: function (val) {
                return val.toFixed(0);
              }
            },
          },
        ]
      },
      
    }
    console.log("////////////////inside modal", isOpenStatsPreviewModal, "poll extra", pollResultData)
    return (

      <Modal
        isOpen={isOpenStatsPreviewModal}
        onRequestClose={() => {
          this.setState({
            isOpenStatsPreviewModal: false
          })
        }}
        hideBorder
        data-test="pollStatsModal"
        title={"Poll Stats"}
      >
        <Styled.PreviewModalContainer>
          {/* <Styled.ModalHeading>
            {pollResultData.questionText}
          </Styled.ModalHeading> */}
          <Chart options={chartData.options} series={chartData.series} type="bar" height={350} />

        </Styled.PreviewModalContainer>
      </Modal>

    )
  }

  // depending on whether the message is in viewport or not,
  // either read it or attach a listener
  listenToUnreadMessages() {
    const {
      handleReadMessage,
      time,
      read,
    } = this.props;

    if (read) {
      return;
    }

    const node = this.text;

    fastdom.measure(() => {
      const {
        read: newRead,
      } = this.props;
      // this function is called after so we need to get the updated lastReadMessageTime

      if (newRead) {
        return;
      }

      if (isElementInViewport(node)) { // no need to listen, the message is already in viewport
        handleReadMessage(time);
      } else {
        this.addScrollListeners();
      }
    });
  }

  render() {
    const {
      text,
      type,
      className,
      isSystemMessage,
      chatUserMessageItem,
      systemMessageType,
      color,
    } = this.props;
    ChatLogger.debug('MessageChatItem::render', this.props);
    console.log("type", type, "------props", this.props)
    if (type === 'poll') {
      console.log(" inside poll")
      return (
        <div style={{ borderLeft: `3px ${color} solid`, }}>
          {this.pollStatsModal()}
          <p
            className={className}
            style={{
              whiteSpace: 'pre-wrap',
              borderBottomLeftRadius: 0, borderBottomRightRadius: 0
            }}
            ref={(ref) => { this.text = ref; }}
            dangerouslySetInnerHTML={{ __html: text }}
            data-test="chatPollMessageText"
          />

          <Styled.DownloadPollStatsButton
            label={"View Stats"}
            aria-describedby="download-stats-button"
            color="default"
            onClick={() => {
              console.log("download poll in chat clicked")
              this.setState({
                isOpenStatsPreviewModal: true
              })
            }
            }
          />
        </div>
      );
    } else {
      return (
        <p
          className={className}
          ref={(ref) => { this.text = ref; }}
          dangerouslySetInnerHTML={{ __html: text }}
          data-test={isSystemMessage ? systemMessageType : chatUserMessageItem ? 'chatUserMessageText' : ''}
        />
      );
    }
  }
}

MessageChatItem.propTypes = propTypes;
MessageChatItem.defaultProps = defaultProps;

export default injectIntl(MessageChatItem);
