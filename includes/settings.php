<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="wrap">
    <h1 class="mb-4"><?php _e('Customer Support Bot Settings', 'customer-support-bot'); ?></h1>

    <form method="post" action="options.php">
        <?php
        // Output security fields and settings sections
        settings_fields('vacw_settings_group');
        do_settings_sections('vacw_settings_group');
        ?>

        <!-- Avatar Upload Section -->
        <div class="mb-3">
            <label for="vacw_avatar_url" class="form-label">
                <?php _e('Avatar Image', 'customer-support-bot'); ?>
            </label>
            <div class="d-flex align-items-center">
                <!-- Display the current avatar or a default one -->
                <img id="vacw-avatar-preview"
                     src="<?php echo esc_url(get_option('vacw_avatar_url', plugins_url('assets/default-avatar.png', __DIR__ . '/../'))); ?>"
                     class="rounded-circle me-3"
                     style="width: 80px; height: 80px;" />
                <!-- Button to open the media uploader -->
                <button type="button" id="vacw-avatar-upload-button" class="btn btn-primary">
                    <?php _e('Upload Image', 'customer-support-bot'); ?>
                </button>
            </div>
            <!-- Hidden input to store the avatar URL -->
            <input type="hidden" id="vacw-avatar-url" name="vacw_avatar_url"
                   value="<?php echo esc_attr(get_option('vacw_avatar_url')); ?>" />
        </div>

        <!-- Assistant Name Section -->
        <div class="mb-3">
            <label for="vacw_assistant_name" class="form-label">
                <?php _e('Assistant Name', 'customer-support-bot'); ?>
            </label>
            <input type="text" name="vacw_assistant_name" id="vacw_assistant_name" class="form-control"
                   value="<?php echo esc_attr(get_option('vacw_assistant_name', 'Customer Support Bot')); ?>" />
        </div>

        <!-- OpenAI API Key Section -->
        <div class="mb-3">
            <label for="vacw_openai_api_key" class="form-label">
                <?php _e('OpenAI API Key', 'customer-support-bot'); ?>
            </label>
            <input type="password" name="vacw_openai_api_key" id="vacw_openai_api_key" class="form-control"
                   value="<?php echo esc_attr(get_option('vacw_openai_api_key')); ?>" />
            <p class="form-text text-muted">
                <?php _e('Enter your OpenAI API key. This key will be used to communicate with the OpenAI API.', 'customer-support-bot'); ?>
            </p>
        </div>

        <!-- Bot Greeting Section -->
        <div class="mb-3">
            <label for="vacw_bot_greeting" class="form-label">
                <?php _e('Bot Greeting', 'customer-support-bot'); ?>
            </label>
            <input type="text" name="vacw_bot_greeting" id="vacw_bot_greeting" class="form-control"
                   value="<?php echo esc_attr(get_option('vacw_bot_greeting', __('Hi! How can I assist you today?', 'customer-support-bot'))); ?>" />
            <p class="form-text text-muted">
                <?php _e('Enter the greeting message that the bot will display when it starts.', 'customer-support-bot'); ?>
            </p>
        </div>

        <!-- Primary Theme Color Picker Section -->
        <div class="mb-3">
            <label for="vacw_theme_color" class="form-label">
                <?php _e('Primary Theme Color', 'customer-support-bot'); ?>
            </label>
            <input type="text" name="vacw_theme_color" id="vacw_theme_color" class="vacw-color-field"
                   value="<?php echo esc_attr(get_option('vacw_theme_color', '#dbe200')); ?>" />
            <p class="form-text text-muted">
                <?php _e('Choose the primary color for the chat widget.', 'customer-support-bot'); ?>
            </p>
        </div>

        <!-- Save Button -->
        <?php submit_button(__('Save Changes', 'customer-support-bot'), 'btn btn-primary'); ?>
    </form>
</div>