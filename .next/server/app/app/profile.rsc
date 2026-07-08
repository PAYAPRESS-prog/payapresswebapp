1:"$Sreact.fragment"
2:I[588,["7177","static/chunks/app/layout-6b99811f715a9773.js"],"default"]
3:I[717,["7177","static/chunks/app/layout-6b99811f715a9773.js"],"FxAnalytics"]
4:I[3032,["7177","static/chunks/app/layout-6b99811f715a9773.js"],"PulseHost"]
5:I[1402,["7177","static/chunks/app/layout-6b99811f715a9773.js"],""]
6:I[9766,[],""]
7:I[960,["8039","static/chunks/app/error-518059702c0e8849.js"],"default"]
8:I[8924,[],""]
9:I[2619,["2619","static/chunks/2619-3c9e02e22d10480a.js","4345","static/chunks/app/not-found-9cdf96bcf2e7d3b4.js"],""]
10:I[4062,["4219","static/chunks/app/global-error-2d3366cc2d6de52d.js"],"default"]
:HL["/_next/static/css/fcba12cd324d8257.css","style"]
a:T132e,
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
        0:{"P":null,"b":"nwUjTH8cdFkrhm3johOIC","p":"","c":["","app","profile"],"i":false,"f":[[["",{"children":["app",{"children":["profile",{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],["",["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/fcba12cd324d8257.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","style":{"background":"#0b0d10"},"suppressHydrationWarning":true,"children":[["$","meta",null,{"httpEquiv":"Cache-Control","content":"no-cache, no-store, must-revalidate"}],["$","meta",null,{"httpEquiv":"Pragma","content":"no-cache"}],["$","meta",null,{"httpEquiv":"Expires","content":"0"}],["$","style",null,{"dangerouslySetInnerHTML":{"__html":"html,body{background:#0b0d10!important;color:#f5f7fa;margin:0;padding:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}*{box-sizing:border-box}"}}],["$","body",null,{"style":{"background":"#0b0d10"},"children":[["$","$L2",null,{}],["$","$L3",null,{}],["$","$L4",null,{}],[["$","$L5",null,{"src":"https://www.googletagmanager.com/gtag/js?id=G-NXYRQ0MNE4","strategy":"afterInteractive"}],["$","$L5",null,{"id":"ga4-init","strategy":"afterInteractive","children":"\n              window.dataLayer = window.dataLayer || [];\n              function gtag(){dataLayer.push(arguments);}\n              gtag('js', new Date());\n              gtag('config', 'G-NXYRQ0MNE4');\n            "}]],["$","$L6",null,{"parallelRouterKey":"children","error":"$7","errorStyles":[],"errorScripts":[],"template":["$","$L8",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","div",null,{"style":{"minHeight":"100svh","background":"#060608","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","padding":"2rem","fontFamily":"system-ui, sans-serif","textAlign":"center","gap":"1.25rem"},"children":[["$","svg",null,{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 64 64","width":"56","height":"56","children":[["$","defs",null,{"children":["$","linearGradient",null,{"id":"nfg","x1":"0","y1":"0","x2":"1","y2":"1","children":[["$","stop",null,{"offset":"0%","stopColor":"#e8953a"}],["$","stop",null,{"offset":"100%","stopColor":"#a85c18"}]]}]}],["$","rect",null,{"width":"64","height":"64","rx":"14","fill":"url(#nfg)"}],["$","rect",null,{"x":"12","y":"18","width":"40","height":"8","rx":"2.5","fill":"white","opacity":"0.55"}],["$","rect",null,{"x":"12","y":"28","width":"40","height":"8","rx":"2.5","fill":"white","opacity":"0.95"}],["$","rect",null,{"x":"12","y":"38","width":"40","height":"8","rx":"2.5","fill":"white","opacity":"0.35"}]]}],["$","p",null,{"style":{"color":"#f0f0f0","fontWeight":700,"fontSize":"1.5rem","margin":0},"children":"404"}],["$","p",null,{"style":{"color":"#a1a1aa","fontSize":"0.9rem","maxWidth":"22rem","lineHeight":1.6,"margin":0},"children":"This page doesn't exist. Head back to the calculator."}],["$","$L9",null,{"href":"/","style":{"display":"inline-block","background":"linear-gradient(135deg,#cd7f32,#b87333)","color":"#fff","borderRadius":"0.5rem","padding":"0.7rem 2rem","fontSize":"0.9rem","fontWeight":600,"textDecoration":"none","marginTop":"0.5rem"},"children":"Go to Calculator"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}],["$","$L5",null,{"id":"err-capture","strategy":"beforeInteractive","children":"$a"}],"$Lb"]}]]}]]}],{"children":["app","$Lc",{"children":["profile","$Ld",{"children":["__PAGE__","$Le",{},null,false]},null,false]},null,false]},null,false],"$Lf",false]],"m":"$undefined","G":["$10",[]],"s":false,"S":true}
12:I[6802,["2619","static/chunks/2619-3c9e02e22d10480a.js","6877","static/chunks/6877-ef2578e703a6cd17.js","3871","static/chunks/3871-31ac7dbf88a3f786.js","6802","static/chunks/6802-afb3c052902c7ac9.js","856","static/chunks/app/app/profile/page-4a92a38fb54ac203.js"],"FxProfilePage"]
13:I[4431,[],"OutletBoundary"]
15:I[5278,[],"AsyncMetadataOutlet"]
17:I[4431,[],"ViewportBoundary"]
19:I[4431,[],"MetadataBoundary"]
1a:"$Sreact.suspense"
11:Ta9d,
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
        b:["$","$L5",null,{"id":"sw-register","strategy":"afterInteractive","children":"$11"}]
c:["$","$1","c",{"children":[null,["$","$L6",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L8",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]
d:["$","$1","c",{"children":[null,["$","$L6",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L8",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]
e:["$","$1","c",{"children":[["$","$L12",null,{}],null,["$","$L13",null,{"children":["$L14",["$","$L15",null,{"promise":"$@16"}]]}]]}]
f:["$","$1","h",{"children":[null,[["$","$L17",null,{"children":"$L18"}],null],["$","$L19",null,{"children":["$","div",null,{"hidden":true,"children":["$","$1a",null,{"fallback":null,"children":"$L1b"}]}]}]]}]
18:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=cover, interactive-widget=resizes-visual"}],["$","meta","2",{"name":"theme-color","content":"#0b0d10"}]]
14:null
1c:I[622,[],"IconMark"]
16:{"metadata":[["$","title","0",{"children":"Profile | Busbar Calculator"}],["$","meta","1",{"name":"description","content":"Professional real-time copper and aluminum busbar cost calculator for electrical engineers. Live COMEX pricing, manual dimension inputs, 17 currencies, IEC standard cross-sections."}],["$","link","2",{"rel":"author","href":"https://calculator.payapress.com"}],["$","meta","3",{"name":"author","content":"Busbar Calculator"}],["$","link","4",{"rel":"manifest","href":"/manifest.json","crossOrigin":"$undefined"}],["$","meta","5",{"name":"keywords","content":"copper busbar,cost calculator,electrical panel,IEC 60317,Cu-ETP,live copper price,COMEX,busbar weight,شینه مسی,قیمت شینه مسی,محاسبه قیمت مس"}],["$","meta","6",{"name":"creator","content":"Busbar Calculator"}],["$","meta","7",{"name":"publisher","content":"Busbar Calculator"}],["$","meta","8",{"name":"robots","content":"noindex, nofollow"}],["$","meta","9",{"name":"googlebot","content":"noindex, nofollow"}],["$","meta","10",{"name":"mobile-web-app-capable","content":"yes"}],["$","meta","11",{"name":"apple-mobile-web-app-title","content":"Busbar Calc"}],["$","meta","12",{"name":"apple-mobile-web-app-status-bar-style","content":"black-translucent"}],["$","meta","13",{"property":"og:title","content":"Busbar Calculator — Copper & Aluminum Busbar Cost Calculator"}],["$","meta","14",{"property":"og:description","content":"Live COMEX copper & aluminum pricing · 17 currencies · IEC standard cross-sections."}],["$","meta","15",{"property":"og:url","content":"https://calculator.payapress.com"}],["$","meta","16",{"property":"og:site_name","content":"Busbar Calculator"}],["$","meta","17",{"property":"og:locale","content":"en_US"}],["$","meta","18",{"property":"og:image:alt","content":"Busbar Calculator — copper and aluminum busbar cost calculator"}],["$","meta","19",{"property":"og:image:type","content":"image/png"}],["$","meta","20",{"property":"og:image","content":"https://calculator.payapress.com/opengraph-image?1ce20b1c8838303d"}],["$","meta","21",{"property":"og:image:width","content":"1200"}],["$","meta","22",{"property":"og:image:height","content":"630"}],["$","meta","23",{"property":"og:type","content":"website"}],["$","meta","24",{"name":"twitter:card","content":"summary_large_image"}],["$","meta","25",{"name":"twitter:title","content":"Busbar Calculator — Copper & Aluminum Busbar Cost Calculator"}],["$","meta","26",{"name":"twitter:description","content":"Live COMEX copper & aluminum pricing · 17 currencies · IEC standard cross-sections."}],["$","meta","27",{"name":"twitter:image:alt","content":"Busbar Calculator — copper and aluminum busbar cost calculator"}],["$","meta","28",{"name":"twitter:image:type","content":"image/png"}],["$","meta","29",{"name":"twitter:image","content":"https://calculator.payapress.com/opengraph-image?1ce20b1c8838303d"}],["$","meta","30",{"name":"twitter:image:width","content":"1200"}],["$","meta","31",{"name":"twitter:image:height","content":"630"}],["$","link","32",{"rel":"shortcut icon","href":"/icon"}],["$","link","33",{"rel":"icon","href":"/icon","type":"image/png","sizes":"512x512"}],["$","link","34",{"rel":"icon","href":"/favicon.svg","type":"image/svg+xml"}],["$","link","35",{"rel":"apple-touch-icon","href":"/apple-icon","sizes":"180x180","type":"image/png"}],["$","link","36",{"rel":"mask-icon","href":"/favicon.svg","color":"#cd7f32"}],["$","$L1c","37",{}]],"error":null,"digest":"$undefined"}
1b:"$16:metadata"
