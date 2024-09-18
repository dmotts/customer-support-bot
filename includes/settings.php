<div class="wrap">
    <h1>Customer Support Bot Settings</h1>
    <form method="post" action="options.php">
        <?php 
            // Output security fields for the registered setting "vacw_settings_group"
            settings_fields('vacw_settings_group'); 
            // Output setting sections and their fields (sections are registered for "vacw_settings_group")
            do_settings_sections('vacw_settings_group'); 
        ?>
        <table class="form-table">
            <tr valign="top">
                <th scope="row">Avatar Image</th>
                <td>
                    <!-- Image preview -->
                    <img id="vacw-avatar-preview" src="<?php echo esc_url(get_option('vacw_avatar_url')); ?>" style="max-width: 150px; display: block; margin-bottom: 10px;">
                    
                    <!-- Hidden field to store the image URL -->
                    <input type="hidden" id="vacw-avatar-url" name="vacw_avatar_url" value="<?php echo esc_attr(get_option('vacw_avatar_url')); ?>" />
                    
                    <!-- Button to upload an image -->
                    <button type="button" class="button" id="vacw-avatar-upload-button">Upload Image</button>
                    <p class="description">Upload an image for the bot's avatar.</p>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row">Virtual Assistant Name</th>
                <td>
                    <input type="text" name="vacw_assistant_name" value="<?php echo esc_attr(get_option('vacw_assistant_name', 'Harry')); ?>" />
                    <p class="description">Set the name of the virtual assistant.</p>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row">OpenAI API Key</th>
                <td>
                    <input type="password" name="vacw_openai_api_key" value="<?php echo esc_attr(get_option('vacw_openai_api_key')); ?>" />
                    <p class="description">Enter your OpenAI API key for chatbot functionality.</p>
                </td>
            </tr>
        </table>
        <?php submit_button(); ?>
    </form>
</div>