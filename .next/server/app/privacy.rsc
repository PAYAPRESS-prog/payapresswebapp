1:"$Sreact.fragment"
2:I[588,["177","static/chunks/app/layout-4318c4a15da8c644.js"],"default"]
3:I[9766,[],""]
4:I[960,["39","static/chunks/app/error-5dcb83ea72329615.js"],"default"]
5:I[8924,[],""]
6:I[1402,["177","static/chunks/app/layout-4318c4a15da8c644.js"],""]
c:I[4062,["219","static/chunks/app/global-error-9bc3c60ab74015d3.js"],"default"]
:HL["/_next/static/css/a24f8976bffc82f1.css","style"]
7:T1322,
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
                __pp_errDiv.innerHTML = '<b style="color:#ef4444">PAYAPRESS JS ERROR (send this to dev):</b>\n';
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
        0:{"P":null,"b":"KErj6FBbLOLox-pyhWLqf","p":"","c":["","privacy"],"i":false,"f":[[["",{"children":["privacy",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/a24f8976bffc82f1.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","style":{"background":"#060608"},"suppressHydrationWarning":true,"children":[["$","meta",null,{"httpEquiv":"Cache-Control","content":"no-cache, no-store, must-revalidate"}],["$","meta",null,{"httpEquiv":"Pragma","content":"no-cache"}],["$","meta",null,{"httpEquiv":"Expires","content":"0"}],["$","style",null,{"dangerouslySetInnerHTML":{"__html":"html,body{background:#060608!important;color:#f0f0f0;margin:0;padding:0;font-family:ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}*{box-sizing:border-box}"}}],["$","body",null,{"style":{"background":"#060608"},"children":[["$","$L2",null,{}],["$","$L3",null,{"parallelRouterKey":"children","error":"$4","errorStyles":[],"errorScripts":[],"template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}],["$","$L6",null,{"id":"err-capture","strategy":"beforeInteractive","children":"$7"}],"$L8"]}]]}]]}],{"children":["privacy","$L9",{"children":["__PAGE__","$La",{},null,false]},null,false]},null,false],"$Lb",false]],"m":"$undefined","G":["$c",[]],"s":false,"S":true}
16:I[4431,[],"ViewportBoundary"]
18:I[4431,[],"MetadataBoundary"]
19:"$Sreact.suspense"
d:Ta9d,
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
        8:["$","$L6",null,{"id":"sw-register","strategy":"afterInteractive","children":"$d"}]
9:["$","$1","c",{"children":[null,["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]
a:["$","$1","c",{"children":[["$","div",null,{"style":{"minHeight":"100svh","background":"#060608","fontFamily":"'Inter', system-ui, sans-serif","color":"#d4d4d8","padding":"2rem 1.5rem 4rem"},"children":["$","div",null,{"style":{"maxWidth":"44rem","margin":"0 auto"},"children":[["$","a",null,{"href":"/","style":{"display":"inline-block","marginBottom":"2rem","color":"#cd7f32","textDecoration":"none","fontSize":"0.85rem"},"children":"← Back to Calculator"}],["$","h1",null,{"style":{"fontSize":"clamp(1.6rem, 5vw, 2.2rem)","fontWeight":900,"color":"#f0f0f0","marginBottom":"0.5rem","letterSpacing":"-0.02em"},"children":"Privacy Policy"}],["$","p",null,{"style":{"color":"#52525b","fontSize":"0.85rem","marginBottom":"2.5rem"},"children":"Last updated: 20 May 2025  ·  Effective immediately"}],["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":{"fontSize":"1rem","fontWeight":700,"color":"#cd7f32","marginBottom":"0.6rem","letterSpacing":"0.01em"},"children":"1. Overview"}],["$","p",null,{"style":{"fontSize":"0.9rem","lineHeight":1.7,"color":"#a1a1aa"},"children":"PAYAPRESS (“we”, “us”, “our”) operates the PAYAPRESS Copper Busbar Cost Calculator web application and its associated Progressive Web App (PWA). We are committed to protecting your privacy. This policy explains what information is collected and how it is used."}]]}],["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"2. Information We Collect"}],["$","p",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:1:props:style","children":[["$","strong",null,{"style":{"color":"#f0f0f0"},"children":"We do not collect, store, or transmit any personally identifiable information."}]," All calculation inputs (busbar dimensions, currency preferences, material grade) are processed entirely in your browser and are never sent to our servers."]}],["$","p",null,{"style":{"fontSize":"0.9rem","lineHeight":1.7,"color":"#a1a1aa","marginTop":"0.75rem"},"children":"The only data stored locally on your device is:"}],["$","ul",null,{"style":{"fontSize":"0.9rem","lineHeight":1.7,"color":"#a1a1aa","paddingLeft":"1.5rem","listStyleType":"disc"},"children":["$","li",null,{"style":{"marginBottom":"0.4rem"},"children":[["$","code",null,{"style":{"fontFamily":"'JetBrains Mono', 'Fira Code', monospace","fontSize":"0.82em","background":"#131318","borderRadius":"0.25rem","padding":"0.1em 0.35em","color":"#e8a855"},"children":"pp_calcs"}]," — a simple integer counter stored in",["$","code",null,{"style":"$a:props:children:0:props:children:props:children:4:props:children:3:props:children:props:children:0:props:style","children":" localStorage"}]," that tracks how many calculations you have performed (used for gamification milestones). This data never leaves your device."]}]}]]}],["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"3. Third-Party Services"}],["$","p",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:1:props:style","children":["Our server-side API routes fetch data from the following third-party services. These requests originate from ",["$","strong",null,{"style":{"color":"#f0f0f0"},"children":"our server"}],", not from your device:"]}],["$","ul",null,{"style":{"fontSize":"0.9rem","lineHeight":1.7,"color":"#a1a1aa","paddingLeft":"1.5rem","listStyleType":"disc"},"children":[["$","li",null,{"style":{"marginBottom":"0.6rem"},"children":[["$","strong",null,{"style":{"color":"#f0f0f0"},"children":"Yahoo Finance"}]," (finance.yahoo.com) — live COMEX copper price (HG=F). No personal data is transmitted."]}],["$","li",null,{"style":{"marginBottom":"0.6rem"},"children":[["$","strong",null,{"style":{"color":"#f0f0f0"},"children":"Frankfurter API"}]," (api.frankfurter.app) — live foreign-exchange rates sourced from the European Central Bank. No personal data is transmitted."]}],["$","li",null,{"style":{"marginBottom":"0.6rem"},"children":[["$","strong",null,{"style":{"color":"#f0f0f0"},"children":"FlagCDN"}]," (flagcdn.com) — flag images for the currency selector. Your browser fetches flag images directly from flagcdn.com; no personal data is included in these requests."]}]]}]]}],["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"4. Cookies"}],["$","p",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"We do not use cookies, tracking pixels, or any cross-site tracking technology."}]]}],["$","section",null,{"style":{"marginBottom":"2rem"},"children":["$Le","$Lf"]}],"$L10","$L11","$L12","$L13","$L14"]}]}],null,"$L15"]}]
b:["$","$1","h",{"children":[null,[["$","$L16",null,{"children":"$L17"}],null],["$","$L18",null,{"children":["$","div",null,{"hidden":true,"children":["$","$19",null,{"fallback":null,"children":"$L1a"}]}]}]]}]
1b:I[4431,[],"OutletBoundary"]
1d:I[5278,[],"AsyncMetadataOutlet"]
e:["$","h2",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"5. Analytics"}]
f:["$","p",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"We do not use any analytics or telemetry service (no Google Analytics, no Mixpanel, no similar tools)."}]
10:["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"6. Children’s Privacy"}],["$","p",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"This application is a professional industrial tool. We do not knowingly collect any information from children under 13 years of age."}]]}]
11:["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"7. Changes to This Policy"}],["$","p",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"We may update this Privacy Policy from time to time. The “Last updated” date at the top of this page will reflect any changes. Continued use of the application after changes constitutes acceptance of the updated policy."}]]}]
12:["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"8. Contact"}],["$","p",null,{"style":"$a:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"For privacy-related questions, please contact us at:"}],["$","p",null,{"style":{"fontSize":"0.9rem","lineHeight":1.7,"color":"#a1a1aa","marginTop":"0.5rem"},"children":[["$","strong",null,{"style":{"color":"#f0f0f0"},"children":"PAYAP MACHINERY"}]," (trading as PAYAPRESS)",["$","br",null,{}],"Website:"," ",["$","a",null,{"href":"https://www.payapress.com","style":{"color":"#cd7f32"},"children":"www.payapress.com"}]]}]]}]
13:["$","hr",null,{"style":{"border":"none","borderTop":"1px solid #1c1c23","margin":"2.5rem 0 1.5rem"}}]
14:["$","p",null,{"style":{"color":"#3f3f46","fontSize":"0.75rem"},"children":"© 2025 PAYAP MACHINERY · Trading as PAYAPRESS"}]
15:["$","$L1b",null,{"children":["$L1c",["$","$L1d",null,{"promise":"$@1e"}]]}]
17:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=cover"}],["$","meta","2",{"name":"theme-color","content":"#cd7f32"}]]
1c:null
1f:I[622,[],"IconMark"]
1e:{"metadata":[["$","title","0",{"children":"Privacy Policy | Busbar Calculator"}],["$","meta","1",{"name":"description","content":"Privacy policy for PAYAPRESS Copper Busbar Cost Calculator."}],["$","link","2",{"rel":"author","href":"https://www.payapress.com"}],["$","meta","3",{"name":"author","content":"PAYAP MACHINERY"}],["$","link","4",{"rel":"manifest","href":"/manifest.json","crossOrigin":"$undefined"}],["$","meta","5",{"name":"keywords","content":"copper busbar,cost calculator,electrical panel,IEC 60317,Cu-ETP,live copper price,COMEX,busbar weight,شینه مسی,قیمت شینه مسی,محاسبه قیمت مس"}],["$","meta","6",{"name":"creator","content":"PAYAP MACHINERY"}],["$","meta","7",{"name":"publisher","content":"PAYAPRESS"}],["$","meta","8",{"name":"robots","content":"noindex, nofollow"}],["$","meta","9",{"name":"googlebot","content":"noindex, nofollow"}],["$","link","10",{"rel":"canonical","href":"https://payapress.com"}],["$","meta","11",{"name":"mobile-web-app-capable","content":"yes"}],["$","meta","12",{"name":"apple-mobile-web-app-title","content":"Busbar Calc"}],["$","meta","13",{"name":"apple-mobile-web-app-status-bar-style","content":"black-translucent"}],["$","meta","14",{"property":"og:title","content":"Busbar Calculator — PAYAPRESS"}],["$","meta","15",{"property":"og:description","content":"Live COMEX copper pricing · manual dimension inputs · 22 currencies · IEC/DIN standards."}],["$","meta","16",{"property":"og:url","content":"https://payapress.com"}],["$","meta","17",{"property":"og:site_name","content":"Busbar Calculator"}],["$","meta","18",{"property":"og:locale","content":"en_US"}],["$","meta","19",{"property":"og:image","content":"https://payapress.com/og-image.png"}],["$","meta","20",{"property":"og:image:width","content":"1200"}],["$","meta","21",{"property":"og:image:height","content":"630"}],["$","meta","22",{"property":"og:image:alt","content":"PAYAPRESS Copper Busbar Cost Calculator"}],["$","meta","23",{"property":"og:type","content":"website"}],["$","meta","24",{"name":"twitter:card","content":"summary_large_image"}],["$","meta","25",{"name":"twitter:creator","content":"@payapress"}],["$","meta","26",{"name":"twitter:title","content":"Busbar Calculator — PAYAPRESS"}],["$","meta","27",{"name":"twitter:description","content":"Live COMEX copper pricing · 22 currencies · IEC/DIN standards."}],["$","meta","28",{"name":"twitter:image","content":"https://payapress.com/og-image.png"}],["$","link","29",{"rel":"shortcut icon","href":"/favicon.svg"}],["$","link","30",{"rel":"icon","href":"/favicon.svg","type":"image/svg+xml"}],["$","link","31",{"rel":"apple-touch-icon","href":"/apple-icon","sizes":"180x180","type":"image/png"}],["$","link","32",{"rel":"mask-icon","href":"/favicon.svg","color":"#cd7f32"}],["$","$L1f","33",{}]],"error":null,"digest":"$undefined"}
1a:"$1e:metadata"
