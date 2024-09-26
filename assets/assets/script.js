// Ensure that Axios is loaded
if (typeof axios === 'undefined') {
    console.error('Axios is not loaded. Please make sure Axios is included.');
}

class Chatbot {
    constructor() {
        // Fetch bot settings and security nonce from localized script variables (vacw_settings)
        this.botAvatar = vacw_settings.avatar_url || 'default-avatar.png'; // Bot avatar from plugin settings
        this.botGreeting = vacw_settings.bot_greeting || 'Hi! How can I assist you today?'; // Bot greeting from settings
        this.ajaxUrl = vacw_settings.ajax_url; // URL for handling AJAX requests
        this.securityNonce = vacw_settings.security; // Security nonce for AJAX requests
        this.isRunning = false; // Flag to prevent multiple simultaneous requests
        this.setupEventListeners(); // Initialize event listeners for user interaction
    }

    // Set up event listeners for user actions
    setupEventListeners() {
        // Trigger sending a message when the user presses 'Enter'
        document.getElementById('message').addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.sendMessage(); // Trigger message sending
            }
        });

        // Toggle the chatbot visibility (open/close)
        document.getElementById('chatbot_toggle').onclick = this.toggleChatbot.bind(this);
        // Send the message when the user clicks on the send button
        document.querySelector('.input-send').onclick = this.sendMessage.bind(this);
    }

    // Toggle the chatbot's visibility (open/close)
    toggleChatbot() {
        const chatbot = document.getElementById('chatbot');
        const toggleButton = document.getElementById('chatbot_toggle');

        if (chatbot.classList.contains('collapsed')) {
            chatbot.classList.remove('collapsed');
            toggleButton.children[0].style.display = 'none';
            toggleButton.children[1].style.display = '';
            setTimeout(() => this.appendMessage(this.botGreeting, 'received'), 1000); // Display greeting after a short delay
        } else {
            chatbot.classList.add('collapsed');
            toggleButton.children[0].style.display = '';     // Show open icon
            toggleButton.children[1].style.display = 'none'; // Hide close icon
        }
    }

    // Send the user's message to the backend and display the bot's response
    async sendMessage() {
        if (this.isRunning) return; // Prevent multiple requests

        const userMessage = document.getElementById('message').value.trim();
        if (!userMessage) return; // Do nothing if the message is empty

        this.isRunning = true; // Set the flag to indicate a request is in progress
        this.appendMessage(userMessage, 'sent'); // Display the user's message in the chat window
        this.appendLoader(); // Show a loading indicator while waiting for the bot's response

        try {
            // Send a POST request to the backend using Axios
            const response = await axios.post(this.ajaxUrl, {
                action: 'vacw_get_bot_response', // Backend action hook
                message: userMessage,            // User's message
                security: this.securityNonce     // Security nonce for the request
            });

            this.removeLoader(); // Remove the loading indicator after getting the response

            if (response.data.success) {
                this.appendMessage(response.data.data.content, 'received'); // Display the bot's response
            } else {
                this.appendMessage('Sorry, there was an error processing your request.', 'received'); // Display error message
            }
        } catch (error) {
            console.error('Error Details:', error.response ? error.response : error.message); // Better error logging
            this.removeLoader();
            this.appendMessage('Sorry, there was an error processing your request.', 'received');
        }

        this.isRunning = false; // Reset the flag to allow further requests
        document.getElementById('message').value = ''; // Clear the input field after sending the message
    }

    // Append a message to the chat area
    appendMessage(msg, type) {
        const messageBox = document.getElementById('message-box'); // Chatbox element where messages are displayed
        const div = document.createElement('div');
        div.className = 'chat-message-div';

        if (type === 'received') {
            // Add the bot's avatar for received messages
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = this.botAvatar; // Bot avatar URL
            avatarImg.alt = 'Bot Avatar';  // Alt text for the avatar image
            avatarImg.className = 'avatar-img';  // Class for styling the avatar image
            avatarDiv.appendChild(avatarImg);  // Add the image to the avatar div
            div.appendChild(avatarDiv); // Add the avatar div to the message div
        }

        // Create the message bubble
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message-${type}`; // Use different classes for sent and received messages
        messageDiv.textContent = msg; // Set the message content
        messageDiv.style.opacity = '0'; // Set opacity to 0 for fade-in effect
        div.appendChild(messageDiv); // Add the message to the div

        // Append the message to the chatbox
        messageBox.appendChild(div);
        messageBox.scrollTop = messageBox.scrollHeight; // Scroll to the bottom of the chat area

        // Fade-in effect for the message
        setTimeout(() => {
            messageDiv.style.opacity = '1';
        }, 50); // Short delay to trigger the transition

        if (type === 'sent') {
            document.getElementById('message').value = ''; // Clear the input field after sending the message
        }
    }

    // Display a loading indicator while waiting for the bot's response
    appendLoader() {
        const messageBox = document.getElementById('message-box'); // Chatbox element
        const div = document.createElement('div');
        div.className = 'chat-message-div'; // Wrapper for the loading indicator

        // Create the avatar div and image for the loading message
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';  // Class for the avatar container
        const avatarImg = document.createElement('img');
        avatarImg.src = this.botAvatar;  // Bot's avatar URL
        avatarImg.alt = 'Bot Avatar';    // Accessibility alt text
        avatarImg.className = 'avatar-img';  // Avatar image styling class
        avatarDiv.appendChild(avatarImg);  // Append the image to the avatar div

        // Create the loading animation (three dots)
        const loaderMessageDiv = document.createElement('div');
        loaderMessageDiv.className = 'chat-message-received'; // Same class as bot's messages
        loaderMessageDiv.innerHTML = `
            <span class="loader">
                <span class="loader__dot"></span>
                <span class="loader__dot"></span>
                <span class="loader__dot"></span>
            </span>`;  // Loader animation HTML
        // Append the avatar and loader to the message div
        div.appendChild(avatarDiv);
        div.appendChild(loaderMessageDiv);

        // Append the loading message to the chatbox
        messageBox.appendChild(div);
        messageBox.scrollTop = messageBox.scrollHeight; // Scroll to the bottom of the chat area
    }

    // Remove the loading indicator after the bot's response is received
    removeLoader() {
        const loaderDiv = document.querySelector('.chat-message-received .loader'); // Find the loader
        if (loaderDiv) {
            const parentDiv = loaderDiv.closest('.chat-message-div'); // Get the parent container
            parentDiv.remove(); // Remove the loading message
        }
    }
}

// Initialize the chatbot when the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot(); // Create a new instance of the Chatbot class
});