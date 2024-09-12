"use strict";

document.addEventListener('DOMContentLoaded', function () {
  // Use the AJAX URL provided by WordPress
  const baseUrl = vacw_settings.ajax_url + '?action=vacw_api_proxy';
  const sessionId = '20150910';
  const loader = "<span class='loader'><span class='loader__dot'></span><span class='loader__dot'></span><span class='loader__dot'></span></span>";
  const errorMessage = 'My apologies, I\'m not available at the moment, however, feel free to call our support team directly at 0123456789.';
  const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;

  // DOM elements
  const $document = document;
  const $chatbot = $document.querySelector('.chatbot');
  const $chatbotMessageWindow = $document.querySelector('.chatbot__message-window');
  const $chatbotHeader = $document.querySelector('.chatbot__header');
  const $chatbotMessages = $document.querySelector('.chatbot__messages');
  const $chatbotInput = $document.querySelector('.chatbot__input');
  const $chatbotSubmit = $document.querySelector('.chatbot__submit');

  // Event listeners with debounce to avoid multiple API calls
  document.addEventListener('keypress', debounce((event) => {
    if (event.which === 13) validateMessage(); // Enter key
  }, 300), false);

  $chatbotHeader.addEventListener('click', () => {
    toggle($chatbot, 'chatbot--closed');
    $chatbotInput.focus();
  }, false);

  $chatbotSubmit.addEventListener('click', debounce(() => {
    validateMessage();
  }, 300), false);

  // Debounce function to limit the rate at which a function can fire
  function debounce(func, wait, immediate) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  // Validate user input and prepare to send a message
  const validateMessage = () => {
    const text = $chatbotInput.value.trim();
    if (text) {
      resetInputField();
      userMessage(text);
      sendMessageToAPI(text);
    }
    scrollDown();
  };

  // Send a message to the API via WordPress AJAX
  const sendMessageToAPI = async (text = '') => {
    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: new URLSearchParams({
          query: text,
          lang: 'en',
          sessionId: sessionId
        })
      });
      const result = await response.json();
      
      if (!result.success) throw new Error(result.data);
      setResponse(result.data, botLoadingDelay + botReplyDelay);
    } catch (error) {
      setResponse(errorMessage, botLoadingDelay + botReplyDelay);
      resetInputField();
      console.error('Error communicating with API:', error);
    }
    aiMessage(loader, true, botLoadingDelay);
  };

  // Function to display a loading animation
  const aiMessage = (content, isLoading = false, delay = 0) => {
    setTimeout(() => {
      removeLoader();
      $chatbotMessages.innerHTML += `
        <li class='is-ai animation' id='${isLoading ? "is-loading" : ""}'>
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

  // Function to reset the input field after a message is sent
  const resetInputField = () => {
    $chatbotInput.value = '';
  };

  // Function to scroll down the chat window to the latest message
  const scrollDown = () => {
    const distanceToScroll = $chatbotMessageWindow.scrollHeight - ($chatbotMessages.lastChild.offsetHeight + 60);
    $chatbotMessageWindow.scrollTop = distanceToScroll;
  };

  // Function to escape potentially unsafe characters from the input
  const escapeScript = (unsafe) => {
    const safeString = unsafe.replace(/</g, ' ').replace(/>/g, ' ').replace(/&/g, ' ').replace(/"/g, ' ').replace(/\\/, ' ').replace(/\s+/g, ' ');
    return safeString.trim();
  };

  // Function to toggle classes for showing/hiding elements
  const toggle = (element, klass) => {
    const classes = element.className.match(/\S+/g) || [];
    const index = classes.indexOf(klass);
    index >= 0 ? classes.splice(index, 1) : classes.push(klass);
    element.className = classes.join(' ');
  };

  // Function to display a user message in the chat window
  const userMessage = (content) => {
    $chatbotMessages.innerHTML += `
      <li class='is-user animation'>
        <p class='chatbot__message'>${escapeScript(content)}</p>
        <span class='chatbot__arrow chatbot__arrow--right'></span>
      </li>`;
  };

  // Function to remove the loading animation
  const removeLoader = () => {
    const loadingElem = document.getElementById('is-loading');
    if (loadingElem) $chatbotMessages.removeChild(loadingElem);
  };

  // Function to set response from AI or show error
  const setResponse = (val, delay = 0) => {
    setTimeout(() => {
      aiMessage(val);
    }, delay);
  };
});
