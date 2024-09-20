class Chatbot {
    constructor() {
        this.botLoadingDelay = 3000;
        this.initialGreeting = "Hi! How can I assist you today?";
        this.botAvatar = "https://res.cloudinary.com/dzpafdvkm/image/upload/v1725329022/Portfolio/logos/drupal.svg";
        this.isRunning = false;
        this.session_id = this.getStoredSession() || this.initializeSession();
        this.setupEventListeners();
        this.userMessage = "";  // Store user's message
        this.botMessage = "";   // Store bot's response
    }

    setupEventListeners() {
        document.getElementById("message").addEventListener("keyup", this.handleKeyUp.bind(this));
        document.getElementById("chatbot_toggle").onclick = this.toggleChatbot.bind(this);
        document.querySelector(".input-send").onclick = this.sendMessage.bind(this);
    }

    handleKeyUp(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            this.sendMessage();
        }
    }

    toggleChatbot() {
        const chatbot = document.getElementById("chatbot");
        const toggleButton = document.getElementById("chatbot_toggle");

        if (chatbot.classList.contains("collapsed")) {
            chatbot.classList.remove("collapsed");
            toggleButton.children[0].style.display = "none";
            toggleButton.children[1].style.display = "";
            setTimeout(() => this.appendMessage(this.initialGreeting, "received", false), 1000);
        } else {
            chatbot.classList.add("collapsed");
            toggleButton.children[0].style.display = "";
            toggleButton.children[1].style.display = "none";
        }
    }

    async sendMessage() {
        if (this.isRunning) return;

        this.userMessage = document.getElementById("message").value.trim();  // Store user's message
        if (!this.userMessage) return;

        this.isRunning = true;
        this.appendMessage(this.userMessage, "sent");

        // Append loader as part of the chat message
        this.appendLoader();

        // Fetch the bot's message and store it in botMessage
        this.botMessage = await this.getBotResponse(this.userMessage);

        // Call function to display the bot's response immediately without delay
        this.displayBotResponse();
    }

    getStoredSession() {
        return localStorage.getItem("session_id");
    }

    storeSession(sessionId) {
        localStorage.setItem("session_id", sessionId);
    }

    clearStoredSession() {
        localStorage.removeItem("session_id");
    }

    async initializeSession() {
        try {
            const response = await axios.post('https://agentivehub.com/api/chat/session', {
                api_key: "664c990c-f470-4c0f-a67c-98056db461ae",
                assistant_id: "66ca9fa5-d934-4cf5-8dde-c73173b1a0cc"
            });
            const sessionId = response.data.session_id;
            this.storeSession(sessionId);
            return sessionId;
        } catch (error) {
            // console.error("Error initializing session:", error);
            this.appendMessage(`Error initializing session: ${error}`, "received");
            // this.appendMessage("Error initializing chat session. Please try again later.", "received");
        }
    }

    // Append loader (3 dots) with the bot avatar next to it
    appendLoader() {
        const messageBox = document.getElementById("message-box");
        const div = document.createElement("div");  // Create a chat message div
        div.className = "chat-message-div";         // Use the same class for messages

        // Create the avatar section
        const avatarDiv = document.createElement("div");
        avatarDiv.className = "avatar";
        const avatarImg = document.createElement("img");
        avatarImg.src = this.botAvatar;
        avatarImg.alt = "Bot Avatar";
        avatarImg.className = "avatar-img";
        avatarDiv.appendChild(avatarImg);

        // Create loader message structure
        const loaderMessageDiv = document.createElement("div");
        loaderMessageDiv.className = "chat-message-received"; // Same styling as bot's message

        // Set up the loader content (3 dots)
        loaderMessageDiv.innerHTML = `
            <span class="loader">
                <span class="loader__dot"></span>
                <span class="loader__dot"></span>
                <span class="loader__dot"></span>
            </span>`;

        // Append avatar and loader to the chat message div
        div.appendChild(avatarDiv);
        div.appendChild(loaderMessageDiv);

        messageBox.appendChild(div);  // Append the message to the chatbox
        messageBox.scrollTop = messageBox.scrollHeight;  // Scroll to the bottom
    }

    // Remove the loader after bot response is received
    removeLoader() {
        const loaderDiv = document.querySelector(".chat-message-received .loader"); // Find loader in the message

        if (loaderDiv) {
            const parentDiv = loaderDiv.closest(".chat-message-div"); // Get parent message div
            parentDiv.remove(); // Remove the entire message div containing the loader
        }
    }

    // Append message to chatbox
    appendMessage(msg, type, withLoader = true) {
        const messageBox = document.getElementById("message-box");
        const div = document.createElement("div");
        div.className = "chat-message-div";

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

        const messageDiv = document.createElement("div");
        messageDiv.className = `chat-message-${type}`;
        messageDiv.textContent = msg;
        messageDiv.style.opacity = "0"; // Set initial opacity for fade-in
        div.appendChild(messageDiv);

        messageBox.appendChild(div);
        messageBox.scrollTop = messageBox.scrollHeight; // Scroll to the newest message

        // Apply fade-in effect for the message
        setTimeout(() => {
            messageDiv.style.opacity = "1"; // Fade-in effect
        }, 50); // Short delay to trigger transition

        if (type === "sent") {
            document.getElementById("message").value = ""; // Clear input field after sending
        }
    }

    // Retrieve bot response and return it to the sendMessage function
    async getBotResponse(userMessage) {
        try {
            console.log(`Session ID: ${this.session_id}`);
            const response = await axios.post('https://agentivehub.com/api/chat', {
 api_key: "664c990c-f470-4c0f-a67c-98056db461ae",
 session_id: this.session_id,
 type: 'custom_code',
 assistant_id: "66ca9fa5-d934-4cf5-8dde-c73173b1a0cc",
 messages:[{ role: 'user',  content: userMessage  }],
 });
console.log(`Chat response: ${JSON.stringify(response.data.content)}`);

            const botReply = response.data.content;
            this.removeLoader();  // Remove loader once bot response is retrieved
            return botReply;      // Return the bot's response to be displayed

        } catch (error) {
            console.error("Error getting bot response:", error);
            this.removeLoader(); // Remove loader even if there's an error
            return "There was an error processing your message. Please try again later.";  // Return error message
        }
    }

    // Display the bot's response immediately after retrieval
    displayBotResponse() {
        this.appendMessage(this.botMessage, "received"); // Append the bot's message to chat
        this.isRunning = false;  // Reset the running status to allow new messages
    }
}

// Initialize the chatbot when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new Chatbot();
}); 