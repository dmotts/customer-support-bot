// Ensure that Axios is loaded (you may need to include it in your HTML or enqueue it in WordPress)
if (typeof axios === 'undefined') {
    console.error('Axios is not loaded. Please make sure Axios is included.');
}

class Chatbot {
    constructor() {
        // Retrieve settings from the localized script data
        this.botAvatar = vacw_settings.avatar_url || 'default-avatar.png';
        this.botGreeting = vacw_settings.bot_greeting || 'Hi! How can I assist you today?';
        this.ajaxUrl = vacw_settings.ajax_url;
        this.securityNonce = vacw_settings.security;

        this.isRunning = false; // Flag to prevent multiple simultaneous requests
        this.setupEventListeners(); // Initialize event listeners
    }

    // Set up event listeners for user interactions
    setupEventListeners() {
        // Listen for the "Enter" key press in the message input field
        document.getElementById('message').addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.sendMessage(); // Trigger message send
            }
        });

        // Toggle chatbot open/close when the toggle button is clicked
        document.getElementById('chatbot_toggle').onclick = this.toggleChatbot.bind(this);

        // Send message when the send button is clicked
        document.querySelector('.input-send').onclick = this.sendMessage.bind(this);
    }

    // Toggle the chatbot visibility
    toggleChatbot() {
        const chatbot = document.getElementById('chatbot');
        const toggleButton = document.getElementById('chatbot_toggle');

        if (chatbot.classList.contains('collapsed')) {
            // Open the chatbot
            chatbot.classList.remove('collapsed');
            toggleButton.children[0].style.display = 'none'; // Hide open icon
            toggleButton.children[1].style.display = '';     // Show close icon

            // Display the bot's greeting message after a short delay
            setTimeout(() => this.appendMessage(this.botGreeting, 'received'), 1000);
        } else {
            // Close the chatbot
            chatbot.classList.add('collapsed');
            toggleButton.children[0].style.display = '';     // Show open icon
            toggleButton.children[1].style.display = 'none'; // Hide close icon
        }
    }

    // Send the user's message to the backend and display the bot's response
    async sendMessage() {
        if (this.isRunning) return; // Prevent multiple requests

        // Get the user's message and trim whitespace
        const userMessage = document.getElementById('message').value.trim();
        if (!userMessage) return; // Do nothing if message is empty

        this.isRunning = true; // Set the flag to indicate a request is in progress
        this.appendMessage(userMessage, 'sent'); // Display the user's message
        this.appendLoader(); // Show a loading indicator

        try {
            // Send the message to the backend via AJAX
            const response = await axios.post(this.ajaxUrl, {
                action: 'vacw_get_bot_response', // Backend action hook
                message: userMessage,            // User's message
                security: this.securityNonce     // Security nonce
            });

            this.removeLoader(); // Remove the loading indicator

            if (response.data.success) {
                // Display the bot's response
                this.appendMessage(response.data.data.content, 'received');
            } else {
                // Display an error message
                this.appendMessage('Sorry, there was an error processing your request.', 'received');
            }
        } catch (error) {
            // Handle any errors that occurred during the request
            console.error('Error:', error);
            this.removeLoader();
            this.appendMessage('Sorry, there was an error processing your request.', 'received');
        }

        this.isRunning = false; // Reset the flag
        document.getElementById('message').value = ''; // Clear the input field
    }

    // Append a message to the chat area
    appendMessage(msg, type) {
        const messageBox = document.getElementById('message-box');
        const div = document.createElement('div');
        div.className = 'chat-message-div';

        if (type === 'received') {
            // Add the bot's avatar for received messages
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = this.botAvatar;
            avatarImg.alt = 'Bot Avatar';
            avatarImg.className = 'avatar-img';
            avatarDiv.appendChild(avatarImg);
            div.appendChild(avatarDiv);
        }

        // Create the message bubble
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message-${type}`;
        messageDiv.textContent = msg;
        messageDiv.style.opacity = '0'; // For fade-in effect
        div.appendChild(messageDiv);

        // Append the message to the chat area
        messageBox.appendChild(div);
        messageBox.scrollTop = messageBox.scrollHeight; // Scroll to the bottom

        // Fade-in effect
        setTimeout(() => {
            messageDiv.style.opacity = '1';
        }, 50);
    }

    // Display a loading indicator while waiting for the bot's response
    appendLoader() {
        const messageBox = document.getElementById('message-box');
        const div = document.createElement('div');
        div.className = 'chat-message-div';

        // Add the bot's avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        const avatarImg = document.createElement('img');
        avatarImg.src = this.botAvatar;
        avatarImg.alt = 'Bot Avatar';
        avatarImg.className = 'avatar-img';
        avatarDiv.appendChild(avatarImg);

        // Create the loader animation
        const loaderMessageDiv = document.createElement('div');
        loaderMessageDiv.className = 'chat-message-received';
        loaderMessageDiv.innerHTML = `
            <span class="loader">
                <span class="loader__dot"></span>
                <span class="loader__dot"></span>
                <span class="loader__dot"></span>
            </span>`;

        // Append avatar and loader to the message div
        div.appendChild(avatarDiv);
        div.appendChild(loaderMessageDiv);

        // Append the loader to the chat area
        messageBox.appendChild(div);
        messageBox.scrollTop = messageBox.scrollHeight;
    }

    // Remove the loading indicator
    removeLoader() {
        const loaderDiv = document.querySelector('.chat-message-received .loader');
        if (loaderDiv) {
            const parentDiv = loaderDiv.closest('.chat-message-div');
            parentDiv.remove();
        }
    }
}

// Initialize the chatbot when the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});