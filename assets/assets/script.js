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
        const sessionData = localStorage.getItem("session_data");
        if (sessionData) {
            const parsedData = JSON.parse(sessionData);
            const now = Date.now();
            // Expire session after 30 minutes
            if (now - parsedData.timestamp < 1800000) {
                return parsedData.session_id;
            } else {
                this.clearStoredSession();
            }
        }
        return null;
    }

    storeSession(sessionId) {
        const sessionData = {
            session_id: sessionId,
            timestamp: Date.now()
        };
        localStorage.setItem("session_data", JSON.stringify(sessionData));
    }

    clearStoredSession() {
        localStorage.removeItem("session_data");
    }

    async initializeSession() {
        try {
            const response = await axios.post(vacw_settings.ajax_url, {
                action: 'vacw_api_proxy',
                query: 'initialize_session',
                lang: 'en',
                security: vacw_settings.security
            });

            const sessionId = response.data.session_id;
            this.storeSession(sessionId);
            return sessionId;
        } catch (error) {
            this.appendMessage(`Error initializing session: ${error}`, "received");
        }
    }

    appendLoader() {
        const messageBox = document.getElementById("message-box");
        const div = document.createElement("div");
        div.className = "chat-message-div";

        const avatarDiv = document.createElement("div");
        avatarDiv.className = "avatar";
        const avatarImg = document.createElement("img");
        avatarImg.src = this.botAvatar;
        avatarImg.alt = "Bot Avatar";
        avatarImg.className = "avatar-img";
        avatarDiv.appendChild(avatarImg);

        const loaderMessageDiv = document.createElement("div");
        loaderMessageDiv.className = "chat-message-received";
        loaderMessageDiv.innerHTML = `
            <span class="loader">
                <span class="loader__dot"></span>
                <span class="loader__dot"></span>
                <span class="loader__dot"></span>
            </span>`;

        div.appendChild(avatarDiv);
        div.appendChild(loaderMessageDiv);
        messageBox.appendChild(div);
        messageBox.scrollTop = messageBox.scrollHeight;
    }

    removeLoader() {
        const loaderDiv = document.querySelector(".chat-message-received .loader");
        if (loaderDiv) {
            const parentDiv = loaderDiv.closest(".chat-message-div");
            parentDiv.remove();
        }
    }

    appendMessage(msg, type) {
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
            this.removeLoader();
            return botReply;
        } catch (error) {
            console.error("Error getting bot response:", error);
            this.removeLoader();
            return "There was an error processing your message. Please try again later.";
        }
    }

    displayBotResponse() {
        this.appendMessage(this.botMessage, "received");
        this.isRunning = false;
    }
}

// Initialize the chatbot when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new Chatbot();
});