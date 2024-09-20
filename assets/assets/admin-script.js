jQuery(document).ready(function($) {
    var mediaUploader;

    // Avatar Upload Button Logic
    $('#vacw-avatar-upload-button').click(function(e) {
        e.preventDefault();

        // If the uploader object has already been created, reopen it.
        if (mediaUploader) {
            mediaUploader.open();
            return;
        }

        // Extend the wp.media object.
        mediaUploader = wp.media.frames.file_frame = wp.media({
            title: 'Choose Avatar Image',
            button: {
                text: 'Choose Image'
            },
            multiple: false  // Only allow single image selection
        });

        // When an image is selected, run a callback.
        mediaUploader.on('select', function() {
            var attachment = mediaUploader.state().get('selection').first().toJSON();
            $('#vacw-avatar-url').val(attachment.url);  // Update the hidden input field with the image URL
            $('#vacw-avatar-preview').attr('src', attachment.url).show();  // Update the preview with the selected image
        });

        // Open the uploader dialog.
        mediaUploader.open();
    });

    // Toggle visibility of OpenAI API Key
    const apiKeyInput = $('#vacw_openai_api_key');
    const toggleButton = $('#toggle_openai_api_key_visibility');
    const toggleIcon = toggleButton.find('.dashicons');

    // Click event to toggle password visibility
    toggleButton.click(function() {
        if (apiKeyInput.attr('type') === 'password') {
            apiKeyInput.attr('type', 'text');  // Show the API key
            toggleIcon.removeClass('dashicons-visibility').addClass('dashicons-hidden');  // Change icon to "hidden"
        } else {
            apiKeyInput.attr('type', 'password');  // Hide the API key
            toggleIcon.removeClass('dashicons-hidden').addClass('dashicons-visibility');  // Change icon back to "visible"
        }
    });
});