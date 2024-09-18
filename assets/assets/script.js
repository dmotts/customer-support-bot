const botLoadingDelay = 3000; // Default delay for loader (3 seconds)
const botReplyDelay = 2000;   // Default delay before showing loader (2 seconds)
const idleTimeout = 15000;    // 15 seconds idle time before prompting the user
const maxRetries = 3;         // Maximum number of retries for API requests
let retryCount = 0;           // Counter to track the number of retries

// Use dynamically passed values from WordPress localized script
const apiUrl = vacw_settings.ajax_url + '?action=vacw_api_proxy'; // Use proxy endpoint for API requests
const initialGreeting = "Hi! How can I assist you today?"; // Initial greeting message
const botAvatar = vacw_settings.avatar_url; // Dynamically loaded bot avatar URL
let isRunning = false; // State to prevent multiple simultaneous messages
let idleTimer; // Timer to track user idle time

// Event listeners for user input and chatbot toggle
document.getElementById("message").addEventListener("keyup", handleKeyUp);
document.getElementById("chatbot_toggle").onclick = toggleChatbot;
document.querySelector(".input-send").onclick = sendMessage; // Ensure the send button triggers sendMessage

// Reset the idle timer whenever user interacts
document.body.addEventListener("mousemove", resetIdleTimer);
document.body.addEventListener("keydown", resetIdleTimer);

/**
 * Handles the "Enter" key event to send a message.
 * @param {KeyboardEvent} event - The key event triggered.
 */
function handleKeyUp(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
}

/**
 * Toggles the chatbot visibility.
 */
function toggleChatbot() {
  const chatbot = document.getElementById("chatbot");
  const toggleButton = document.getElementById("chatbot_toggle");

  if (chatbot.classList.contains("collapsed")) {
    // Expand the chatbot
    chatbot.classList.remove("collapsed");
    toggleButton.children[0].style.display = "none";
    toggleButton.children[1].style.display = "";
    setTimeout(() => appendMessage(initialGreeting, "received", false), 1000); // Show initial greeting
    resetIdleTimer(); // Reset the idle timer when the bot is opened
  } else {
    // Collapse the chatbot
    chatbot.classList.add("collapsed");
    toggleButton.children[0].style.display = "";
    toggleButton.children[1].style.display = "none";
  }
}

/**
 * Sends a message typed by the user.
 */
function sendMessage() {
  if (isRunning) return; // Prevent multiple messages at once

  const msg = document.getElementById("message").value.trim();
  if (!msg) return; // Exit if no message is typed

  isRunning = true; // Indicate the bot is processing
  appendMessage(msg, "sent"); // Display the user's message
  resetIdleTimer(); // Reset idle timer when user sends a message

  try {
    fetchResponseFromAPI(msg);
  } catch (error) {
    handleError('Error initiating message send', error);
    appendMessage("An unexpected error occurred. Please try again later.", "received");
    isRunning = false; // Reset the state to allow further messages
  }
}

/**
 * Fetches bot response from the API.
 * @param {string} userMessage - The message sent by the user.
 */
function fetchResponseFromAPI(userMessage) {
  setTimeout(showLoader, botReplyDelay); // Show loading dots after a delay

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: userMessage })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      retryCount = 0; // Reset retry count on success
      const { botMessage, responseDelay } = data;
      // Replace loader with bot message after delay
      setTimeout(() => {
        replaceLoaderWithMessage(botMessage);
        isRunning = false; // Allow further messages
      }, responseDelay || botLoadingDelay);
    })
    .catch(error => {
      handleFetchError(error, userMessage);
    });
}

/**
 * Handles errors from fetching the bot response.
 * @param {Error} error - The error encountered during fetch.
 * @param {string} userMessage - The original message sent by the user.
 */
function handleFetchError(error, userMessage) {
  console.error('Error fetching bot response:', error);

  if (retryCount < maxRetries) {
    retryCount++;
    console.warn(`Retrying... (${retryCount}/${maxRetries})`);
    setTimeout(() => fetchResponseFromAPI(userMessage), 2000); // Retry after 2 seconds
  } else {
    hideLoader(); // Remove the loader if an error occurs
    appendMessage("Sorry, I'm having trouble connecting right now. Please try again later.", "received");
    isRunning = false; // Allow further messages
    retryCount = 0; // Reset retry count after max retries
  }
}

