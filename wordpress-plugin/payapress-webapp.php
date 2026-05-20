<?php
/**
 * Plugin Name:       PAYAPRESS WebApp
 * Plugin URI:        https://github.com/PAYAPRESS-prog/payapresswebapp
 * Description:       Companion plugin for PAYAPRESS-WEBAPP — exposes custom REST API endpoints and handles frontend authentication.
 * Version:           0.1.0
 * Requires at least: 6.0
 * Requires PHP:      8.0
 * Author:            PAYAPRESS
 * License:           MIT
 * Text Domain:       payapress-webapp
 */

defined( 'ABSPATH' ) || exit;

define( 'PAYAPRESS_WEBAPP_VERSION', '0.1.0' );
define( 'PAYAPRESS_WEBAPP_DIR', plugin_dir_path( __FILE__ ) );
define( 'PAYAPRESS_WEBAPP_URL', plugin_dir_url( __FILE__ ) );

require_once PAYAPRESS_WEBAPP_DIR . 'includes/class-payapress-rest-api.php';
require_once PAYAPRESS_WEBAPP_DIR . 'includes/class-payapress-cors.php';
require_once PAYAPRESS_WEBAPP_DIR . 'includes/class-payapress-settings.php';
require_once PAYAPRESS_WEBAPP_DIR . 'includes/class-payapress-shortcode.php';

function payapress_webapp_init() {
    $rest = new Payapress_REST_API();
    $rest->register_routes();

    $cors = new Payapress_CORS();
    $cors->init();

    $settings = new Payapress_Settings();
    $settings->init();

    $shortcode = new Payapress_Shortcode();
    $shortcode->init();
}
add_action( 'plugins_loaded', 'payapress_webapp_init' );

register_activation_hook( __FILE__, 'payapress_webapp_activate' );
function payapress_webapp_activate() {
    // TODO: create DB tables, set default options, flush rewrite rules
    flush_rewrite_rules();
}

register_deactivation_hook( __FILE__, 'payapress_webapp_deactivate' );
function payapress_webapp_deactivate() {
    flush_rewrite_rules();
}
