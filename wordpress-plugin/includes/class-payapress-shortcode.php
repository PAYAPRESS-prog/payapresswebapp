<?php
defined( 'ABSPATH' ) || exit;

/**
 * Registers the [payapress_app] shortcode for embedding the Next.js app.
 *
 * Usage: [payapress_app height="650"]
 */
class Payapress_Shortcode {

    public function init() {
        add_shortcode( 'payapress_app', [ $this, 'render' ] );
    }

    public function render( array $atts ): string {
        $app_url = get_option( 'payapress_frontend_url', '' );

        if ( empty( $app_url ) ) {
            if ( current_user_can( 'manage_options' ) ) {
                return '<p style="color:#b87333;font-family:monospace">[PAYAPRESS] Set the frontend URL in <a href="' . admin_url( 'options-general.php?page=payapress-webapp' ) . '">Settings → PAYAPRESS WebApp</a>.</p>';
            }
            return '';
        }

        $atts = shortcode_atts(
            [
                'height' => '650',
                'width'  => '100%',
                'path'   => '/embed',
            ],
            $atts,
            'payapress_app'
        );

        $src    = esc_url( rtrim( $app_url, '/' ) . '/' . ltrim( sanitize_text_field( $atts['path'] ), '/' ) );
        $height = absint( $atts['height'] );
        $width  = esc_attr( $atts['width'] );

        return sprintf(
            '<iframe src="%s" width="%s" height="%dpx" style="border:none;display:block;max-width:100%%;" loading="lazy" title="%s"></iframe>',
            $src,
            $width,
            $height,
            esc_attr__( 'PAYAPRESS App', 'payapress-webapp' )
        );
    }
}
