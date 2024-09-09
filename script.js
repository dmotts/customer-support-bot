"use strict";

// Load environment variables
require('dotenv').config();

const accessToken = process.env.ACCESS_TOKEN;
const baseUrl = 'https://api.api.ai/api/query?v=2015091001';
const sessionId = '20150910';
const loader = "<span class='loader'><span class='loader__dot'></span><span class='loader__dot'></span><span class='loader__dot'></span></span>";
const errorMessage = 'My apologies, I\'m not available at the moment, however, feel free to call our support team directly at 0123456789.';
const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
const $document = document;
const $chatbot = $document.querySelector('.chatbot');
const $chatbotMessageWindow = $document.querySelector('.chatbot__message-window');
const $chatbotHeader = $document.querySelector('.chatbot__header');
const $chatbotMessages = $document.querySelector('.chatbot__messages');
const $chatbotInput = $document.querySelector('.chatbot__input');
const $chatbotSubmit = $document.querySelector('.chatbot__submit');
const botLoadingDelay = 1000;
const botReplyDelay = 2000;

document.addEventListener('keypress', (event) => {
  if (event.which == 13) validateMessage();
}, false);

$chatbotHeader.addEventListener('click', () => {
  toggle($chatbot, 'chatbot--closed');
  $chatbotInput.focus();
}, false);

$chatbotSubmit.addEventListener('click', () => {
  validateMessage();
}, false);

const toggle = (element, klass) => {
  const classes = element.className.match(/\S+/g) || [];
  const index = classes.indexOf(klass);
  index >= 0 ? classes.splice(index, 1) : classes.push(klass);
  element.className = classes.join(' ');
};

const userMessage = (content) => {
  $chatbotMessages.innerHTML += `<li class='is-user animation'>
      <p class='chatbot__message'>
        ${content}
      </p>
      <span class='chatbot__arrow chatbot__arrow--right'></span>
    </li>`;
};

const aiMessage = (content, isLoading = false, delay = 0) => {
  setTimeout(() => {
    removeLoader();
    $chatbotMessages.innerHTML += `<li 
      class='is-ai animation' 
      id='${isLoading ? "is-loading" : ""}'>
        <div class="is-ai__profile-picture">
          <svg class="icon-avatar" viewBox="0 0 32 32">
            <use xlink:href="#avatar" />
          </svg>
        </div>
        <span class='chatbot__arrow chatbot__arrow--left'></span>
        <div class='chatbot__message'>${content}</div>
      </li>`;
    scrollDown();
  }, delay);
};

const removeLoader = () => {
  const loadingElem = document.getElementById('is-loading');
  if (loadingElem) $chatbotMessages.removeChild(loadingElem);
};

const escapeScript = (unsafe) => {
  const safeString = unsafe.replace(/</g, ' ').replace(/>/g, ' ').replace(/&/g, ' ').replace(/"/g, ' ').replace(/\\/, ' ').replace(/\s+/g, ' ');
  return safeString.trim();
};

const linkify = (inputText) => {
  return inputText.replace(urlPattern, "<a href='$1' target='_blank'>$1</a>");
};

const validateMessage = () => {
  const text = $chatbotInput.value;
  const safeText = text ? escapeScript(text) : '';
  if (safeText.length && safeText !== ' ') {
    resetInputField();
    userMessage(safeText);
    send(safeText);
  }
  scrollDown();
  return;
};

const multiChoiceAnswer = (text) => {
  const decodedText = text.replace(/zzz/g, "'");
  userMessage(decodedText);
  send(decodedText);
  scrollDown();
  return;
};

const processResponse = (val) => {
  if (val && val.fulfillment) {
    let output = '';
    const messagesLength = val.fulfillment.messages.length;
    for (let i = 0; i < messagesLength; i++) {
      const message = val.fulfillment.messages[i];
      const type = message.type;
      switch (type) {
        // 0 fulfillment is text
        case 0:
          const parsedText = linkify(message.speech);
          output += `<p>${parsedText}</p>`;
          break;

        // 1 fulfillment is card
        case 1:
          const imageUrl = message.imageUrl;
          const imageTitle = message.title;
          const imageSubtitle = message.subtitle;
          const button = message.buttons[0];
          if (!imageUrl && !button && !imageTitle && !imageSubtitle) break;
          output += `
            <a class='card' href='${button.postback}' target='_blank'>
              <img src='${imageUrl}' alt='${imageTitle}' />
            <div class='card-content'>
              <h4 class='card-title'>${imageTitle}</h4>
              <p class='card-title'>${imageSubtitle}</p>
              <span class='card-button'>${button.text}</span>
            </div>
            </a>
          `;
          break;

        // 2 fulfillment is a quick reply with multi-choice buttons
        case 2:
          const title = message.title;
          const replies = message.replies;
          const repliesLength = replies.length;
          output += `<p>${title}</p>`;
          for (let i = 0; i < repliesLength; i++) {
            const reply = replies[i];
            const encodedText = reply.replace(/'/g, 'zzz');
            output += `<button onclick='multiChoiceAnswer("${encodedText}")'>${reply}</button>`;
          }
          break;
      }
    }
    removeLoader();
    return output;
  }
  removeLoader();
  return `<p>${errorMessage}</p>`;
};

const setResponse = (val, delay = 0) => {
  setTimeout(() => {
    aiMessage(processResponse(val));
  }, delay);
};

const resetInputField = () => {
  $chatbotInput.value = '';
};

const scrollDown = () => {
  const distanceToScroll = $chatbotMessageWindow.scrollHeight - ($chatbotMessages.lastChild.offsetHeight + 60);
  $chatbotMessageWindow.scrollTop = distanceToScroll;
  return false;
};

const send = (text = '') => {
  fetch(`${baseUrl}&query=${text}&lang=en&sessionId=${sessionId}`, {
    method: 'GET',
    dataType: 'json',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json; charset=utf-8'
    }
  }).then(response => response.json())
    .then(res => {
      if (res.status < 200 || res.status >= 300) {
        const error = new Error(res.statusText);
        throw error;
      }
      return res;
    }).then(res => {
      setResponse(res.result, botLoadingDelay + botReplyDelay);
    }).catch(error => {
      setResponse(errorMessage, botLoadingDelay + botReplyDelay);
      resetInputField();
      console.log(error);
    });
  aiMessage(loader, true, botLoadingDelay);
};
