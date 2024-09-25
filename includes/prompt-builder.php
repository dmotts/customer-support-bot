<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Build the prompt for the assistant
function vacw_build_prompt($user_message) {
    // Define the assistant's role and capabilities
    $system_prompt = "You are a helpful customer support assistant for a company. You can assist users with scheduling appointments, checking availability, and answering general inquiries. You have access to the following tools:

1. **check_availability**: Use this to check if a requested appointment date and time are available.
   - *Parameters*: date (YYYY-MM-DD), time (HH:MM)

2. **book_appointment**: Use this to book an appointment for the user.
   - *Parameters*: date (YYYY-MM-DD), time (HH:MM), name, email

When a user asks about appointment scheduling, use these tools to assist them. Always confirm with the user before booking an appointment. If the user provides incomplete information, politely ask for the missing details.

Do not mention the tools to the user; instead, use them internally to fetch information or perform actions needed to assist the user.

Respond in a friendly and professional manner.";

    // Define available functions
    $functions = array(
        array(
            'name'        => 'check_availability',
            'description' => 'Check if the requested appointment date and time are available.',
            'parameters'  => array(
                'type'       => 'object',
                'properties' => array(
                    'date' => array(
                        'type'        => 'string',
                        'description' => 'The date for the appointment in YYYY-MM-DD format.',
                    ),
                    'time' => array(
                        'type'        => 'string',
                        'description' => 'The time for the appointment in HH:MM format.',
                    ),
                ),
                'required' => array('date', 'time'),
            ),
        ),
        array(
            'name'        => 'book_appointment',
            'description' => 'Book an appointment for the user.',
            'parameters'  => array(
                'type'       => 'object',
                'properties' => array(
                    'date' => array(
                        'type'        => 'string',
                        'description' => 'The date for the appointment in YYYY-MM-DD format.',
                    ),
                    'time' => array(
                        'type'        => 'string',
                        'description' => 'The time for the appointment in HH:MM format.',
                    ),
                    'name' => array(
                        'type'        => 'string',
                        'description' => 'The name of the user.',
                    ),
                    'email' => array(
                        'type'        => 'string',
                        'description' => 'The email address of the user.',
                    ),
                ),
                'required' => array('date', 'time', 'name', 'email'),
            ),
        ),
    );

    return array(
        'system'    => $system_prompt,
        'user'      => $user_message,
        'functions' => $functions,
    );
}