<?php
defined( 'ABSPATH' ) || exit;

/**
 * Registers custom REST API endpoints under /wp-json/payapress/v1/
 */
class Payapress_REST_API {

    const NAMESPACE = 'payapress/v1';

    public function register_routes() {
        add_action( 'rest_api_init', [ $this, 'init_routes' ] );
    }

    public function init_routes() {
        // Health-check endpoint
        register_rest_route( self::NAMESPACE, '/status', [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => [ $this, 'get_status' ],
            'permission_callback' => '__return_true',
        ] );

        // TODO: Add more endpoints here (e.g. /posts, /pages, /auth)
    }

    public function get_status( WP_REST_Request $request ): WP_REST_Response {
        return new WP_REST_Response( [
            'status'  => 'ok',
            'version' => PAYAPRESS_WEBAPP_VERSION,
            'site'    => get_bloginfo( 'name' ),
        ], 200 );
    }
}
