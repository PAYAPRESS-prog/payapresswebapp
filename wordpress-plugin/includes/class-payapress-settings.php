<?php
defined( 'ABSPATH' ) || exit;

class Payapress_Settings {

    public function init() {
        add_action( 'admin_menu',  [ $this, 'add_menu' ] );
        add_action( 'admin_init',  [ $this, 'register_settings' ] );
        add_action( 'admin_head',  [ $this, 'inline_styles' ] );
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

    public function inline_styles() {
        $screen = get_current_screen();
        if ( ! $screen || 'settings_page_payapress-webapp' !== $screen->id ) return;
        echo '<style>
            .pp-card { background:#fff; border:1px solid #ddd; border-radius:6px; padding:20px 24px; margin-top:20px; }
            .pp-card h2 { margin-top:0; font-size:14px; font-weight:600; color:#1d2327; }
            .pp-shortcode { background:#f6f7f7; border:1px solid #ddd; border-radius:4px; padding:10px 14px; font-family:monospace; font-size:13px; line-height:1.9; }
            .pp-shortcode span { color:#0073aa; }
            .pp-badge { display:inline-block; background:#00a32a; color:#fff; font-size:11px; font-weight:600; border-radius:3px; padding:2px 7px; vertical-align:middle; margin-left:6px; }
        </style>' . "\n";
    }

    public function render_page() {
        $url = get_option( 'payapress_frontend_url', '' );
        ?>
        <div class="wrap">
            <h1><?php esc_html_e( 'PAYAPRESS WebApp', 'payapress-webapp' ); ?></h1>

            <form method="post" action="options.php">
                <?php settings_fields( 'payapress_settings' ); ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row">
                            <label for="payapress_frontend_url">
                                <?php esc_html_e( 'Frontend URL', 'payapress-webapp' ); ?>
                            </label>
                        </th>
                        <td>
                            <input
                                type="url"
                                id="payapress_frontend_url"
                                name="payapress_frontend_url"
                                value="<?php echo esc_attr( $url ); ?>"
                                class="regular-text"
                                placeholder="https://your-app.vercel.app"
                            />
                            <p class="description">
                                <?php esc_html_e( 'The URL of your deployed PAYAPRESS Next.js app.', 'payapress-webapp' ); ?>
                            </p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>

            <?php if ( $url ) : ?>
            <div class="pp-card">
                <h2>
                    <?php esc_html_e( 'Shortcode Usage', 'payapress-webapp' ); ?>
                    <span class="pp-badge">Ready</span>
                </h2>
                <p><?php esc_html_e( 'Add the shortcode to any page or post:', 'payapress-webapp' ); ?></p>
                <div class="pp-shortcode">
                    <span>[payapress_app]</span><br>
                    <span>[payapress_app height="800"]</span><br>
                    <span>[payapress_app height="700" width="100%"]</span>
                </div>
                <p style="margin-top:14px;">
                    <?php esc_html_e( 'Embed URL:', 'payapress-webapp' ); ?>
                    <a href="<?php echo esc_url( trailingslashit( $url ) . 'embed' ); ?>" target="_blank">
                        <?php echo esc_html( trailingslashit( $url ) . 'embed' ); ?>
                    </a>
                </p>
            </div>
            <?php else : ?>
            <div class="notice notice-warning inline" style="margin-top:20px;">
                <p><?php esc_html_e( 'Set your frontend URL above to enable the shortcode.', 'payapress-webapp' ); ?></p>
            </div>
            <?php endif; ?>
        </div>
        <?php
    }
}
