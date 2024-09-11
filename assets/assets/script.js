"use strict";

// Event listener for message submission
document.querySelector('.chatbot__submit').addEventListener('click', async () => {
    const userMessage = document.querySelector('.chatbot__input').value;

    // Display the user's message in the chat window
    displayMessage(userMessage, 'user');

    // Call GPT-4o API
    const response = await getGPT4oResponse(userMessage);

    // Display the AI's response
    displayMessage(response, 'ai');
});

async function getGPT4oResponse(message) {
    const apiKey = "YOUR_API_KEY"; // Replace with dynamic fetching from PHP

    const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4',
            prompt: message,
            max_tokens: 150,
            temperature: 0.7
        })
    });

    const data = await response.json();
    return data.choices[0].text.trim();
}

// Function to display message
function displayMessage(message, sender) {
    const messageElement = document.createElement('li');
    messageElement.classList.add(sender === 'ai' ? 'is-ai' : 'is-user');
    messageElement.innerHTML = `<p class='chatbot__message'>${message}</p>`;
    document.querySelector('.chatbot__messages').appendChild(messageElement);
}
