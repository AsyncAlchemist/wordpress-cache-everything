<?php

// Adjusted function to only display the readme content
function cache_everything_display_readme() {
    $readme_path = plugin_dir_path(__FILE__) . '../readme.md';
    if (file_exists($readme_path)) {
        $readme_content = file_get_contents($readme_path);
        // Escape the content for JavaScript
        $readme_content_js = json_encode($readme_content);
        echo '<div id="readmeContent" class="wce_wrap"></div>'; // Container for the converted HTML
        echo "<script src=\"https://cdn.jsdelivr.net/npm/showdown@1.9.1/dist/showdown.min.js\"></script>";
        echo "<script>
            document.addEventListener('DOMContentLoaded', function() {
                var converter = new showdown.Converter(),
                text = $readme_content_js,
                html = converter.makeHtml(text);
                document.getElementById('readmeContent').innerHTML = html;
            });
        </script>";
    } else {
        // Print out the full path attempted for debugging purposes
        echo '<div class="wrap"><h1>Readme File Not Found</h1><p>Attempted path: ' . esc_html($readme_path) . '</p></div>';
    }
}