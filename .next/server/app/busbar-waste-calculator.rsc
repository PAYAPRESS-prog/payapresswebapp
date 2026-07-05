1:"$Sreact.fragment"
2:I[588,["7177","static/chunks/app/layout-18034aa669ece0a6.js"],"default"]
3:I[717,["7177","static/chunks/app/layout-18034aa669ece0a6.js"],"FxAnalytics"]
4:I[1402,["7177","static/chunks/app/layout-18034aa669ece0a6.js"],""]
5:I[9766,[],""]
6:I[960,["8039","static/chunks/app/error-518059702c0e8849.js"],"default"]
7:I[8924,[],""]
8:I[2619,["2619","static/chunks/2619-3c9e02e22d10480a.js","4426","static/chunks/app/busbar-waste-calculator/page-64fe8376549c8fcb.js"],""]
e:I[4062,["4219","static/chunks/app/global-error-2d3366cc2d6de52d.js"],"default"]
:HL["/_next/static/css/41c63bbdc1c7f955.css","style"]
9:T132e,
          window.__pp_errs = [];
          var __pp_errDiv = null;

          // Hard-reload with cache-bust after clearing all SW caches.
          // Called when stale chunks are detected so the browser fetches fresh HTML.
          function __pp_chunkReload() {
            try {
              var hasSW = 'serviceWorker' in navigator;
              var hasCaches = 'caches' in window;
              var dest = window.location.pathname + '?_pp=' + Date.now() + window.location.hash;
              var p = (hasSW && hasCaches)
                ? navigator.serviceWorker.getRegistrations()
                    .then(function(r) { return Promise.all(r.map(function(x) { return x.unregister(); })); })
                    .then(function() { return caches.keys(); })
                    .then(function(k) { return Promise.all(k.map(function(c) { return caches.delete(c); })); })
                : Promise.resolve();
              p.then(function() { window.location.href = dest; })
               .catch(function() { window.location.href = dest; });
            } catch(ex) {
              window.location.reload(true);
            }
          }

          function __pp_showErr(msg) {
            try {
              if (!__pp_errDiv) {
                __pp_errDiv = document.createElement('div');
                __pp_errDiv.setAttribute('style',
                  'position:fixed;top:0;left:0;right:0;z-index:99999;' +
                  'background:#1a0000;border-bottom:2px solid #ef4444;' +
                  'color:#fca5a5;padding:12px 16px;font:12px/1.5 monospace;' +
                  'white-space:pre-wrap;word-break:break-all;max-height:60vh;overflow:auto;');
                __pp_errDiv.innerHTML = '<b style="color:#ef4444">JS ERROR — Busbar Calculator (send this to dev):</b>\n';
                document.body.appendChild(__pp_errDiv);
              }
              __pp_errDiv.innerHTML += msg + '\n';
            } catch(ex) {}
          }

          // URL-based cycle detection (NOT sessionStorage) avoids "stuck flag"
          // bug where a previously failed recovery permanently blocks future
          // auto-fixes. ?_pp=<timestamp> is added on recovery; if it's already
          // there we don't loop.
          function __pp_alreadyTried() {
            return window.location.search.indexOf('_pp=') !== -1;
          }

          window.addEventListener('error', function(e) {
            var msg  = e.message  || '';
            var file = e.filename || '';
            // Stale chunk: script tag for an old content-hash fails to load (404)
            var isChunk =
              msg.indexOf('Loading chunk') !== -1 ||
              msg.indexOf('ChunkLoadError') !== -1 ||
              (file.indexOf('/_next/static/') !== -1 &&
               (msg === '' || msg === 'Script error.' || msg === 'Script error'));
            if (isChunk) {
              e.preventDefault();
              if (!__pp_alreadyTried()) { __pp_chunkReload(); return; }
              // Already tried recovery — show the error so the user knows
              __pp_showErr('Stale chunk after recovery — please hard-refresh');
              return;
            }
            var m = msg + '\n  @ ' + file + ':' + e.lineno + ':' + e.colno;
            if (e.error && e.error.stack) m += '\n' + e.error.stack;
            window.__pp_errs.push(m);
            __pp_showErr(m);
          });

          // Also catch <script> tag and <link> tag load failures (404). These
          // fire a non-bubbling 'error' on the element itself, not on window,
          // so the window 'error' handler above misses them unless we capture.
          window.addEventListener('error', function(e) {
            var t = e.target;
            if (!t || t === window) return;
            var src = t.src || t.href || '';
            if (src.indexOf('/_next/static/') !== -1) {
              if (!__pp_alreadyTried()) { __pp_chunkReload(); return; }
              __pp_showErr('Stale asset after recovery: ' + src);
            }
          }, true); // capture phase

          window.addEventListener('unhandledrejection', function(e) {
            var reason = e.reason;
            var rMsg = reason ? (reason.message || String(reason)) : '';
            // Stale chunk via dynamic import (Next.js lazy-loads chunks as promises)
            var isChunk =
              rMsg.indexOf('Loading chunk') !== -1 ||
              rMsg.indexOf('ChunkLoadError') !== -1;
            if (isChunk) {
              e.preventDefault();
              if (!__pp_alreadyTried()) { __pp_chunkReload(); return; }
              __pp_showErr('Stale chunk after recovery — please hard-refresh');
              return;
            }
            var m = 'Unhandled Promise: ' + rMsg;
            if (reason && reason.stack) m += '\n' + reason.stack;
            window.__pp_errs.push(m);
            __pp_showErr(m);
          });
        0:{"P":null,"b":"q3Mqm_CcLH3ovpChmga9U","p":"","c":["","busbar-waste-calculator"],"i":false,"f":[[["",{"children":["busbar-waste-calculator",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/41c63bbdc1c7f955.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","style":{"background":"#0b0d10"},"suppressHydrationWarning":true,"children":[["$","meta",null,{"httpEquiv":"Cache-Control","content":"no-cache, no-store, must-revalidate"}],["$","meta",null,{"httpEquiv":"Pragma","content":"no-cache"}],["$","meta",null,{"httpEquiv":"Expires","content":"0"}],["$","style",null,{"dangerouslySetInnerHTML":{"__html":"html,body{background:#0b0d10!important;color:#f5f7fa;margin:0;padding:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}*{box-sizing:border-box}"}}],["$","body",null,{"style":{"background":"#0b0d10"},"children":[["$","$L2",null,{}],["$","$L3",null,{}],[["$","$L4",null,{"src":"https://www.googletagmanager.com/gtag/js?id=G-NXYRQ0MNE4","strategy":"afterInteractive"}],["$","$L4",null,{"id":"ga4-init","strategy":"afterInteractive","children":"\n              window.dataLayer = window.dataLayer || [];\n              function gtag(){dataLayer.push(arguments);}\n              gtag('js', new Date());\n              gtag('config', 'G-NXYRQ0MNE4');\n            "}]],["$","$L5",null,{"parallelRouterKey":"children","error":"$6","errorStyles":[],"errorScripts":[],"template":["$","$L7",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","div",null,{"style":{"minHeight":"100svh","background":"#060608","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","padding":"2rem","fontFamily":"system-ui, sans-serif","textAlign":"center","gap":"1.25rem"},"children":[["$","svg",null,{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 64 64","width":"56","height":"56","children":[["$","defs",null,{"children":["$","linearGradient",null,{"id":"nfg","x1":"0","y1":"0","x2":"1","y2":"1","children":[["$","stop",null,{"offset":"0%","stopColor":"#e8953a"}],["$","stop",null,{"offset":"100%","stopColor":"#a85c18"}]]}]}],["$","rect",null,{"width":"64","height":"64","rx":"14","fill":"url(#nfg)"}],["$","rect",null,{"x":"12","y":"18","width":"40","height":"8","rx":"2.5","fill":"white","opacity":"0.55"}],["$","rect",null,{"x":"12","y":"28","width":"40","height":"8","rx":"2.5","fill":"white","opacity":"0.95"}],["$","rect",null,{"x":"12","y":"38","width":"40","height":"8","rx":"2.5","fill":"white","opacity":"0.35"}]]}],["$","p",null,{"style":{"color":"#f0f0f0","fontWeight":700,"fontSize":"1.5rem","margin":0},"children":"404"}],["$","p",null,{"style":{"color":"#a1a1aa","fontSize":"0.9rem","maxWidth":"22rem","lineHeight":1.6,"margin":0},"children":"This page doesn't exist. Head back to the calculator."}],["$","$L8",null,{"href":"/","style":{"display":"inline-block","background":"linear-gradient(135deg,#cd7f32,#b87333)","color":"#fff","borderRadius":"0.5rem","padding":"0.7rem 2rem","fontSize":"0.9rem","fontWeight":600,"textDecoration":"none","marginTop":"0.5rem"},"children":"Go to Calculator"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}],["$","$L4",null,{"id":"err-capture","strategy":"beforeInteractive","children":"$9"}],"$La"]}]]}]]}],{"children":["busbar-waste-calculator","$Lb",{"children":["__PAGE__","$Lc",{},null,false]},null,false]},null,false],"$Ld",false]],"m":"$undefined","G":["$e",[]],"s":false,"S":true}
11:I[4431,[],"OutletBoundary"]
13:I[5278,[],"AsyncMetadataOutlet"]
15:I[4431,[],"ViewportBoundary"]
17:I[4431,[],"MetadataBoundary"]
18:"$Sreact.suspense"
f:Ta9d,
          (function() {
            function run() {
              // Check for cache-bust param BEFORE removing it — used below to
              // detect that we already attempted a redirect this navigation.
              var alreadyRedirected = window.location.search.indexOf('_pp=') !== -1;

              // Clean up cache-bust param from URL bar (cosmetic)
              if (alreadyRedirected) {
                try { history.replaceState(null, '', window.location.pathname + window.location.hash); } catch(e) {}
              }

              var cssLoaded = !!(getComputedStyle(document.documentElement)
                .getPropertyValue('--color-copper-500') || '').trim();

              // CSS missing AND this is not already a post-redirect load:
              // clear all SW registrations + caches, then hard-navigate with a
              // cache-busting query param so the browser fetches fresh HTML.
              // Using URL-state (not sessionStorage) avoids the "stuck flag" bug
              // where a previously failed redirect blocks all future auto-fixes.
              if (!cssLoaded && !alreadyRedirected) {
                var hasSW = 'serviceWorker' in navigator;
                var hasCaches = 'caches' in window;
                var p = (hasSW && hasCaches)
                  ? navigator.serviceWorker.getRegistrations()
                      .then(function(r) { return Promise.all(r.map(function(x) { return x.unregister(); })); })
                      .then(function() { return caches.keys(); })
                      .then(function(k) { return Promise.all(k.map(function(c) { return caches.delete(c); })); })
                  : Promise.resolve();
                p.then(function() {
                  window.location.href = window.location.pathname + '?_pp=' + Date.now() + window.location.hash;
                }).catch(function() {
                  window.location.href = window.location.pathname + '?_pp=' + Date.now() + window.location.hash;
                });
                return;
              }

              // CSS is loaded (or we already redirected once) — register SW normally.
              // Also clear legacy stuck-flags from older versions.
              try {
                sessionStorage.removeItem('pp_css_fix');
                sessionStorage.removeItem('pp_chunk_retry');
              } catch(e) {}
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(function(){});
              }
            }
            if (document.readyState === 'complete') {
              run();
            } else {
              window.addEventListener('load', run);
            }
          })();
        a:["$","$L4",null,{"id":"sw-register","strategy":"afterInteractive","children":"$f"}]
b:["$","$1","c",{"children":[null,["$","$L5",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L7",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]
10:T6e5,{"@context":"https://schema.org","@graph":[{"@type":"WebApplication","@id":"https://calculator.payapress.com/busbar-waste-calculator#app","name":"Busbar Waste Calculator","url":"https://calculator.payapress.com/busbar-waste-calculator","description":"Calculates blade kerf loss per cut and punch-out material waste for copper and aluminum busbars, in kg and live market cost.","applicationCategory":"EngineeringApplication","operatingSystem":"Any (web browser)","isAccessibleForFree":true,"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"publisher":{"@id":"https://calculator.payapress.com/#organization"},"inLanguage":"en"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://calculator.payapress.com"},{"@type":"ListItem","position":2,"name":"Busbar Calculator","item":"https://calculator.payapress.com/busbar-calculator"},{"@type":"ListItem","position":3,"name":"Waste Calculator","item":"https://calculator.payapress.com/busbar-waste-calculator"}]},{"@type":"HowTo","name":"How to calculate busbar cutting and punching waste","step":[{"@type":"HowToStep","position":1,"name":"Enter the cross-section","text":"Set the busbar width and thickness in millimeters."},{"@type":"HowToStep","position":2,"name":"Blade kerf","text":"Enter the saw blade diameter — kerf width is estimated at 1.5% of the diameter (minimum 0.5 mm) and converted to lost material per cut."},{"@type":"HowToStep","position":3,"name":"Punch-out","text":"Enter the punch diameter — the removed slug volume is computed from the hole area times the busbar thickness."},{"@type":"HowToStep","position":4,"name":"Read the cost","text":"Waste is shown in kilograms and priced at the live copper or aluminum market rate."}]}]}c:["$","$1","c",{"children":[["$","main",null,{"className":"fx-wl","children":[["$","script",null,{"type":"application/ld+json","dangerouslySetInnerHTML":{"__html":"$10"}}],["$","h1",null,{"className":"fx-wl-title","children":"Busbar Waste Calculator"}],["$","p",null,{"className":"fx-wl-sub","children":"Every saw cut and every punched hole throws away metal. This free tool tells you exactly how much — in kilograms and in money, at live copper & aluminum prices."}],["$","h2",null,{"className":"fx-wl-h2","children":"Blade kerf loss per cut"}],["$","p",null,{"className":"fx-wl-p","children":"The kerf — the slot a saw blade eats — is estimated at 1.5% of the blade diameter (never less than 0.5 mm), multiplied by your busbar cross-section. A 300 mm blade on a 100×10 mm copper bar wastes roughly 40 grams of copper on every single cut."}],["$","h2",null,{"className":"fx-wl-h2","children":"Punch-out waste"}],["$","p",null,{"className":"fx-wl-p","children":"Every punched hole removes a slug of metal: hole area × busbar thickness. The calculator converts it to weight with the exact alloy density and prices it at the live market rate — so you can quote scrap loss honestly."}],["$","h2",null,{"className":"fx-wl-h2","children":"Try it now"}],["$","p",null,{"className":"fx-wl-p","children":"The waste calculator is part of the free Busbar Calculator — create an account (10 seconds) and it unlocks together with saved history and configuration compare."}],["$","div",null,{"className":"fx-wl-cta-row","children":[["$","$L8",null,{"href":"/busbar-calculator","className":"fx-wl-cta","children":"Open Busbar Calculator"}],["$","$L8",null,{"href":"/app/waste","className":"fx-wl-cta-ghost","children":"Go to Waste Calculator"}]]}]]}],null,["$","$L11",null,{"children":["$L12",["$","$L13",null,{"promise":"$@14"}]]}]]}]
d:["$","$1","h",{"children":[null,[["$","$L15",null,{"children":"$L16"}],null],["$","$L17",null,{"children":["$","div",null,{"hidden":true,"children":["$","$18",null,{"fallback":null,"children":"$L19"}]}]}]]}]
16:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=cover, interactive-widget=resizes-visual"}],["$","meta","2",{"name":"theme-color","content":"#0b0d10"}]]
12:null
1a:I[622,[],"IconMark"]
14:{"metadata":[["$","title","0",{"children":"Busbar Waste Calculator — Kerf & Punch-Out Loss Calculator"}],["$","meta","1",{"name":"description","content":"Free busbar waste calculator: estimate blade kerf loss per cut and punch-out material waste for copper & aluminum busbars — in kilograms and live market cost."}],["$","link","2",{"rel":"author","href":"https://calculator.payapress.com"}],["$","meta","3",{"name":"author","content":"Busbar Calculator"}],["$","link","4",{"rel":"manifest","href":"/manifest.json","crossOrigin":"$undefined"}],["$","meta","5",{"name":"keywords","content":"busbar waste calculator,kerf calculator,blade kerf loss,punch-out waste,copper waste calculator,busbar scrap cost"}],["$","meta","6",{"name":"creator","content":"Busbar Calculator"}],["$","meta","7",{"name":"publisher","content":"Busbar Calculator"}],["$","meta","8",{"name":"robots","content":"index, follow"}],["$","meta","9",{"name":"googlebot","content":"index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"}],["$","link","10",{"rel":"canonical","href":"https://calculator.payapress.com/busbar-waste-calculator"}],["$","meta","11",{"name":"mobile-web-app-capable","content":"yes"}],["$","meta","12",{"name":"apple-mobile-web-app-title","content":"Busbar Calc"}],["$","meta","13",{"name":"apple-mobile-web-app-status-bar-style","content":"black-translucent"}],["$","meta","14",{"property":"og:title","content":"Busbar Waste Calculator — Kerf & Punch-Out Loss"}],["$","meta","15",{"property":"og:description","content":"Estimate blade kerf and punch-out waste for copper & aluminum busbars, priced at live market rates."}],["$","meta","16",{"property":"og:url","content":"https://calculator.payapress.com/busbar-waste-calculator"}],["$","meta","17",{"property":"og:type","content":"website"}],["$","meta","18",{"name":"twitter:card","content":"summary_large_image"}],["$","meta","19",{"name":"twitter:title","content":"Busbar Calculator"}],["$","meta","20",{"name":"twitter:description","content":"Live COMEX copper & aluminum pricing · 17 currencies · IEC standard cross-sections."}],["$","link","21",{"rel":"shortcut icon","href":"/icon"}],["$","link","22",{"rel":"icon","href":"/icon","type":"image/png","sizes":"512x512"}],["$","link","23",{"rel":"icon","href":"/favicon.svg","type":"image/svg+xml"}],["$","link","24",{"rel":"apple-touch-icon","href":"/apple-icon","sizes":"180x180","type":"image/png"}],["$","link","25",{"rel":"mask-icon","href":"/favicon.svg","color":"#cd7f32"}],["$","$L1a","26",{}]],"error":null,"digest":"$undefined"}
19:"$14:metadata"
