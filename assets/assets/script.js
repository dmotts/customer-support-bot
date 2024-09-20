class Chatbot {
    // Constructor to initialize the chatbot
    constructor() {
        // Time delay for loading the bot's responses (in milliseconds)
        this.botLoadingDelay = 3000;

        // The initial greeting message when the chatbot opens
        this.initialGreeting = vacw_settings.bot_greeting || "Hi! How can I assist you today?";

        // URL of the bot's avatar, which can be customized via the plugin settings
        this.botAvatar = vacw_settings.avatar_url || "https://res.cloudinary.com/dzpafdvkm/image/upload/v1725329022/Portfolio/logos/drupal.svg";

        // Boolean flag to prevent multiple simultaneous message submissions
        this.isRunning = false;

        // Retrieve the session ID from localStorage or initialize a new session if not found
        this.session_id = this.getStoredSession() || this.initializeSession();

        // Set up the event listeners for the chatbot's interface elements
        this.setupEventListeners();

        // Variables to store the user's and bot's messages
        this.userMessage = "";
        this.botMessage = "";
    }

    // Set up event listeners for user interactions (input field and toggle button)
    setupEventListeners() {
        document.getElementById("message").addEventListener("keyup", this.handleKeyUp.bind(this));
        document.getElementById("chatbot_toggle").onclick = this.toggleChatbot.bind(this);
        document.querySelector(".input-send").onclick = this.sendMessage.bind(this);
    }

    // Handle the "Enter" keypress to submit the message
    handleKeyUp(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            this.sendMessage();
        }
    }

    // Function to toggle the chatbot visibility (open/close the chatbot window)
    toggleChatbot() {
        const chatbot = document.getElementById("chatbot");
        const toggleButton = document.getElementById("chatbot_toggle");

        // Check if the chatbot is currently collapsed
        if (chatbot.classList.contains("collapsed")) {
            chatbot.classList.remove("collapsed");
            toggleButton.children[0].style.display = "none"; // Hide the open icon
            toggleButton.children[1].style.display = "";      // Show the close icon
            // Display the initial greeting after a short delay
            setTimeout(() => this.appendMessage(this.initialGreeting, "received", false), 1000);
        } else {
            // Collapse the chatbot and revert the icons
            chatbot.classList.add("collapsed");
            toggleButton.children[0].style.display = "";
            toggleButton.children[1].style.display = "none";
        }
    }

    // Send the user's message to the chatbot
    async sendMessage() {
        // Prevent sending messages while another message is being processed
        if (this.isRunning) return;

        // Retrieve and sanitize the user's message input
        this.userMessage = document.getElementById("message").value.trim();
        if (!this.userMessage) return;

        // Set flag to prevent additional messages being sent simultaneously
        this.isRunning = true;

        // Display the user's message in the chat window
        this.appendMessage(this.userMessage, "sent");

        // Display a loading animation while waiting for the bot's response
        this.appendLoader();

        // Fetch the bot's response using the OpenAI API
        this.botMessage = await this.getBotResponse(this.userMessage);

        // Display the bot's response immediately
        this.displayBotResponse();
    }

    // Retrieve session data from localStorage
    getStoredSession() {
        const sessionData = localStorage.getItem("session_data");
        if (sessionData) {
            const parsedData = JSON.parse(sessionData);
            const now = Date.now();
            // Expire session if 30 minutes have passed since it was stored
            if (now - parsedData.timestamp < 1800000) {
                return parsedData.session_id;
            } else {
                this.clearStoredSession();
            }
        }
        return null;
    }

    // Store the session data (session ID and timestamp) in localStorage
    storeSession(sessionId) {
        const sessionData = {
            session_id: sessionId,
            timestamp: Date.now()
        };
        localStorage.setItem("session_data", JSON.stringify(sessionData));
    }

    // Clear session data from localStorage
    clearStoredSession() {
        localStorage.removeItem("session_data");
    }

    // Initialize a new chat session by sending a request to the API
    async initializeSession() {
        try {
            const response = await axios.post(vacw_settings.ajax_url, {
                action: 'vacw_api_proxy',
                query: 'initialize_session',
                lang: 'en',
                security: vacw_settings.security
            });

            // Store the new session ID
            const sessionId = response.data.session_id;
            this.storeSession(sessionId);
            return sessionId;
        } catch (error) {
            this.appendMessage(`Error initializing session: ${error}`, "received");
        }
    }

    // Display a loading indicator (3 dots) while waiting for the bot's response
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

    // Remove the loading indicator when the bot response is received
    removeLoader() {
        const loaderDiv = document.querySelector(".chat-message-received .loader");
        if (loaderDiv) {
            const parentDiv = loaderDiv.closest(".chat-message-div");
            parentDiv.remove();
        }
    }

    // Append a message (sent by user or received from bot) to the chatbox
    appendMessage(msg, type) {
        const messageBox = document.getElementById("message-box");
        const div = document.createElement("div");
        div.className = "chat-message-div";

        // If the message is from the bot, include the bot's avatar
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

        // Create the message element with the content
        const messageDiv = document.createElement("div");
        messageDiv.className = `chat-message-${type}`;
        messageDiv.textContent = msg;
        messageDiv.style.opacity = "0"; // Set initial opacity for fade-in effect
        div.appendChild(messageDiv);

        // Append the message container to the chatbox
        messageBox.appendChild(div);
        messageBox.scrollTop = messageBox.scrollHeight; // Scroll to the newest message

        // Apply fade-in effect for the message
        setTimeout(() => {
            messageDiv.style.opacity = "1"; // Fade-in effect
        }, 50); // Short delay to trigger the transition

        // Clear the input field after sending a message
        if (type === "sent") {
            document.getElementById("message").value = "";
        }
    }

    // Retrieve the bot's response via the OpenAI API
    async getBotResponse(userMessage) {
        try {
            const response = await axios.post(vacw_settings.ajax_url, {
                action: 'vacw_api_proxy',
                query: userMessage,
                lang: 'en',
                sessionId: this.session_id,
                security: vacw_settings.security
            });

            const botReply = response.data.data.content;
            this.removeLoader();  // Remove loader once response is received
            return botReply;
        } catch (error) {
            console.error("Error getting bot response:", error);
            this.removeLoader(); // Remove loader even if there's an error
            return "There was an error processing your message. Please try again later.";
        }
    }

    // Display the bot's response after it is received
    displayBotResponse() {
        this.appendMessage(this.botMessage, "received"); // Append the bot's message to chatbox
        this.isRunning = false;  // Reset the running status to allow new messages
    }
}

// Initialize the chatbot when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new Chatbot();
});