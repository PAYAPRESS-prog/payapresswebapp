<?php
defined( 'ABSPATH' ) || exit;

/**
 * Admin settings page for PAYAPRESS WebApp plugin.
 */
class Payapress_Settings {

    public function init() {
        add_action( 'admin_menu', [ $this, 'add_menu' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );
    }

    public function add_menu() {
        add_options_page(
            __( 'PAYAPRESS WebApp', 'payapress-webapp' ),
            __( 'PAYAPRESS WebApp', 'payapress-webapp' ),
            'manage_options',
            'payapress-webapp',
            [ $this, 'render_page' ]
        );
    }

    public function register_settings() {
        register_setting( 'payapress_settings', 'payapress_frontend_url', [
            'type'              => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default'           => '',
        ] );
    }

    public function render_page() {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e( 'PAYAPRESS WebApp Settings', 'payapress-webapp' ); ?></h1>
            <form method="post" action="options.php">
                <?php settings_fields( 'payapress_settings' ); ?>
                <table class="form-table">
                    <tr>
                        <th><?php esc_html_e( 'Frontend URL', 'payapress-webapp' ); ?></th>
                        <td>
                            <input
                                type="url"
                                name="payapress_frontend_url"
                                value="<?php echo esc_attr( get_option( 'payapress_frontend_url' ) ); ?>"
                                class="regular-text"
                                placeholder="https://your-nextjs-app.com"
                            />
                            <p class="description">
                                <?php esc_html_e( 'The URL of your PAYAPRESS Next.js frontend (used for CORS).', 'payapress-webapp' ); ?>
                            </p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}
