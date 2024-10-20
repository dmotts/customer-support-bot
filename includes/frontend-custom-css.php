<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Add the chosen theme color to the frontend
function vacw_add_custom_color_to_chatbot() {
    // Retrieve the theme color from the settings, with a fallback to the default
    $theme_color = esc_attr(get_option('vacw_theme_color', '#dbe200'));
    $text_color = esc_attr(get_option('vacw_text_color', '#000000'));
    
    // Output dynamic CSS to apply the theme color to the chatbot widget
    echo "<style>
        #chatbot_toggle { background-color: {$theme_color}; }
        .chat-message-sent { background-color: {$theme_color}; }
        .chat-message-received { background-color: {$theme_color}; }
        .main-title { background-color: {$theme_color}; }
        button.input-send svg { fill: {$theme_color}; }
        .line { background-color: {$theme_color}; }
        .chat-message-received { color: {$text_color}; }
        .chat-message-sent { color: {$text_color}; }
        .main-title { color: {$text_color}; }
    </style>";
}
add_action('wp_footer', 'vacw_add_custom_color_to_chatbot');
