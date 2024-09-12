"use strict";

// Access OpenAI API key from PHP (passed via wp_localize_script)
if (typeof vacw_settings !== 'undefined') {
    const openaiApiKey = vacw_settings.openai_api_key;

    if (!openaiApiKey) {
        console.error("OpenAI API key is not available. Please configure it in the plugin settings.");
    }
} else {
    console.error("vacw_settings is not defined.");
}

// Get DOM elements
const $chatbotSubmit = document.querySelector('.chatbot__submit');
const $chatbotInput = document.querySelector('.chatbot__input');
const $chatbotMessages = document.querySelector('.chatbot__messages');
const $chatbotBody = document.querySelector('.chatbot__message-window');

// Function to call OpenAI API
async function callOpenAI(prompt) {
    if (!openaiApiKey) return "API key is missing.";

    try {
        const response = await fetch('https://api.openai.com/v1/engines/gpt-4/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: 150
            })
        });

        const data = await response.json();
        return data.choices[0].text;
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return "Sorry, I encountered an error while processing your request.";
    }
}

// Function to add messages to chat
function addMessage(message, className) {
    const messageElement = document.createElement('li');
    messageElement.classList.add('chatbot__message', className);
    messageElement.textContent = message;
    $chatbotMessages.appendChild(messageElement);
    // Auto scroll to the latest message
    $chatbotBody.scrollTop = $chatbotBody.scrollHeight;
}

// Handle submit button click
$chatbotSubmit.addEventListener('click', async () => {
    const userMessage = $chatbotInput.value.trim();

    if (userMessage) {
        // Add user message to chat
        addMessage(userMessage, 'user-message');

        // Clear input
        $chatbotInput.value = '';

        // Show loading indicator
        addMessage('Typing...', 'is-ai');

        // Call OpenAI API and get the response
        const aiResponse = await callOpenAI(userMessage);

        // Remove the loading indicator and add AI response
        const typingIndicator = document.querySelector('.is-ai');
        if (typingIndicator) typingIndicator.remove();
        addMessage(aiResponse, 'ai-message');
    }
});

// Handle input Enter key press 
$chatbotInput.addEventListener('keydown', (event) => { 
    if (event.key === 'Enter') { 
        $chatbotSubmit.click(); 
    } 
});
