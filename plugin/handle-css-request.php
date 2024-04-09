<?php

require_once(plugin_dir_path(__FILE__) . 'helpers.php');

/**
 * Handles the request for the dynamic CSS file.
 */
function cache_everything_handle_css_request() {
    if (get_query_var('cache_everything_css')) {
        header("Content-Type: text/css; charset=UTF-8");

        // Get all user rules
        $all_roles = cache_everything_get_role_slugs(); 

        // Get the site prefix by calling the new function
        $site_prefix = get_site_prefix();

        // Add 'guest' and 'user' to the array of roles to be hidden
        array_push($all_roles, 'guest', 'user');

        foreach ($all_roles as $slug) {
            // Now $slug correctly represents each role slug
            // Added !important to ensure this rule overrides others
            echo ".$site_prefix-$slug { display: none !important; }\n";
        }

        exit;
    }
}