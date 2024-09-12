<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Check if the function is already defined to avoid redeclaration
if (!function_exists('vacw_settings_page')) {
    function vacw_settings_page() {
        ?>
        <div class="wrap">
            <h1>Customer Support Bot Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('vacw_settings_group');
                do_settings_sections('vacw-settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
}

// Register and define the settings
function vacw_register_settings() {
    register_setting('vacw_settings_group', 'vacw_openai_api_key');

    add_settings_section(
        'vacw_settings_section',
        'API Settings',
        'vacw_settings_section_callback',
        'vacw-settings'
    );

    add_settings_field(
        'vacw_openai_api_key',
        'OpenAI API Key',
        'vacw_openai_api_key_callback',
        'vacw-settings',
        'vacw_settings_section'
    );
}
add_action('admin_init', 'vacw_register_settings');

function vacw_settings_section_callback() {
    echo 'Enter your OpenAI API key below.';
}

function vacw_openai_api_key_callback() {
    $api_key = get_option('vacw_openai_api_key');
    ?>
    <input type="text" name="vacw_openai_api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text">
    <?php
}
