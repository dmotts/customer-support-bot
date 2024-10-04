<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Handles AJAX requests to get bot responses from OpenAI.
 */
function vacw_get_bot_response() {
    // Verify security nonce
    check_ajax_referer('vacw_nonce_action', 'security');

    // Get and sanitize the user's message
    $user_message = isset($_POST['message']) ? sanitize_text_field(wp_unslash($_POST['message'])) : '';

    if (empty($user_message)) {
        wp_send_json_error('The user message is empty.', 400);
    }

    // Retrieve the OpenAI API key from the settings
    $api_key = get_option('vacw_openai_api_key');

    if (empty($api_key)) {
        wp_send_json_error('API key is not set.', 500);
    }

    // Build the prompt for the assistant
    $prompt = vacw_build_prompt($user_message);

    if (!$prompt || !isset($prompt['system']) || !isset($prompt['user'])) {
        wp_send_json_error('Error building the prompt.', 500);
    }

    // Prepare the API request payload
    $payload = array(
        'model'               => 'gpt-4', // Corrected model name
        'messages'            => array(
            array('role' => 'system', 'content' => $prompt['system']),
            array('role' => 'user', 'content' => $prompt['user']),
        ),
        'temperature'         => 0.7,
        'max_tokens'          => 1500,
        'top_p'               => 1.0,
        'frequency_penalty'   => 0.0,
        'presence_penalty'    => 0.0,
    );

    // Send the request to the OpenAI API
    $response = wp_remote_post('https://api.openai.com/v1/chat/completions', array(
        'headers' => array(
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $api_key,
        ),
        'body'    => wp_json_encode($payload),
        'timeout' => 60, // Increased timeout for better reliability
    ));

    // Check for cURL errors
    if (is_wp_error($response)) {
        error_log('Error communicating with OpenAI API: ' . $response->get_error_message());
        wp_send_json_error('Error communicating with the OpenAI API.', 500);
    }

    // Retrieve and decode the response body
    $response_body = wp_remote_retrieve_body($response);
    $result = json_decode($response_body, true);

    // Check for API errors
    if (isset($result['error'])) {
        error_log('OpenAI API Error: ' . $result['error']['message']);
        wp_send_json_error('OpenAI API Error: ' . $result['error']['message'], 500);
    }

    // Ensure the response structure is as expected
    if (!isset($result['choices'][0]['message'])) {
        error_log('Unexpected response structure from OpenAI API: ' . $response_body);
        wp_send_json_error('Unexpected response structure from OpenAI API.', 500);
    }

    $message = $result['choices'][0]['message'];

    // Check if the message contains a function call
    if (isset($message['function_call'])) {
        $function_name    = sanitize_text_field($message['function_call']['name']);
        $arguments_json   = $message['function_call']['arguments'];

        // Decode arguments safely
        $arguments = json_decode($arguments_json, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Error decoding function call arguments: ' . json_last_error_msg());
            wp_send_json_error('Error decoding function call arguments.', 500);
        }

        // Handle the function call
        $function_response = vacw_handle_function_call($function_name, $arguments);

        // Check if function response is valid
        if ($function_response === false) {
            wp_send_json_error('Error handling the function call.', 500);
        }

        // Append function response to the messages
        $payload['messages'][] = array(
            'role'    => 'function',
            'name'    => $function_name,
            'content' => wp_json_encode($function_response),
        );

        // Make a second API request with the function response
        $second_response = wp_remote_post('https://api.openai.com/v1/chat/completions', array(
            'headers' => array(
                'Content-Type'  => 'application/json',
                'Authorization' => 'Bearer ' . $api_key,
            ),
            'body'    => wp_json_encode($payload),
            'timeout' => 60,
        ));

        // Check for cURL errors in the second request
        if (is_wp_error($second_response)) {
            error_log('Error in second communication with OpenAI API: ' . $second_response->get_error_message());
            wp_send_json_error('Error communicating with the OpenAI API.', 500);
        }

        // Retrieve and decode the second response
        $second_response_body = wp_remote_retrieve_body($second_response);
        $second_result        = json_decode($second_response_body, true);

        // Check for API errors in the second response
        if (isset($second_result['error'])) {
            error_log('OpenAI API Error in second request: ' . $second_result['error']['message']);
            wp_send_json_error('OpenAI API Error: ' . $second_result['error']['message'], 500);
        }

        // Ensure the second response structure is as expected
        if (!isset($second_result['choices'][0]['message']['content'])) {
            error_log('Unexpected response structure from OpenAI API in second request: ' . $second_response_body);
            wp_send_json_error('Unexpected response structure from OpenAI API.', 500);
        }

        $reply = sanitize_text_field($second_result['choices'][0]['message']['content']);
        wp_send_json_success(array('content' => $reply));
    } else {
        // No function call; return the assistant's reply
        $reply = sanitize_text_field($message['content']);
        wp_send_json_success(array('content' => $reply));
    }

    // Always die in AJAX handlers
    wp_die();
}
add_action('wp_ajax_vacw_get_bot_response', 'vacw_get_bot_response');
add_action('wp_ajax_nopriv_vacw_get_bot_response', 'vacw_get_bot_response');
         