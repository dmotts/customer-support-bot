<div class="wrap">
    <h1><?php _e('Customer Support Bot Settings', 'customer-support-bot'); ?></h1>
    <form method="post" action="options.php">
        <?php 
            settings_fields('vacw_settings_group'); 
            do_settings_sections('vacw_settings_group'); 
        ?>
        <table class="form-table">
            <tr valign="top">
                <th scope="row"><?php _e('Avatar Image', 'customer-support-bot'); ?></th>
                <td>
                    <img id="vacw-avatar-preview" src="<?php echo esc_url(get_option('vacw_avatar_url')); ?>" style="max-width: 150px; display: block; margin-bottom: 10px;">
                    <input type="hidden" id="vacw-avatar-url" name="vacw_avatar_url" value="<?php echo esc_attr(get_option('vacw_avatar_url')); ?>" />
                    <button type="button" class="button" id="vacw-avatar-upload-button"><?php _e('Upload Image', 'customer-support-bot'); ?></button>
                    <p class="description"><?php _e('Upload an image for the bot\'s avatar.', 'customer-support-bot'); ?></p>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row"><?php _e('Virtual Assistant Name', 'customer-support-bot'); ?></th>
                <td>
                    <input type="text" name="vacw_assistant_name" value="<?php echo esc_attr(get_option('vacw_assistant_name', 'Customer Support Bot')); ?>" />
                    <p class="description"><?php _e('Set the name of the virtual assistant.', 'customer-support-bot'); ?></p>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row"><?php _e('OpenAI API Key', 'customer-support-bot'); ?></th>
                <td>
                    <div style="position: relative;">
                        <input type="password" name="vacw_openai_api_key" id="vacw_openai_api_key" value="<?php echo esc_attr(vacw_get_decrypted_api_key()); ?>" />
                        <button type="button" id="toggle_openai_api_key_visibility" style="position: absolute; right: 10px; top: 3px; background: none; border: none; cursor: pointer;">
                            <span class="dashicons dashicons-visibility"></span>
                        </button>
                    </div>
                    <p class="description"><?php _e('Enter your OpenAI API key. Click the eye icon to toggle visibility.', 'customer-support-bot'); ?></p>
                </td>
            </tr>
        </table>
        <?php submit_button(); ?>
    </form>
</div>