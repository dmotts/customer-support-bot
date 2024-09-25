<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Handle AJAX request to get bot response
function vacw_get_bot_response() {
    // Verify security nonce
    check_ajax_referer('vacw_nonce_action', 'security');

    // Get and sanitize the user's message
    $user_message = sanitize_text_field($_POST['message']);

    // Retrieve the OpenAI API key from the settings
    $api_key = get_option('vacw_openai_api_key');

    if (empty($api_key)) {
        wp_send_json_error('API key not set.');
        wp_die();
    }

    // Build the prompt for the assistant
    $prompt = vacw_build_prompt($user_message);

    // Prepare the API request
    $args = array(
        'headers' => array(
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $api_key,
        ),
        'body'    => json_encode(array(
            'model'         => 'gpt-3.5-turbo-0613',
            'messages'      => array(
                array('role' => 'system', 'content' => $prompt['system']),
                array('role' => 'user', 'content' => $prompt['user']),
            ),
            'functions'     => $prompt['functions'],
            'function_call' => 'auto',
        )),
        'timeout' => 30,
    );

    // Send the request to the OpenAI API
    $response = wp_remote_post('https://api.openai.com/v1/chat/completions', $args);

    if (is_wp_error($response)) {
        error_log('Error communicating with OpenAI API: ' . $response->get_error_message());
        wp_send_json_error('Error communicating with the OpenAI API.');
    } else {
        $response_body = wp_remote_retrieve_body($response);
        $result = json_decode($response_body, true);

        if (isset($result['error'])) {
            error_log('OpenAI API Error: ' . $result['error']['message']);
            wp_send_json_error('OpenAI API Error: ' . $result['error']['message']);
        } else {
            $message = $result['choices'][0]['message'];

            if (isset($message['function_call'])) {
                $function_name = $message['function_call']['name'];
                $arguments = json_decode($message['function_call']['arguments'], true);

                // Handle function call
                $function_response = vacw_handle_function_call($function_name, $arguments);

                // Send the function response back to the assistant
                $args['body'] = json_encode(array(
                    'model'    => 'gpt-3.5-turbo-0613',
                    'messages' => array(
                        array('role' => 'system', 'content' => $prompt['system']),
                        array('role' => 'user', 'content' => $prompt['user']),
                        $message,
                        array('role' => 'function', 'name' => $function_name, 'content' => json_encode($function_response)),
                    ),
                ));

                $response = wp_remote_post('https://api.openai.com/v1/chat/completions', $args);

                if (is_wp_error($response)) {
                    error_log('Error communicating with OpenAI API: ' . $response->get_error_message());
                    wp_send_json_error('Error communicating with the OpenAI API.');
                } else {
                    $response_body = wp_remote_retrieve_body($response);
                    $result = json_decode($response_body, true);

                    if (isset($result['error'])) {
                        error_log('OpenAI API Error: ' . $result['error']['message']);
                        wp_send_json_error('OpenAI API Error: ' . $result['error']['message']);
                    } else {
                        $reply = $result['choices'][0]['message']['content'];
                        wp_send_json_success(array('content' => $reply));
                    }
                }
            } else {
                $reply = $message['content'];
                wp_send_json_success(array('content' => $reply));
            }
        }
    }
    wp_die();
}
add_action('wp_ajax_vacw_get_bot_response', 'vacw_get_bot_response');
add_action('wp_ajax_nopriv_vacw_get_bot_response', 'vacw_get_bot_response');
