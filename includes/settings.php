<div class="wrap">
    <h1 class="mb-4"><?php _e('Customer Support Bot Settings', 'customer-support-bot'); ?></h1>
    
    <form method="post" action="options.php">
        <?php settings_fields('vacw_settings_group'); ?>
        <?php do_settings_sections('vacw_settings_group'); ?>
        
        <!-- Avatar Upload Section -->
        <div class="mb-3">
            <label for="vacw_avatar_url" class="form-label"><?php _e('Avatar Image', 'customer-support-bot'); ?></label>
            <div class="d-flex align-items-center">
                <img id="vacw-avatar-preview" src="<?php echo esc_url(get_option('vacw_avatar_url')); ?>" class="rounded-circle me-3" style="width: 80px; height: 80px;" />
                <button type="button" id="vacw-avatar-upload-button" class="btn btn-primary"><?php _e('Upload Image', 'customer-support-bot'); ?></button>
            </div>
            <input type="hidden" id="vacw-avatar-url" name="vacw_avatar_url" value="<?php echo esc_attr(get_option('vacw_avatar_url')); ?>" />
        </div>

        <!-- Assistant Name Section -->
        <div class="mb-3">
            <label for="vacw_assistant_name" class="form-label"><?php _e('Assistant Name', 'customer-support-bot'); ?></label>
            <input type="text" name="vacw_assistant_name" id="vacw_assistant_name" class="form-control" value="<?php echo esc_attr(get_option('vacw_assistant_name', 'Customer Support Bot')); ?>" />
        </div>

        <!-- OpenAI API Key Section -->
        <div class="mb-3">
            <label for="vacw_openai_api_key" class="form-label"><?php _e('OpenAI API Key', 'customer-support-bot'); ?></label>
            <div class="input-group">
                <input type="password" name="vacw_openai_api_key" id="vacw_openai_api_key" class="form-control" value="<?php echo esc_attr(vacw_get_decrypted_api_key()); ?>" />
                <button type="button" id="toggle_openai_api_key_visibility" class="btn btn-outline-secondary">
                    <span class="dashicons dashicons-visibility"></span>
                </button>
            </div>
            <p class="form-text text-muted"><?php _e('Click the eye icon to toggle visibility of the API key.', 'customer-support-bot'); ?></p>
        </div>

        <!-- Bot Greeting Section -->
        <div class="mb-3">
            <label for="vacw_bot_greeting" class="form-label"><?php _e('Bot Greeting', 'customer-support-bot'); ?></label>
            <input type="text" name="vacw_bot_greeting" id="vacw_bot_greeting" class="form-control" value="<?php echo esc_attr(get_option('vacw_bot_greeting', 'Hi! How can I assist you today?')); ?>" />
            <p class="form-text text-muted"><?php _e('Enter the greeting message that the bot will display when it starts.', 'customer-support-bot'); ?></p>
        </div>
        
        <!-- Save Button -->
        <?php submit_button(__('Save Changes', 'customer-support-bot'), 'btn btn-primary'); ?>
    </form>
</div>