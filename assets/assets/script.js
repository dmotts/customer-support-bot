"use strict";

// Access the OpenAI API key from PHP (passed via wp_localize_script)
const openaiApiKey = vacw_settings.openai_api_key;

if (!openaiApiKey) {
  console.error("OpenAI API key is not available. Please configure it in the plugin settings.");
}

// Function to call OpenAI API
async function callOpenAI(prompt) {
  if (!openaiApiKey) return;

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
  return data;
}

// Get DOM elements
const $chatbotSubmit = document.querySelector('.chat-submit');
const $chatbotInput = document.querySelector('.chat-input');
const $chatbotBody = document.querySelector('.chat-body');

// Example use of the API
$chatbotSubmit.addEventListener('click', async () => {
  const userMessage = $chatbotInput.value;

  if (userMessage) {
    // Add user message to chat
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('chat-message', 'user-message');
    userMessageElement.textContent = userMessage;
    $chatbotBody.appendChild(userMessageElement);

    // Call OpenAI API and get the response
    const aiResponse = await callOpenAI(userMessage);
    
    // Add AI response to chat
    const aiMessageElement = document.createElement('div');
    aiMessageElement.classList.add('chat-message', 'ai-message');
    aiMessageElement.textContent = aiResponse.choices[0].text;
    $chatbotBody.appendChild(aiMessageElement);

    // Scroll to the bottom of the chat
    $chatbotBody.scrollTop = $chatbotBody.scrollHeight;
  }
});
