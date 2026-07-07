// Busbar Calculator — Windows shell.
// A native window around https://calculator.payapress.com with:
//  - navigation policy: product + Google-auth origins render inside,
//    everything else opens in the system browser
//  - single-instance (second launch focuses the existing window)
//  - persisted window size/position (window-state plugin)
//  - busbar:// deep links routed onto the site
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, Url, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_opener::OpenerExt;

const APP_ORIGIN: &str = "https://calculator.payapress.com";

/// Origins allowed to render inside the shell window.
fn allowed(url: &Url) -> bool {
    match url.scheme() {
        // local bootstrap page (tauri://localhost on macOS/Linux) and blank frames
        "tauri" | "about" | "data" => true,
        "http" | "https" => matches!(
            url.host_str(),
            // On WINDOWS the bundled bootstrap page is served from
            // http(s)://tauri.localhost — without this entry the very first
            // navigation is treated as foreign: the window stays black and
            // the system browser opens tauri.localhost (connection refused).
            Some("tauri.localhost")
                | Some("calculator.payapress.com")
                | Some("www.payapress.com")
                // Google Identity Services sign-in chain
                | Some("accounts.google.com")
                | Some("accounts.youtube.com")
        ),
        _ => false,
    }
}

/// Map a busbar://<path> deep link onto the product URL.
fn deep_link_target(link: &Url) -> String {
    let joined = format!("{}{}", link.host_str().unwrap_or(""), link.path());
    let path = joined.trim_matches('/');
    if path.is_empty() {
        format!("{APP_ORIGIN}/busbar-calculator?src=windows-app")
    } else {
        format!("{APP_ORIGIN}/{path}?src=windows-app")
    }
}

fn navigate_main(app: &tauri::AppHandle, url: &str) {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.eval(format!("window.location.replace('{url}')"));
        let _ = win.unminimize();
        let _ = win.set_focus();
    }
}

fn focus_main(app: &tauri::AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.unminimize();
        let _ = win.set_focus();
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            // Second launch: follow a busbar:// link if present, else focus.
            if let Some(link) = argv.iter().find(|a| a.starts_with("busbar://")) {
                if let Ok(url) = Url::parse(link) {
                    navigate_main(app, &deep_link_target(&url));
                    return;
                }
            }
            focus_main(app);
        }))
        .setup(|app| {
            let handle = app.handle().clone();
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("Busbar Calculator")
                .inner_size(1280.0, 860.0)
                .min_inner_size(380.0, 640.0)
                .center()
                .background_color(tauri::window::Color(13, 14, 16, 255))
                .on_navigation(move |url| {
                    if allowed(url) {
                        true
                    } else {
                        // hand anything foreign to the system browser
                        let _ = handle.opener().open_url(url.as_str(), None::<String>);
                        false
                    }
                })
                .build()?;

            // Cold-start deep link (busbar://…): navigate once the
            // bootstrap page has had a moment to exist.
            let args: Vec<String> = std::env::args().collect();
            if let Some(link) = args.iter().find(|a| a.starts_with("busbar://")) {
                if let Ok(url) = Url::parse(link) {
                    let target = deep_link_target(&url);
                    let handle = app.handle().clone();
                    tauri::async_runtime::spawn(async move {
                        std::thread::sleep(std::time::Duration::from_millis(800));
                        navigate_main(&handle, &target);
                    });
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Busbar Calculator");
}
