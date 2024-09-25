<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Handle function calls from the assistant
function vacw_handle_function_call($function_name, $arguments) {
    switch ($function_name) {
        case 'check_availability':
            // Send a POST request to the check_availability webhook
            $response = wp_remote_post(
                'https://hook.us1.make.com/qqsdn32ixz7xdgfrn1x6ld1ss052xmsu',
                array(
                    'headers' => array('Content-Type' => 'application/json'),
                    'body'    => json_encode($arguments),
                )
            );
            if (is_wp_error($response)) {
                return array('error' => 'Unable to check availability.');
            } else {
                return json_decode(wp_remote_retrieve_body($response), true);
            }
            break;

        case 'book_appointment':
            // Send a POST request to the book_appointment webhook
            $response = wp_remote_post(
                'https://hook.us1.make.com/no9a7fqgfwp9csvaw7gh2gc5lqroswjd',
                array(
                    'headers' => array('Content-Type' => 'application/json'),
                    'body'    => json_encode($arguments),
                )
            );
            if (is_wp_error($response)) {
                return array('error' => 'Unable to book appointment.');
            } else {
                return json_decode(wp_remote_retrieve_body($response), true);
            }
            break;

        default:
            return array('error' => 'Function not found.');
    }
}