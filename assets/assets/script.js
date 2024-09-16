const botLoadingDelay = 3000; // Default delay for loader (3 seconds)
const botReplyDelay = 2000;   // Default delay before showing loader (2 seconds)
const apiUrl = ""; // API URL for fetching responses; leave empty to use default functionality
const initialGreeting = "Hi! How can I assist you today?"; // Initial greeting message
const botAvatar = "https://res.cloudinary.com/dzpafdvkm/image/upload/v1725329022/Portfolio/logos/drupal.svg"; // Default bot avatar
let isRunning = false; // State to prevent multiple simultaneous messages

// Event listeners for user input and chatbot toggle
document.getElementById("message").addEventListener("keyup", handleKeyUp);
document.getElementById("chatbot_toggle").onclick = toggleChatbot;
document.querySelector(".input-send").onclick = sendMessage; // Ensure the send button triggers sendMessage

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

  // Check if an API URL is defined, otherwise use simulated response
  if (apiUrl) {
    fetchResponseFromAPI(msg);
  } else {
    simulateBotResponse(msg);
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
    body: JSON.stringify({ message: userMessage })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      const { botMessage, responseDelay } = data;
      // Replace loader with bot message after delay
      setTimeout(() => {
        replaceLoaderWithMessage(botMessage);
        isRunning = false; // Allow further messages
      }, responseDelay || botLoadingDelay);
    })
    .catch(error => {
      console.error('Error fetching bot response:', error);
      hideLoader(); // Remove the loader if an error occurs
      appendMessage("Sorry, I encountered an error. Please try again.", "received");
      isRunning = false; // Allow further messages
    });
}

/**
 * Simulates bot response for fallback behavior.
 * Mirrors the user's message.
 * @param {string} userMessage - The message sent by the user.
 */
function simulateBotResponse(userMessage) {
  // Show loader after a delay
  setTimeout(() => {
    showLoader();
    // Replace loader with mirrored bot message
    setTimeout(() => {
      replaceLoaderWithMessage(userMessage); // Bot mirrors the user's message
      isRunning = false; // Allow further messages
    }, botLoadingDelay);
  }, botReplyDelay);
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
  const loaderDiv = createLoader(); // Create loader element
  document.getElementById("message-box").appendChild(loaderDiv);
  document.getElementById("message-box").scrollTop = document.getElementById("message-box").scrollHeight; // Scroll to show the loader
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
      loaderDiv.classList.remove('loader');
      loaderDiv.innerHTML = `
        <div class="avatar"><img src="${botAvatar}" alt="Bot Avatar" class="avatar-img"></div>
        <div class="chat-message-received">${msg}</div>
      `;
      loaderDiv.style.animation = "fadeIn 0.5s forwards"; // Fade in the new message
      document.getElementById("message-box").scrollTop = document.getElementById("message-box").scrollHeight; // Scroll to show the new message
    }, 500); // Matches the fadeOut duration
  }
}

/**
 * Creates a loader element for the chat.
 * @returns {HTMLDivElement} The loader element.
 */
function createLoader() {
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
}