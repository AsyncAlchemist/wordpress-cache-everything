# Cache Everything WordPress Plugin

The Cache Everything plugin is designed to enhance the performance of WordPress sites by caching dynamic aspects of the site, including HTML for logged-in users. This plugin dynamically generates CSS and JavaScript based on user roles, ensuring that cached content is personalized and up-to-date.

## Features

- **Dynamic JavaScript and CSS**: Generates JavaScript and CSS files dynamically based on the user's login status and roles.
- **Docker Support**: Includes a Docker Compose configuration for easy testing/development setup.

## Installation

1. **Clone the Plugin**: Clone this repository into your WordPress plugins directory.
    ```bash
    git clone https://github.com/AsyncAlchemist/cache-everything.git wp-content/plugins/cache-everything
    ```
2. **Activate the Plugin**: Navigate to the WordPress admin panel, go to Plugins, and activate the "Cache Everything" plugin.

## Usage

Once activated, the plugin automatically starts caching JavaScript and CSS files dynamically. It also adds a custom admin menu where you can view the plugin's readme file.

### Viewing the Readme File

Navigate to the "Cache Everything" menu in the WordPress admin panel to view the plugin's readme file.

## Configuration

No additional configuration is required. However, you can customize the plugin's behavior by editing its PHP and JavaScript files.

### Customizing CSS and JavaScript

Edit the `public/js/cache-everything.js` file to modify the client-side logic, such as how user roles are handled and CSS is updated dynamically.

### REST API Endpoint

The plugin registers a custom REST API endpoint at `/wp/v2/user_status` that returns the user's login status and roles.

## Docker Support

The plugin includes a `docker-compose.yml` file for easy setup and deployment using Docker. This configuration sets up WordPress, MySQL, phpMyAdmin, and Cloudflared services.

To use Docker, run:

`docker-compose up -d`

## Development

### Adding New Features
To add new features or modify existing ones, edit the PHP files in the plugin directory and the JavaScript files in the `public/js` directory.

### Debugging
Use the `cache_everything_debug_log` function to log custom debug messages to the plugin's log file for troubleshooting.

### Contributing
Contributions are welcome. Please fork the repository, make your changes, and submit a pull request.

### License
This plugin is open-source and licensed under the MIT License.
