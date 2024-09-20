class Chatbot {
    constructor() {
        this.botLoadingDelay = 3000;  // Time delay for showing the bot's responses (in milliseconds)
        this.initialGreeting = vacw_settings.bot_greeting || "Hi! How can I assist you today?";  // Greeting message for the bot
        this.botAvatar = vacw_settings.avatar_url || "https://res.cloudinary.com/dzpafdvkm/image/upload/v1725329022/Portfolio/logos/drupal.svg";  // Bot's avatar image
        this.isRunning = false;  // Flag to prevent multiple messages being sent at once
        this.session_id = this.getStoredSession() || this.initializeSession();  // Retrieve session ID from local storage or create a new session
        this.setupEventListeners();  // Setup event listeners for user interactions
        this.userMessage = "";  // Store the user's message
        this.botMessage = "";   // Store the bot's response
    }

    // Set up event listeners for user actions (message input and chatbot toggle)
    setupEventListeners() {
        document.getElementById("message").addEventListener("keyup", this.handleKeyUp.bind(this));  // Listen for "Enter" key press
        document.getElementById("chatbot_toggle").onclick = this.toggleChatbot.bind(this);  // Listen for chatbot toggle click
        document.querySelector(".input-send").onclick = this.sendMessage.bind(this);  // Listen for the send button click
    }

    // Handle "Enter" key event in the message input field
    handleKeyUp(event) {
        if (event.key === "Enter") {
            event.preventDefault();  // Prevent form submission on "Enter" press
            this.sendMessage();  // Trigger send message
        }
    }

    // Function to toggle the chatbot's visibility (open/close)
    toggleChatbot() {
        const chatbot = document.getElementById("chatbot");
        const toggleButton = document.getElementById("chatbot_toggle");

        // Toggle the chatbot's collapsed state and switch the button icons accordingly
        if (chatbot.classList.contains("collapsed")) {
            chatbot.classList.remove("collapsed");  // Open the chatbot
            toggleButton.children[0].style.display = "none";  // Hide open icon
            toggleButton.children[1].style.display = "";      // Show close icon
            // Display the initial greeting message with a delay
            setTimeout(() => this.appendMessage(this.initialGreeting, "received", false), 1000);
        } else {
            chatbot.classList.add("collapsed");  // Collapse the chatbot
            toggleButton.children[0].style.display = "";  // Show open icon
            toggleButton.children[1].style.display = "none";  // Hide close icon
        }
    }

    // Send the user's message to the chatbot and display bot's response
    async sendMessage() {
        if (this.isRunning) return;  // Prevent multiple messages being processed at the same time

        // Retrieve the user's input message and trim any extra spaces
        this.userMessage = document.getElementById("message").value.trim();
        if (!this.userMessage) return;  // Don't process if the message is empty

        this.isRunning = true;  // Set flag to indicate message is being processed

        this.appendMessage(this.userMessage, "sent");  // Display the user's message in the chat

        this.appendLoader();  // Show a loading animation while waiting for bot's response

        this.botMessage = await this.getBotResponse(this.userMessage);  // Get the bot's response from the backend

        this.displayBotResponse();  // Display the bot's response in the chat
    }

    // Retrieve the bot's response from the backend
    async getBotResponse(userMessage) {
        try {
            // Send the user's message and session ID to the backend for processing
            const response = await axios.post(vacw_settings.ajax_url, {
                action: 'vacw_get_bot_response',   // The WordPress AJAX action to call
                session_id: this.session_id,       // Include the session ID
                message: userMessage,              // Include the user's message
                security: vacw_settings.security   // Security nonce for the AJAX request
            });

            const botReply = response.data.data.content;  // Get the bot's reply content from the response
            this.removeLoader();  // Remove the loading indicator once the response is received
            return botReply;  // Return the bot's response for display

        } catch (error) {
            console.error("Error getting bot response:", error);  // Log the error if the request fails
            this.removeLoader();  // Ensure the loader is removed even if there's an error
            return "There was an error processing your message. Please try again later.";  // Display fallback error message
        }
    }

    // Display the bot's response in the chat window
    displayBotResponse() {
        this.appendMessage(this.botMessage, "received");  // Display the bot's response as a received message
        this.isRunning = false;  // Reset flag to allow new messages to be processed
    }

    // Function to append the user's or bot's message to the chatbox
    appendMessage(msg, type) {
        const messageBox = document.getElementById("message-box");  // Get the chatbox container
        const div = document.createElement("div");  // Create a new div to hold the message
        div.className = "chat-message-div";  // Assign a class for styling the message div

        // If the message is from the bot, display the bot's avatar
        if (type === "received") {
            const avatarDiv = document.createElement("div");
            avatarDiv.className = "avatar";  // Avatar container class
            const avatarImg = document.createElement("img");
            avatarImg.src = this.botAvatar;  // Bot's avatar image URL
            avatarImg.alt = "Bot Avatar";  // Accessibility alt text
            avatarImg.className = "avatar-img";  // Avatar image class
            avatarDiv.appendChild(avatarImg);  // Append the image to the avatar container
            div.appendChild(avatarDiv);  // Append the avatar to the message div
        }

        // Create a message container and set the message content
        const messageDiv = document.createElement("div");
        messageDiv.className = `chat-message-${type}`;  // Class for sent/received message
        messageDiv.textContent = msg;  // Set the message text
        messageDiv.style.opacity = "0";  // Set initial opacity for fade-in effect
        div.appendChild(messageDiv);  // Append the message container to the div

        // Append the message div to the chatbox
        messageBox.appendChild(div);
        messageBox.scrollTop = messageBox.scrollHeight;  // Scroll to the latest message

        // Apply a fade-in effect for the message
        setTimeout(() => {
            messageDiv.style.opacity = "1";  // Fade in the message
        }, 50);  // Short delay to trigger the transition

        // Clear the message input field if it's a sent message
        if (type === "sent") {
            document.getElementById("message").value = "";  // Clear the input field
        }
    }

    // Append a loading animation (3 dots) while waiting for the bot's response
    appendLoader() {
        const messageBox = document.getElementById("message-box");
        const div = document.createElement("div");  // Create a new container div for the loading animation
        div.className = "chat-message-div";  // Assign a class for the loading message container

        // Create the avatar for the loading message
        const avatarDiv = document.createElement("div");
        avatarDiv.className = "avatar";  // Avatar container class
        const avatarImg = document.createElement("img");
        avatarImg.src = this.botAvatar;  // Bot's avatar URL
        avatarImg.alt = "Bot Avatar";  // Accessibility alt text for the avatar
        avatarImg.className = "avatar-img";  // Avatar image class
        avatarDiv.appendChild(avatarImg);  // Append the avatar image to the container

        // Create the loading animation structure (3 dots)
        const loaderMessageDiv = document.createElement("div");
        loaderMessageDiv.className = "chat-message-received";  // Same styling as bot's message
        loaderMessageDiv.innerHTML = `
            <span class="loader">
                <span class="loader__dot"></span>
                <span class="loader__dot"></span>
                <span class="loader__dot"></span>
            </span>`;  // Create the 3-dot loading animation

        // Append the avatar and the loader to the message div
        div.appendChild(avatarDiv);
        div.appendChild(loaderMessageDiv);

        // Append the loading message to the chatbox
        messageBox.appendChild(div);
        messageBox.scrollTop = messageBox.scrollHeight;  // Scroll to the latest message
    }

    // Remove the loading indicator after receiving the bot's response
    removeLoader() {
        const loaderDiv = document.querySelector(".chat-message-received .loader");  // Find the loader in the message
        if (loaderDiv) {
            const parentDiv = loaderDiv.closest(".chat-message-div");  // Get the parent message div containing the loader
            parentDiv.remove();  // Remove the loader and the message div
        }
    }

    // Store the session ID in localStorage for persistence
    storeSession(sessionId) {
        const sessionData = {
            session_id: sessionId,  // Store the session ID
            timestamp: Date.now()   // Store the current timestamp to track session expiration
        };
        localStorage.setItem("session_data", JSON.stringify(sessionData));  // Save the session data in localStorage
    }

    // Retrieve the stored session from localStorage if available and valid (within 30 minutes)
    getStoredSession() {
        const sessionData = localStorage.getItem("session_data");  // Retrieve the session data from localStorage

        if (sessionData) {
            const parsedData = JSON.parse(sessionData);
            const now = Date.now();

            // Check if the session is still valid (i.e., less than 30 minutes old)
            if (now - parsedData.timestamp < 1800000) {
                return parsedData.session_id;  // Return the session ID if still valid
            } else {
                // Clear the session if it has expired
                this.clearStoredSession();
            }
        }
        return null;  // Return null if no valid session is found
    }

    // Clear the session data from localStorage when it's expired or no longer needed
    clearStoredSession() {
        localStorage.removeItem("session_data");  // Remove the session data from localStorage
    }

// Initialize the session by contacting the backend for a new session ID
async initializeSession() {
    try {
        // Call the backend to initialize a new session
        const response = await axios.post(vacw_settings.ajax_url, {
            action: 'vacw_initialize_session',   // Specify the backend action to initialize session
            security: vacw_settings.security     // Include security nonce for the request
        });

        // Extract the session ID from the server's response
        const sessionId = response.data.session_id;  // Ensure that the session ID is correctly accessed

        console.log(`Session ID: ${sessionId}`);  // Corrected variable reference

        // Store the new session ID in localStorage
        this.storeSession(sessionId);
        return sessionId;

    } catch (error) {
        // Enhanced error handling
        if (error.response) {
            // Server responded with a status other than 2xx
            this.appendMessage(`Error initializing session: ${error.response.data.message || error.response.data}`, "received");
        } else if (error.request) {
            // Request was made but no response received
            this.appendMessage('Error initializing session: No response from server', "received");
        } else {
            // Other errors (e.g., setup issues)
            this.appendMessage(`Error initializing session: ${error.message}`, "received");
        }
    }
}

// Initialize the chatbot when the page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    new Chatbot();  // Create a new instance of the Chatbot class
});