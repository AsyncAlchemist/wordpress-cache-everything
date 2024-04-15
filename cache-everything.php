<?php
/**
 * Plugin Name: Cache Everything
 * Plugin URI: https://github.com/AsyncAlchemist
 * Description: A simple plugin to cache everything in Wordpress.
 * Version: 0.23
 * Author: Taylor Selden
 * Author URI: https://github.com/AsyncAlchemist
 */
define('CACHE_EVERYTHING_JS_URL', 'wp-content/plugins/cache-everything/js');
define('CACHE_EVERYTHING_CSS_URL', 'wp-content/plugins/cache-everything/css');
define('CACHE_EVERYTHING_VERSION', '0.23');

require_once(plugin_dir_path(__FILE__) . 'handle-js-request.php');
require_once(plugin_dir_path(__FILE__) . 'handle-css-request.php');
require_once(plugin_dir_path(__FILE__) . 'helpers.php');
require_once(plugin_dir_path(__FILE__) . 'admin/menu.php');
require_once(plugin_dir_path(__FILE__) . 'admin/cache-settings.php');
require_once(plugin_dir_path(__FILE__) . 'admin/prefetch-settings.php');
require_once(plugin_dir_path(__FILE__) . 'admin/readme.php');
require_once(plugin_dir_path(__FILE__) . 'admin/css-classes.php');

/**
 * Flushes rewrite rules on plugin activation and deactivation.
 */
function cache_everything_flush_rewrite_rules() {
    // Add the rewrite rule and then flush
    cache_everything_add_rewrite_rule();
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'cache_everything_flush_rewrite_rules');
register_activation_hook(__FILE__, 'cache_everything_activate');
register_activation_hook(__FILE__, 'cache_everything_set_default_prefetch_settings');
register_deactivation_hook(__FILE__, 'cache_everything_flush_rewrite_rules');

/**
 * Registers a query variable for handling JavaScript requests.
 * 
 * @param array $vars The array of existing query variables.
 * @return array The modified array including the new query variable.
 */
function cache_everything_register_query_var($vars) {
    $vars[] = 'cache_everything_js';
    $vars[] = 'cache_everything_css';
    return $vars;
}
add_filter('query_vars', 'cache_everything_register_query_var');

/**
 * Adds a rewrite rule for serving the dynamic JavaScript file without the .js extension,
 * simulating a path that includes the plugin directory.
 */
function cache_everything_add_rewrite_rule() {
    // This rule simulates the path. Note that this does not actually place the file in that directory.
    add_rewrite_rule(CACHE_EVERYTHING_JS_URL . '$', 'index.php?cache_everything_js=1', 'top');
    add_rewrite_rule(CACHE_EVERYTHING_CSS_URL . '$', 'index.php?cache_everything_css=1', 'top');
}
add_action('init', 'cache_everything_add_rewrite_rule');
add_action('template_redirect', 'cache_everything_handle_js_request');
add_action('template_redirect', 'cache_everything_handle_css_request');


/**
 * Enqueues the dynamic JavaScript file.
 */
function cache_everything_enqueue_scripts() {
    $all_roles = cache_everything_get_role_slugs();

    wp_enqueue_script('cache-everything', plugins_url('/public/js/cache-everything.js', __FILE__), array(), null, true);

    // Determine if the site's permalink structure uses trailing slashes
    $permalink_structure = get_option('permalink_structure');
    $use_trailing_slashes = substr($permalink_structure, -1) === '/';

    // Ensure the site URL does not end with a slash
    $site_url = rtrim(site_url(), '/');

    // Combine site URL with the CACHE_EVERYTHING_JS_URL to send a full URL without risking a double slash
    // Append a trailing slash if the site uses trailing slashes in the permalink structure
    $js_full_url = $site_url . '/' . CACHE_EVERYTHING_JS_URL . ($use_trailing_slashes ? '/' : '');

    // Combine site URL with the CACHE_EVERYTHING_CSS_URL to send a full URL without risking a double slash
    // Append a trailing slash if the site uses trailing slashes in the permalink structure
    $css_full_url = $site_url . '/' . CACHE_EVERYTHING_CSS_URL . ($use_trailing_slashes ? '/' : '');

    wp_enqueue_style('cache-everything', $css_full_url, array(), null, 'all');

    $site_prefix = get_site_prefix(); // Retrieve the site prefix using the helper function

    $debug_mode = get_option('cache_everything_debug_mode', '0'); // Default to '0' if not set

    // Retrieve the prefetching options
    $prefetch_enabled = get_option('cache_everything_prefetch_enable', '0');
    $prefetch_patterns = get_option('cache_everything_prefetch_patterns', array());

    $patterns_starts_with = array();
    $patterns_contains = array();
    $patterns_regex = array();

    foreach ($prefetch_patterns as $pattern_config) {
        switch ($pattern_config['operator']) {
            case 'starts_with':
                $patterns_starts_with[] = $pattern_config['pattern'];
                break;
            case 'contains':
                $patterns_contains[] = $pattern_config['pattern'];
                break;
            case 'regex':
                $patterns_regex[] = $pattern_config['pattern'];
                break;
        }
    }

    wp_localize_script('cache-everything', 'wce_Data', array(
        'roles' => $all_roles,
        'jsUrl' => $js_full_url,
        'cssUrl' => $css_full_url,
        'sitePrefix' => $site_prefix,
        'debugMode' => $debug_mode,
        'prefetchEnabled' => $prefetch_enabled,
        'prefetchStartsWith' => $patterns_starts_with,
        'prefetchContains' => $patterns_contains,
        'prefetchRegex' => $patterns_regex,
    ));

}
add_action('wp_enqueue_scripts', 'cache_everything_enqueue_scripts');

function cache_everything_modify_headers() {
    // Check if the admin bar is showing, and if so, return early to avoid caching
    if (is_admin_bar_showing()) {
        return;
    }

    // Retrieve the options with a default to an empty array if not set
    $options = get_option('cache_everything_cache_options', []);

    // Retrieve cache times with defaults
    $max_age = get_option('cache_everything_max_age', 28800);
    $stale_while_revalidate = get_option('cache_everything_stale_while_revalidate', 86400);

    // Calculate the Expires header value
    $expires_time = gmdate('D, d M Y H:i:s', time() + $max_age) . ' GMT';

    // Loop through each option and apply headers if enabled
    foreach ($options as $option => $value) {
        if ($value && function_exists($option) && call_user_func($option)) {
            header("Cache-Control: public, max-age=$max_age, stale-while-revalidate=$stale_while_revalidate");
            header("Expires: $expires_time");
            header("X-WCE-Cache: public, max-age=$max_age, stale-while-revalidate=$stale_while_revalidate");
            break; // Stop the loop once a match is found and header is set
        }
    }
}
add_action('template_redirect', 'cache_everything_modify_headers');