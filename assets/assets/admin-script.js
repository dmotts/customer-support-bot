jQuery(document).ready(function($) {
    var mediaUploader;

    // Handle avatar image upload
    $('#vacw-avatar-upload-button').click(function(e) {
        e.preventDefault();

        // If the media uploader is already created, just open it
        if (mediaUploader) {
            mediaUploader.open();
            return;
        }

        // Extend the wp.media object to handle image uploads
        mediaUploader = wp.media.frames.file_frame = wp.media({
            title: 'Choose Avatar Image',
            button: {
                text: 'Choose Image'
            },
            multiple: false
        });

        // When an image is selected, update the avatar URL and preview image
        mediaUploader.on('select', function() {
            var attachment = mediaUploader.state().get('selection').first().toJSON();
            $('#vacw-avatar-url').val(attachment.url); // Store the image URL in hidden field
            $('#vacw-avatar-preview').attr('src', attachment.url).show(); // Update image preview
        });

        // Open the uploader dialog
        mediaUploader.open();
    });

    // Handle OpenAI API Key visibility toggle
    $('#toggle_openai_api_key_visibility').click(function(e) {
        e.preventDefault();
        var apiKeyInput = $('#vacw_openai_api_key');
        var icon = $(this).find('.dashicons');
        
        // Toggle the input field between password and text
        if (apiKeyInput.attr('type') === 'password') {
            apiKeyInput.attr('type', 'text');  // Show API key
            icon.removeClass('dashicons-visibility').addClass('dashicons-hidden');  // Change icon to hidden
        } else {
            apiKeyInput.attr('type', 'password');  // Hide API key
            icon.removeClass('dashicons-hidden').addClass('dashicons-visibility');  // Change icon back to visible
        }
    });
});