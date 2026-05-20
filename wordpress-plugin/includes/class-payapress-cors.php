<?php
defined( 'ABSPATH' ) || exit;

/**
 * Handles CORS headers so the Next.js frontend can call the REST API.
 */
class Payapress_CORS {

    public function init() {
        add_action( 'rest_api_init', [ $this, 'add_cors_headers' ], 15 );
    }

    public function add_cors_headers() {
        $allowed_origin = get_option( 'payapress_frontend_url', '' );

        if ( empty( $allowed_origin ) ) {
            return;
        }

        remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );

        add_filter( 'rest_pre_serve_request', function ( $value ) use ( $allowed_origin ) {
            header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $allowed_origin ) );
            header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
            header( 'Access-Control-Allow-Credentials: true' );
            header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce' );
            return $value;
        } );
    }
}
