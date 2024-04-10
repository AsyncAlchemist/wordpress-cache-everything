<?php

/**
 * Register settings for the Cache Everything plugin.
 */
function cache_everything_register_settings() {
    // Register settings for cache times first
    register_setting('cache_everything_settings', 'cache_everything_max_age');
    register_setting('cache_everything_settings', 'cache_everything_stale_while_revalidate');

    // Add a new section for cache times at the beginning
    add_settings_section(
        'cache_everything_cache_times_section', // Unique ID for the section
        'Cache Times', // Title of the section
        'cache_everything_cache_times_section_callback', // Callback function to render the section
        'cache-everything-settings' // Page on which to add the section
    );

    // Add settings fields for cache times in the new section
    add_settings_field(
        'cache_everything_max_age',
        'Cache Max Age (seconds)',
        'cache_everything_max_age_callback',
        'cache-everything-settings',
        'cache_everything_cache_times_section' // Use the new section ID
    );

    add_settings_field(
        'cache_everything_stale_while_revalidate',
        'Stale While Revalidate (seconds)',
        'cache_everything_stale_while_revalidate_callback',
        'cache-everything-settings',
        'cache_everything_cache_times_section' // Use the new section ID
    );
    // Register the new caching options
    register_setting('cache_everything_settings', 'cache_everything_options');

    // Add the Caching Options section
    add_settings_section(
        'cache_everything_caching_section',
        'Caching Options',
        'cache_everything_caching_section_callback',
        'cache-everything-settings'
    );

    // Define the caching options with descriptions
    $options = [
        'is_front_page' => ['label' => 'Front Page', 'description' => 'The main landing page of your site.'],
        'is_home' => ['label' => 'Home', 'description' => 'The page showing your latest posts, often the same as the front page.'],
        'is_singular' => ['label' => 'Singular', 'description' => 'Any single post, page, or attachment.'],
        'is_single' => ['label' => 'Single Post', 'description' => 'A single post. Does not include attachments or pages.'],
        'is_page' => ['label' => 'Page', 'description' => 'A single page. Does not include posts or attachments.'],
        'is_attachment' => ['label' => 'Attachment', 'description' => 'An attachment page, displaying a single attachment.'],
        'is_archive' => ['label' => 'Archive', 'description' => 'Any archive page, including category, tag, author, or date-based archives.'],
        'is_post_type_archive' => ['label' => 'Post Type Archive', 'description' => 'An archive page for a custom post type.'],
        'is_category' => ['label' => 'Category', 'description' => 'A category archive, showing posts from a specific category.'],
        'is_tag' => ['label' => 'Tag', 'description' => 'A tag archive, showing posts tagged with a specific tag.'],
        'is_author' => ['label' => 'Author', 'description' => 'An author archive, showing posts by a specific author.'],
        'is_date' => ['label' => 'Date', 'description' => 'A date-based archive, for specific years, months, or days.'],
        'is_year' => ['label' => 'Year', 'description' => 'A yearly archive, showing posts from a specific year.'],
        'is_month' => ['label' => 'Month', 'description' => 'A monthly archive, showing posts from a specific month.'],
        'is_day' => ['label' => 'Day', 'description' => 'A daily archive, showing posts from a specific day.'],
        'is_time' => ['label' => 'Time', 'description' => 'A time-based archive, often unused.'],
        'is_search' => ['label' => 'Search', 'description' => 'A search results page, showing posts matching a search query.'],
        'is_404' => ['label' => '404 Page', 'description' => 'The page shown when no content is found (error 404).'],
        'is_paged' => ['label' => 'Paged', 'description' => 'For pages of posts that are split into multiple pages.'],
    ];

    // Add fields for each caching option
    foreach ($options as $option => $details) {
        add_settings_field(
            $option,
            $details['label'],
            'cache_everything_checkbox_callback',
            'cache-everything-settings',
            'cache_everything_caching_section',
            ['id' => $option, 'description' => $details['description']]
        );
    }

        // Continue with the rest of the settings registration as before
    // Register a new setting for Cache Everything to store the debug mode option
    register_setting('cache_everything_settings', 'cache_everything_debug_mode');

    // Add the Debug Mode section with an explanation about its functionality
    add_settings_section(
        'cache_everything_debug_section',
        'Debug Mode Settings',
        'cache_everything_debug_section_callback',
        'cache-everything-settings'
    );

    // Add the debug mode option field to the Debug Mode section, explaining its impact on JavaScript console logging
    add_settings_field(
        'cache_everything_debug_mode',
        'Debug Mode',
        'cache_everything_debug_mode_callback',
        'cache-everything-settings',
        'cache_everything_debug_section'
    );
}

// Callback for the new section
function cache_everything_cache_times_section_callback() {
    echo '<p>Configure cache expiration times:</p>';
}

function cache_everything_caching_section_callback() {
    echo '<p>Select the types of content for which you want to enable caching:</p>';
}

function cache_everything_debug_mode_callback() {
    $debug_mode = get_option('cache_everything_debug_mode');
    echo '<input type="checkbox" id="cache_everything_debug_mode" name="cache_everything_debug_mode" value="1" ' . checked(1, $debug_mode, false) . '/>';
    echo '<label for="cache_everything_debug_mode">Enable Debug Mode</label>';
    echo '<p class="description">Enables console.log prints in JavaScript for client-side debugging.</p>';
}

function cache_everything_checkbox_callback($args) {
    $options = get_option('cache_everything_options');
    $checked = isset($options[$args['id']]) ? checked($options[$args['id']], 1, false) : '';
    echo "<input type='checkbox' id='{$args['id']}' name='cache_everything_options[{$args['id']}]' value='1' $checked>";
    echo "<label for='{$args['id']}'>{$args['description']}</label>";
}

// Callback for max-age
function cache_everything_max_age_callback() {
    $value = get_option('cache_everything_max_age', 28800); // Default to 28800 if not set
    // Explanation of Cloudflare minimum values by plan
    $explanation = <<<EXPLANATION
    <p>Minimum Browser Cache TTL based on Cloudflare plan:</p>
    <ul>
        <li>Free Plan: 7200 seconds (2 hours)</li>
        <li>Pro Plan: 3600 seconds (1 hour)</li>
        <li>Business Plan: 1 second</li>
        <li>Enterprise Plan: 1 second</li>
    </ul>
    <p>Please ensure the value respects the minimum required by your Cloudflare plan.</p>
EXPLANATION;

    echo "<input type='number' id='cache_everything_max_age' name='cache_everything_max_age' value='" . esc_attr($value) . "' />";
    echo $explanation;
}

// Callback for stale-while-revalidate
function cache_everything_stale_while_revalidate_callback() {
    $value = get_option('cache_everything_stale_while_revalidate', 86400); // Default to 86400 if not set
    echo "<input type='number' id='cache_everything_stale_while_revalidate' name='cache_everything_stale_while_revalidate' value='" . esc_attr($value) . "' />";
    echo '<p class="description">Stale While Revalidate allows the use of stale resources while new ones are being revalidated in the background, ensuring users get responses without delay.</p>';
}

// Adjusted function to display settings
function cache_everything_settings_page() {
    // Continue with the settings form
    echo '<form action="options.php" method="post">';
    settings_fields('cache_everything_settings');
    do_settings_sections('cache-everything-settings'); // Adjusted to match the settings page slug
    submit_button();
    echo '</form>';
}

function cache_everything_debug_section_callback() {
    echo '<p>Enable or disable debug mode:</p>';
}
