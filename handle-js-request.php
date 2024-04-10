<?php

/**
 * Handles requests for the dynamic JavaScript file.
 * 
 * Outputs JavaScript code based on the user's login status and roles.
 * Ensures the script is never cached by setting appropriate headers.
 */
function cache_everything_handle_js_request() {
    $is_js_request = intval(get_query_var('cache_everything_js', 0));
    if ($is_js_request === 1) {
        header('Content-Type: application/javascript');
        // Prevent caching of this script
        header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
        header('Pragma: no-cache'); // HTTP 1.0.
        header('Expires: 0'); // Proxies.
        
        // Initialize the response array
        $response = array(
            'status' => 'guest', // Default status
            'roles' => array() // Default empty array for roles
        );
        
        // Dynamic JavaScript generation logic
        if (is_user_logged_in()) {
            $user = wp_get_current_user();
            $response['status'] = 'user';
            $response['roles'] = $user->roles;
        }
        
        // Convert the PHP array to a JSON string
        $jsonResponse = json_encode($response);
        
        // Output JavaScript to dispatch an update event with the new role data
        echo <<<JS
(function() {
    var newRoles = $jsonResponse;
    document.dispatchEvent(new CustomEvent('wce_UserRolesUpdate', { detail: newRoles }));
})();
JS;

        exit; // Stop further processing
    }
}