/**
 * Handles generic errors and logs them.
 * @param {string} message - A custom message for the error context.
 * @param {Error} error - The error object.
 */
function handleError(message, error) {
  console.error(`${message}:`, error);
  appendMessage("An unexpected error occurred. Please try again later.", "received");
}

/**
 * Adds a message to the chatbox.
 * @param {string} msg - The message content.
 * @param {string} type - The message type ('sent' or 'received').
 * @param {boolean} withLoader - Whether to show the loader before the message.
 */
function appendMessage(msg, type, withLoader = true) {
  const messageBox = document.getElementById("message-box");
  const div = document.createElement("div");
  div.className = "chat-message-div";

  // Add avatar for 'received' messages (bot messages)
  const avatarHTML = type === "received" ? `<div class="avatar"><img src="${botAvatar}" alt="Bot Avatar" class="avatar-img"></div>` : ''; 

  div.innerHTML = `
    ${avatarHTML}
    <div class="chat-message-${type}">${msg}</div>
  `;

  messageBox.appendChild(div);
  messageBox.scrollTop = messageBox.scrollHeight; // Scroll to the newest message
  if (type === "sent") document.getElementById("message").value = ""; // Clear the input field after sending

  // Show loader if it's a bot message
  if (withLoader && type === "received") showLoader();
}

/**
 * Shows the loader (loading dots) in the chatbox.
 */
function showLoader() {
  try {
    const loaderDiv = createLoader(); // Create loader element
    document.getElementById("message-box").appendChild(loaderDiv);
    document.getElementById("message-box").scrollTop = document.getElementById("message-box").scrollHeight; // Scroll to show the loader
  } catch (error) {
    handleError('Error showing loader', error);
  }
}

/**
 * Replaces the loader with a message in the chatbox.
 * @param {string} msg - The message content to display.
 */
function replaceLoaderWithMessage(msg) {
  const loaderDiv = document.querySelector(".chat-message-div.loader");
  if (loaderDiv) {
    loaderDiv.style.animation = "fadeOut 0.5s forwards"; // Fade out the loader
    setTimeout(() => {
      try {
        loaderDiv.classList.remove('loader');
        loaderDiv.innerHTML = `
          <div class="avatar"><img src="${botAvatar}" alt="Bot Avatar" class="avatar-img"></div>
          <div class="chat-message-received">${msg}</div>
        `;
        loaderDiv.style.animation = "fadeIn 0.5s forwards"; // Fade in the new message
        document.getElementById("message-box").scrollTop = document.getElementById("message-box").scrollHeight; // Scroll to show the new message
      } catch (error) {
        handleError('Error replacing loader with message', error);
      }
    }, 500); // Matches the fadeOut duration
  } else {
    console.error('Loader not found when attempting to replace with message.');
  }
}

/**
 * Creates a loader element for the chat.
 * @returns {HTMLDivElement} The loader element.
 */
function createLoader() {
  try {
    const loaderDiv = document.createElement("div");
    loaderDiv.className = "chat-message-div loader"; // Add 'loader' class for targeting
    loaderDiv.innerHTML = `
      <div class="avatar"><img src="${botAvatar}" alt="Bot Avatar" class="avatar-img"></div>
      <div class="chat-message-received">
        <span class="loader">
          <span class="loader__dot"></span>
          <span class="loader__dot"></span>
          <span class="loader__dot"></span>
        </span>
      </div>`;
    return loaderDiv; // Return the loader element
  } catch (error) {
    handleError('Error creating loader', error);
    return null;
  }
}

/**
 * Resets the idle timer and sets up proactive engagement.
 */
function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    showProactiveMessage("Are you still there? Let me know if you need any help!");
  }, idleTimeout);
}

/**
 * Shows a proactive message after detecting user inactivity.
 * @param {string} message - The proactive message to display.
 */
function showProactiveMessage(message) {
  appendMessage(message, "received", false);
}