class Chatbot {
    constructor() {
        this.botLoadingDelay = 3000;
        this.initialGreeting = vacw_settings.bot_greeting || "Hi! How can I assist you today?";
        this.botAvatar = vacw_settings.avatar_url || "https://res.cloudinary.com/dzpafdvkm/image/upload/v1725329022/Portfolio/logos/drupal.svg";
        this.isRunning = false;
        this.session_id = this.getStoredSession() || this.initializeSession();
        this.setupEventListeners();
        this.userMessage = "";  // Store user's message
        this.botMessage = "";   // Store bot's response
    }

    // Event listeners for key interactions
    setupEventListeners() {
        document.getElementById("message").addEventListener("keyup", this.handleKeyUp.bind(this));
        document.getElementById("chatbot_toggle").onclick = this.toggleChatbot.bind(this);
        document.querySelector(".input-send").onclick = this.sendMessage.bind(this);
    }

    // Handle the "Enter" key press event in the message input field
    handleKeyUp(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            this.sendMessage();
        }
    }

    // Toggle the chatbot open/close state
    toggleChatbot() {
        const chatbot = document.getElementById("chatbot");
        const toggleButton = document.getElementById("chatbot_toggle");

        // Check if the chatbot is currently collapsed
        if (chatbot.classList.contains("collapsed")) {
            chatbot.classList.remove("collapsed");
            toggleButton.children[0].style.display = "none"; // Hide open icon
            toggleButton.children[1].style.display = "";      // Show close icon
            // Display the initial greeting after a short delay
            setTimeout(() => this.appendMessage(this.initialGreeting, "received", false), 1000);
        } else {
            // Collapse the chatbot and revert the icons
            chatbot.classList.add("collapsed");
            toggleButton.children[0].style.display = "";
            toggleButton.children[1].style.display = "none";
        }
    }

    // Function to send the user's message to the chatbot
    async sendMessage() {
        // Prevent sending multiple messages simultaneously
        if (this.isRunning) return;

        // Get the user's message from the input field
        this.userMessage = document.getElementById("message").value.trim();
        if (!this.userMessage) return;  // Do not send empty messages

        // Set running flag to prevent additional messages while processing
        this.isRunning = true;

        // Append the user's message to the chatbox
        this.appendMessage(this.userMessage, "sent");

        // Show a loading indicator while waiting for the bot's response
        this.appendLoader();

        // Get the bot's response by sending the message to the backend
        this.botMessage = await this.getBotResponse(this.userMessage);

        // Display the bot's response
        this.displayBotResponse();
    }

    // Function to retrieve the bot's response from the backend
    async getBotResponse(userMessage) {
        try {
            // Call the backend to get the bot's response via Agentive API
            const response = await axios.post(vacw_settings.ajax_url, {
                action: 'vacw_get_bot_response',   // Specify the backend action to call
                session_id: this.session_id,        // Send the session ID
                message: userMessage,               // Send the user's message
                security: vacw_settings.security    // Include nonce for security
            });

            // Extract the bot's response from the backend's response
            const botReply = response.data.data.content;
            this.removeLoader();  // Remove the loading indicator
            return botReply;

        } catch (error) {
            // Log the error and display a fallback message in case of failure
            console.error("Error getting bot response:", error);
            this.removeLoader(); // Ensure the loader is removed even if there's an error
            return "There was an error processing your message. Please try again later.";  // Return an error message
        }
    }

    // Function to display the bot's response in the chatbox
    displayBotResponse() {
        this.appendMessage(this.botMessage, "received");  // Append the bot's response to the chatbox
        this.isRunning = false;  // Reset running flag to allow new messages
    }

    // Append the user's or bot's message to the chat interface
    appendMessage(msg, type) {
        const messageBox = document.getElementById("message-box");  // Get the chatbox container
        const div = document.createElement("div");                  // Create a new div to hold the message
        div.className = "chat-message-div";                         // Assign a class for styling

        // If the message is received from the bot, display the bot's avatar
        if (type === "received") {
            const avatarDiv = document.createElement("div");
            avatarDiv.className = "avatar";
            const avatarImg = document.createElement("img");
            avatarImg.src = this.botAvatar;
            avatarImg.alt = "Bot Avatar";
            avatarImg.className = "avatar-img";
            avatarDiv.appendChild(avatarImg);
            div.appendChild(avatarDiv);
        }

        // Create the message container and set the message content
        const messageDiv = document.createElement("div");
        messageDiv.className = `chat-message-${type}`;  // Assign a class for sent/received messages
        messageDiv.textContent = msg;                   // Set the message text content
        messageDiv.style.opacity = "0";                 // Set initial opacity for fade-in effect
        div.appendChild(messageDiv);                    // Append the message to the div

        // Append the message div to the chatbox
        messageBox.appendChild(div);
        messageBox.scrollTop = messageBox.scrollHeight;  // Scroll to the newest message

        // Apply a fade-in effect to the message
        setTimeout(() => {
            messageDiv.style.opacity = "1";  // Fade in the message
        }, 50);  // Small delay to trigger the transition

        // If the message was sent by the user, clear the input field after sending
        if (type === "sent") {
            document.getElementById("message").value = "";  // Clear the input field
        }
    }

    // Append a loading indicator (3 dots) while waiting for the bot's response
    appendLoader() {
        const messageBox = document.getElementById("message-box");
        const div = document.createElement("div");  // Create a container div for the message
        div.className = "chat-message-div";

        // Create an avatar section for the bot
        const avatarDiv = document.createElement("div");
        avatarDiv.className = "avatar";
        const avatarImg = document.createElement("img");
        avatarImg.src = this.botAvatar;
        avatarImg.alt = "Bot Avatar";
        avatarImg.className = "avatar-img";
        avatarDiv.appendChild(avatarImg);

        // Create the loader (three dots animation)
        const loaderMessageDiv = document.createElement("div");
        loaderMessageDiv.className = "chat-message-received";
        loaderMessageDiv.innerHTML = `
            <span class="loader">
                <span class="loader__dot"></span>
                <span class="loader__dot"></span>
                <span class="loader__dot"></span>
            </span>`;

        // Append avatar and loader to the message container
        div.appendChild(avatarDiv);
        div.appendChild(loaderMessageDiv);

        // Append the entire message container to the chatbox
        messageBox.appendChild(div);
        messageBox.scrollTop = messageBox.scrollHeight;  // Scroll to the newest message
    }

    // Remove the loading indicator when the bot's response is received
    removeLoader() {
        const loaderDiv = document.querySelector(".chat-message-received .loader");
        if (loaderDiv) {
            const parentDiv = loaderDiv.closest(".chat-message-div");
            parentDiv.remove();  // Remove the loader element from the chatbox
        }
    }

    // Store the session ID in localStorage for persistence
    storeSession(sessionId) {
        const sessionData = {
            session_id: sessionId,
            timestamp: Date.now()   // Store the current timestamp to manage session expiration
        };
        localStorage.setItem("session_data", JSON.stringify(sessionData));  // Save the session data in localStorage
    }

    // Retrieve the stored session from localStorage if available and valid (within 30 minutes)
    getStoredSession() {
        const sessionData = localStorage.getItem("session_data");  // Get the session data from localStorage

        if (sessionData) {
            const parsedData = JSON.parse(sessionData);
            const now = Date.now();

            // Check if the stored session is still valid (less than 30 minutes old)
            if (now - parsedData.timestamp < 1800000) {
                return parsedData.session_id;
            } else {
                // Clear session if expired
                this.clearStoredSession();
            }
        }
        return null;   // Return null if no valid session is found
    }

    // Clear the session from localStorage when it expires or is no longer needed
    clearStoredSession() {
        localStorage.removeItem("session_data");  // Remove the session data from localStorage
    }
}

// Initialize the chatbot when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new Chatbot();
});