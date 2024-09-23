class Chatbot {
    constructor() {
        this.botLoadingDelay = 3000;  // Time delay for showing the bot's responses (in milliseconds)
        this.initialGreeting = vacw_settings.bot_greeting || "Hi! How can I assist you today?";  // Greeting message for the bot
        this.botAvatar = vacw_settings.avatar_url || "https://res.cloudinary.com/dzpafdvkm/image/upload/v1725329022/Portfolio/logos/drupal.svg";  // Bot's avatar image
        this.isRunning = false;  // Flag to prevent multiple messages being sent at once
        this.session_id = this.getStoredSession() || this.initializeSession();  // Retrieve session ID from local storage or create a new session
        this.setupHeaderLogo(); // Setup header logo if it exists
        this.setupEventListeners();  // Setup event listeners for user interactions
        this.userMessage = "";  // Store the user's message
        this.botMessage = "";   // Store the bot's response
    }

    setupHeaderLogo() {
        const headerTitle = document.querySelector("#post-11 > div.inner-div > h2") || null;
        if(headerTitle && headerTitle !== null) {
        headerTitle.innerHTML = `<svg width="222" height="24" viewBox="0 0 222 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.366 24C9.08637 24 5.94102 22.7357 3.62193 20.4853C1.30285 18.2348 0 15.1826 0 12C0 8.8174 1.30285 5.76516 3.62193 3.51472C5.94102 1.26428 9.08637 0 12.366 0L209.634 0C212.914 0 216.059 1.26428 218.378 3.51472C220.697 5.76516 222 8.8174 222 12C222 15.1826 220.697 18.2348 218.378 20.4853C216.059 22.7357 212.914 24 209.634 24H12.366Z" fill="white"></path>
<path d="M209.634 0.571419H12.3661C5.86169 0.571419 0.588867 5.68816 0.588867 12C0.588867 18.3118 5.86169 23.4286 12.3661 23.4286H209.634C216.138 23.4286 221.411 18.3118 221.411 12C221.411 5.68816 216.138 0.571419 209.634 0.571419Z" fill="black"></path>
<path d="M9.76331 4.66571H11.7419L16.9533 17.2743L22.0616 4.66571H24.6585L29.705 17.3343L34.9783 4.66571H36.9568L31.0241 19.0886H28.4272L23.3601 6.41713L18.2929 19.0886H15.6961L9.76331 4.66571Z" fill="#DBE200"></path>
<path d="M39.0649 4.66571H53.7099V6.25999H41.0818V10.86H53.2152V12.4543H41.0818V17.4943H53.7923V19.0886H39.0649V4.66571Z" fill="#DBE200"></path>
<path d="M68.4431 11.7971C70.6867 11.7971 71.6347 11.2257 71.6347 9.70286V8.38857C71.6347 6.77714 70.9134 6.25714 67.9485 6.25714H58.7623V11.7971H68.4431ZM56.7425 4.65429H68.6698C72.9744 4.65429 73.6545 6.02857 73.6545 8.73714V9.91143C73.6545 11.9457 72.4591 12.5029 70.9134 12.6429V12.6829C72.9744 13.04 73.469 14.0771 73.469 15.3914V19.0771H71.5759V15.92C71.5759 13.6686 70.4394 13.3914 68.608 13.3914H58.7623V19.0886H56.7425V4.65429Z" fill="#DBE200"></path>
<path d="M77.2024 4.66571H79.2222V10.78H81.7543L91.1083 4.66571H94.403L94.4442 4.70571L83.7535 11.5971L95.4129 19.0486L95.3717 19.0886H91.8267L81.5894 12.3743H79.2222V19.0886H77.2024V4.66571Z" fill="#DBE200"></path>
<path d="M96.0165 4.66571H113.444V8.25142H107.016V19.0886H102.441V8.25142H96.0165V4.66571Z" fill="white"></path>
<path d="M120.616 13.4286H126.466L123.499 7.99999L120.616 13.4286ZM120.534 4.66571H126.487L134.687 19.0857H129.599L128.177 16.5371H118.905L117.566 19.0857H112.472L120.534 4.66571Z" fill="white"></path>
<path d="M136.318 4.66571H140.891V15.3828H151.172V19.0886H136.318V4.66571Z" fill="white"></path>
<path d="M153.112 4.66571H169.427V8.01142H157.685V10.3228H168.808V13.3114H157.685V15.62H169.695V19.0886H153.112V4.66571Z" fill="white"></path>
<path d="M172.459 4.66571H179.546L188.135 15.1428H188.179V4.66571H192.748V19.0886H185.664L177.073 8.60856H177.032V19.0886H172.459V4.66571Z" fill="white"></path>
<path d="M194.753 4.66571H212.181V8.25142H205.753V19.0886H201.181V8.25142H194.753V4.66571Z" fill="white"></path>
<path d="M214.345 17.0286C214.346 17.4379 214.222 17.8384 213.988 18.1794C213.755 18.5203 213.422 18.7863 213.033 18.9437C212.644 19.1012 212.215 19.143 211.801 19.0638C211.387 18.9846 211.007 18.7881 210.708 18.499C210.409 18.2099 210.206 17.8414 210.123 17.4399C210.04 17.0385 210.082 16.6223 210.243 16.244C210.404 15.8657 210.678 15.5423 211.028 15.3147C211.379 15.0872 211.791 14.9657 212.213 14.9657C212.493 14.9653 212.77 15.0184 213.028 15.1219C213.286 15.2253 213.521 15.3772 213.719 15.5687C213.917 15.7603 214.074 15.9878 214.182 16.2383C214.289 16.4887 214.344 16.7573 214.345 17.0286Z" fill="white"></path>
<path d="M214.701 17.0286C214.703 17.5138 214.556 17.9886 214.28 18.3928C214.003 18.7971 213.609 19.1126 213.148 19.2995C212.686 19.4864 212.178 19.5361 211.687 19.4425C211.197 19.3489 210.746 19.1161 210.392 18.7736C210.038 18.4311 209.796 17.9943 209.698 17.5186C209.6 17.0428 209.649 16.5494 209.84 16.101C210.031 15.6526 210.355 15.2692 210.77 14.9995C211.186 14.7297 211.675 14.5857 212.175 14.5857C212.844 14.585 213.485 14.8418 213.959 15.2998C214.433 15.7579 214.7 16.3797 214.701 17.0286Z" fill="#DBE200"></path>
</svg>`;
        }
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
            // Get session Id from API
            const sessionIdResponse = await axios.post(
   'https://agentivehub.com/api/chat/session',
 {
    "api_key": "664c990c-f470-4c0f-a67c-98056db461ae",
     "assistant_id": "66ca9fa5-d934-4cf5-8dde-c73173b1a0cc",
    }
)

            // Extract the session ID from the server's response
            const session_id = sessionIdResponse.data.session_id;

            // Send the user's message and session ID to the backend for processing
/*
            const response = await axios.post(vacw_settings.ajax_url, {
                action: 'vacw_get_bot_response',   // The WordPress AJAX action to call
                session_id: this.session_id,       // Include the session ID
                message: userMessage,              // Include the user's message
                security: vacw_settings.security   // Security nonce for the AJAX request
            });
*/


console.log(`This session id: ${this.session_id}`);
const chatReponse = {
 api_key: "664c990c-f470-4c0f-a67c-98056db461ae",
 session_id: session_id,
 type: 'custom_code',
 assistant_id: "66ca9fa5-d934-4cf5-8dde-c73173b1a0cc",
 messages:[{ role: 'user',  content: userMessage }],
 };

const response = await axios.post(
   'https://agentivehub.com/api/chat',
 chatReponse
 );
  
    

            const botReply = response.data.content;  // Get the bot's reply content from the response
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
            console.log(`About to call for session id`);
            // Call the backend to initialize a new session
            /*
            const response = await axios.post(vacw_settings.ajax_url, {
                action: 'vacw_initialize_session',   // Specify the backend action to initialize session
                security: vacw_settings.security     // Include security nonce for the request
            });
            */

            
            const response = await axios.post(
   'https://agentivehub.com/api/chat/session',
 {
    "api_key": "664c990c-f470-4c0f-a67c-98056db461ae",
     "assistant_id": "66ca9fa5-d934-4cf5-8dde-c73173b1a0cc",
    }
)
            
            // Extract the session ID from the server's response
            const sessionId = response.data.session_id;

            console.log(`Session ID: ${sessionId}`);

            // Store the new session ID in localStorage
            this.storeSession(sessionId);
            return sessionId;

        } catch (error) {
            // Handle any errors encountered during session initialization
            this.appendMessage(`Error initializing session: ${error.response ? error.response.data : error.message}`, "received");
        }
    }
}

// Initialize the chatbot when the page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    new Chatbot();  // Create a new instance of the Chatbot class
});
