# Cache Everything Plugin

The Cache Everything plugin is designed to enhance the performance of WordPress sites by caching dynamic aspects of the site, including HTML for logged-in users. This plugin dynamically generates CSS and JavaScript based on user roles, ensuring that cached content is personalized and up-to-date.

## Features

- **Dynamic JavaScript and CSS Generation**: Tailors JavaScript and CSS files dynamically to the user's login status and roles, enhancing the personalized experience and performance.
- **Comprehensive Docker Support**: Facilitates an effortless testing and development environment setup with a Docker Compose file, ensuring compatibility and ease of use across various systems.
- **Advanced Caching Options**: Offers extensive caching configurations through the admin menu, allowing fine-tuned control over what content is cached and for how long, based on specific conditions like user roles, post types, and more.
- **Debug Mode for Developers**: Includes a debug mode that can be enabled or disabled via the admin menu, aiding developers in troubleshooting and refining the caching logic with detailed console logs.

## Installation

1. **Download the Plugin**: Visit the [Cache Everything Releases page](https://github.com/AsyncAlchemist/wordpress-cache-everything/releases) on GitHub. Download the latest release zip file to your computer.
2. **Upload the Plugin**: Log in to your WordPress admin panel. Navigate to Plugins > Add New > Upload Plugin. Choose the downloaded zip file and click "Install Now".
3. **Activate the Plugin**: After the installation is complete, click on "Activate Plugin" to activate Cache Everything on your WordPress site.

## Usage

After activating the plugin, it begins to cache JavaScript and CSS files dynamically to enhance your site's performance. To configure the plugin settings to your preference, navigate to the custom admin menu added by the plugin. Here, you can adjust caching options, debug settings, and view the plugin's readme file for more detailed information.

### Viewing the Readme File

Navigate to the "Cache Everything" menu in the WordPress admin panel to view the plugin's readme file.

## Configuration

To customize the plugin's behavior, navigate to the WordPress admin panel and access the "Cache Everything" settings page. Here, you can configure various options such as:

- **Caching Options**: Select the types of content you wish to cache, including posts, pages, and custom post types.
- **Cache Expiration Times**: Set the maximum age for cached content and configure the stale-while-revalidate behavior to ensure content freshness.
- **Debug Mode**: Enable or disable debug mode to assist in troubleshooting with detailed console logs.

## Development

To add new features or modify existing ones, edit the PHP files in the plugin directory and the JavaScript files in the `public/js` directory.

### Docker

The plugin includes a `docker-compose.yml` file for easy setup and deployment using Docker. This configuration sets up WordPress, MySQL, phpMyAdmin, and Cloudflared services to allow for easy testing in a development environment.

To use Docker, run:

`docker-compose up -d`

Make sure to create a `.env` file and define the following passwords/tokens:
```
MYSQL_ROOT_PASSWORD=YOUR_PASSWORD_HERE
WORDPRESS_DB_PASSWORD=YOUR_PASSWORD_HERE
TUNNEL_TOKEN=YOUR_CLOUDFLARE_TOKEN_HERE
```

### Contributing
Contributions are welcome. Please fork the repository, make your changes, and submit a pull request.

### License
This plugin is open-source and licensed under the MIT License.
