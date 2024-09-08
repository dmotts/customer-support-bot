"use strict";

var accessToken = '3796899bd37c423bad3a21a25277bce0';
var baseUrl = 'https://api.api.ai/api/query?v=2015091001';
var sessionId = '20150910';
var loader = "<span class='loader'><span class='loader__dot'></span><span class='loader__dot'></span><span class='loader__dot'></span></span>";
var errorMessage = 'My apologies, I\'m not avail at the moment, however, feel free to call our support team directly 0123456789.';
var urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
var $document = document;
var $chatbot = $document.querySelector('.chatbot');
var $chatbotMessageWindow = $document.querySelector('.chatbot__message-window');
var $chatbotHeader = $document.querySelector('.chatbot__header');
var $chatbotMessages = $document.querySelector('.chatbot__messages');
var $chatbotInput = $document.querySelector('.chatbot__input');
var $chatbotSubmit = $document.querySelector('.chatbot__submit');
var botLoadingDelay = 1000;
var botReplyDelay = 2000;
document.addEventListener('keypress', function (event) {
  if (event.which == 13) validateMessage();
}, false);
$chatbotHeader.addEventListener('click', function () {
  toggle($chatbot, 'chatbot--closed');
  $chatbotInput.focus();
}, false);
$chatbotSubmit.addEventListener('click', function () {
  validateMessage();
}, false);
var toggle = function toggle(element, klass) {
  var classes = element.className.match(/\S+/g) || [],
    index = classes.indexOf(klass);
  index >= 0 ? classes.splice(index, 1) : classes.push(klass);
  element.className = classes.join(' ');
};
var userMessage = function userMessage(content) {
  $chatbotMessages.innerHTML += "<li class='is-user animation'>\n      <p class='chatbot__message'>\n        ".concat(content, "\n      </p>\n      <span class='chatbot__arrow chatbot__arrow--right'></span>\n    </li>");
};
var aiMessage = function aiMessage(content) {
  var isLoading = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  setTimeout(function () {
    removeLoader();
    $chatbotMessages.innerHTML += "<li \n      class='is-ai animation' \n      id='".concat(isLoading ? "is-loading" : "", "'>\n        <div class=\"is-ai__profile-picture\">\n          <svg class=\"icon-avatar\" viewBox=\"0 0 32 32\">\n            <use xlink:href=\"#avatar\" />\n          </svg>\n        </div>\n        <span class='chatbot__arrow chatbot__arrow--left'></span>\n        <div class='chatbot__message'>").concat(content, "</div>\n      </li>");
    scrollDown();
  }, delay);
};
var removeLoader = function removeLoader() {
  var loadingElem = document.getElementById('is-loading');
  if (loadingElem) $chatbotMessages.removeChild(loadingElem);
};
var escapeScript = function escapeScript(unsafe) {
  var safeString = unsafe.replace(/</g, ' ').replace(/>/g, ' ').replace(/&/g, ' ').replace(/"/g, ' ').replace(/\\/, ' ').replace(/\s+/g, ' ');
  return safeString.trim();
};
var linkify = function linkify(inputText) {
  return inputText.replace(urlPattern, "<a href='$1' target='_blank'>$1</a>");
};
var validateMessage = function validateMessage() {
  var text = $chatbotInput.value;
  var safeText = text ? escapeScript(text) : '';
  if (safeText.length && safeText !== ' ') {
    resetInputField();
    userMessage(safeText);
    send(safeText);
  }
  scrollDown();
  return;
};
var multiChoiceAnswer = function multiChoiceAnswer(text) {
  var decodedText = text.replace(/zzz/g, "'");
  userMessage(decodedText);
  send(decodedText);
  scrollDown();
  return;
};
var processResponse = function processResponse(val) {
  if (val && val.fulfillment) {
    var output = '';
    var messagesLength = val.fulfillment.messages.length;
    for (var i = 0; i < messagesLength; i++) {
      var message = val.fulfillment.messages[i];
      var type = message.type;
      switch (type) {
        // 0 fulfillment is text
        case 0:
          var parsedText = linkify(message.speech);
          output += "<p>".concat(parsedText, "</p>");
          break;

        // 1 fulfillment is card
        case 1:
          var imageUrl = message.imageUrl;
          var imageTitle = message.title;
          var imageSubtitle = message.subtitle;
          var button = message.buttons[0];
          if (!imageUrl && !button && !imageTitle && !imageSubtitle) break;
          output += "\n            <a class='card' href='".concat(button.postback, "' target='_blank'>\n              <img src='").concat(imageUrl, "' alt='").concat(imageTitle, "' />\n            <div class='card-content'>\n              <h4 class='card-title'>").concat(imageTitle, "</h4>\n              <p class='card-title'>").concat(imageSubtitle, "</p>\n              <span class='card-button'>").concat(button.text, "</span>\n            </div>\n            </a>\n          ");
          break;

        // 2 fulfillment is a quick reply with multi-choice buttons
        case 2:
          var title = message.title;
          var replies = message.replies;
          var repliesLength = replies.length;
          output += "<p>".concat(title, "</p>");
          for (var _i = 0; _i < repliesLength; _i++) {
            var reply = replies[_i];
            var encodedText = reply.replace(/'/g, 'zzz');
            output += "<button onclick='multiChoiceAnswer(\"".concat(encodedText, "\")'>").concat(reply, "</button>");
          }
          break;
      }
    }
    removeLoader();
    return output;
  }
  removeLoader();
  return "<p>".concat(errorMessage, "</p>");
};
var setResponse = function setResponse(val) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  setTimeout(function () {
    aiMessage(processResponse(val));
  }, delay);
};
var resetInputField = function resetInputField() {
  $chatbotInput.value = '';
};
var scrollDown = function scrollDown() {
  var distanceToScroll = $chatbotMessageWindow.scrollHeight - ($chatbotMessages.lastChild.offsetHeight + 60);
  $chatbotMessageWindow.scrollTop = distanceToScroll;
  return false;
};
var send = function send() {
  var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  fetch("".concat(baseUrl, "&query=").concat(text, "&lang=en&sessionId=").concat(sessionId), {
    method: 'GET',
    dataType: 'json',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json; charset=utf-8'
    }
  }).then(function (response) {
    return response.json();
  }).then(function (res) {
    if (res.status < 200 || res.status >= 300) {
      var error = new Error(res.statusText);
      throw error;
    }
    return res;
  }).then(function (res) {
    setResponse(res.result, botLoadingDelay + botReplyDelay);
  })["catch"](function (error) {
    setResponse(errorMessage, botLoadingDelay + botReplyDelay);
    resetInputField();
    console.log(error);
  });
  aiMessage(loader, true, botLoadingDelay);
};
