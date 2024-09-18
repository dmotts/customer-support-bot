jQuery(document).ready(function($) {
    var mediaUploader;

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
            multiple: false
        });

        // When an image is selected, run a callback.
        mediaUploader.on('select', function() {
            var attachment = mediaUploader.state().get('selection').first().toJSON();
            $('#vacw-avatar-url').val(attachment.url); // Update the hidden input field with the image URL
            $('#vacw-avatar-preview').attr('src', attachment.url).show(); // Update the preview with the selected image
        });

        // Open the uploader dialog.
        mediaUploader.open();
    });
});
