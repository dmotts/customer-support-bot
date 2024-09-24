// Ensure that Axios is loaded
if (typeof axios === 'undefined') {
    console.error('Axios is not loaded. Please make sure Axios is included.');
}

class Chatbot {
    constructor() {
        // Retrieve settings from the localized script data
        this.botAvatar = vacw_settings.avatar_url || 'default-avatar.png'; // Bot avatar from plugin settings
        this.botGreeting = vacw_settings.bot_greeting || 'Hi! How can I assist you today?'; // Bot greeting from settings
        this.ajaxUrl = vacw_settings.ajax_url; // URL for handling AJAX requests
        this.securityNonce = vacw_settings.security; // Security nonce for AJAX requests

        this.isRunning = false; // Flag to prevent multiple simultaneous requests
        this.setupEventListeners(); // Initialize event listeners for user interaction
    }

    // Set up event listeners for user actions
    setupEventListeners() {
        // Listen for "Enter" key press in the message input field
        document.getElementById('message').addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent form submission
                this.sendMessage(); // Trigger message sending
            }
        });

        // Toggle chatbot visibility when the toggle button is clicked
        document.getElementById('chatbot_toggle').onclick = this.toggleChatbot.bind(this);

        // Send message when the "Send" button is clicked
        document.querySelector('.input-send').onclick = this.sendMessage.bind(this);
    }

    // Toggle the chatbot's visibility (open/close)
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

        // Get the user's message and trim any whitespace
        const userMessage = document.getElementById('message').value.trim();
        if (!userMessage) return; // Do nothing if the message is empty

        this.isRunning = true; // Set the flag to indicate a request is in progress
        this.appendMessage(userMessage, 'sent'); // Display the user's message in the chat window
        this.appendLoader(); // Show a loading indicator while waiting for the bot's response

        try {
            // Send the user's message to the backend via AJAX
            const response = await axios.post(this.ajaxUrl, {
                action: 'vacw_get_bot_response', // Backend action hook
                message: userMessage,            // User's message
                security: this.securityNonce     // Security nonce for the request
            });

            this.removeLoader(); // Remove the loading indicator after getting the response

            if (response.data.success) {
                // Display the bot's response
                this.appendMessage(response.data.data.content, 'received');
            } else {
                // Display an error message if the request fails
                this.appendMessage('Sorry, there was an error processing your request.', 'received');
            }
        } catch (error) {
            // Handle any errors that occur during the request
            console.error('Error:', error);
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

        // Clear the message input field if it's a sent message
        if (type === 'sent') {
            document.getElementById('message').value = ''; // Clear the input field
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