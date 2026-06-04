1:"$Sreact.fragment"
2:I[9766,[],""]
3:I[960,["39","static/chunks/app/error-1aed25bea737ad2a.js"],"default"]
4:I[8924,[],""]
5:I[1402,["177","static/chunks/app/layout-69084b2b04cb327d.js"],""]
c:I[4062,["219","static/chunks/app/global-error-432b3be5f0141b37.js"],"default"]
:HL["/_next/static/css/764b6b5bef0bda84.css","style"]
6:T132e,
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
        0:{"P":null,"b":"-0u4hLSx906uDWw3Hwi9y","p":"","c":["","app","profile"],"i":false,"f":[[["",{"children":["app",{"children":["profile",{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],["",["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/764b6b5bef0bda84.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","style":{"background":"#0b0d10"},"suppressHydrationWarning":true,"children":[["$","meta",null,{"httpEquiv":"Cache-Control","content":"no-cache, no-store, must-revalidate"}],["$","meta",null,{"httpEquiv":"Pragma","content":"no-cache"}],["$","meta",null,{"httpEquiv":"Expires","content":"0"}],["$","style",null,{"dangerouslySetInnerHTML":{"__html":"html,body{background:#0b0d10!important;color:#f5f7fa;margin:0;padding:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}*{box-sizing:border-box}"}}],["$","body",null,{"style":{"background":"#0b0d10"},"children":[["$","$L2",null,{"parallelRouterKey":"children","error":"$3","errorStyles":[],"errorScripts":[],"template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}],["$","$L5",null,{"id":"err-capture","strategy":"beforeInteractive","children":"$6"}],"$L7"]}]]}]]}],{"children":["app","$L8",{"children":["profile","$L9",{"children":["__PAGE__","$La",{},null,false]},null,false]},null,false]},null,false],"$Lb",false]],"m":"$undefined","G":["$c",[]],"s":false,"S":true}
e:I[6802,["619","static/chunks/619-ba102abea3e3d0e4.js","882","static/chunks/882-7e6ba90a6465e59f.js","171","static/chunks/171-0a901a719651b293.js","856","static/chunks/app/app/profile/page-4ad41536c1b669ec.js"],"FxProfilePage"]
f:I[4431,[],"OutletBoundary"]
11:I[5278,[],"AsyncMetadataOutlet"]
13:I[4431,[],"ViewportBoundary"]
15:I[4431,[],"MetadataBoundary"]
16:"$Sreact.suspense"
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
        7:["$","$L5",null,{"id":"sw-register","strategy":"afterInteractive","children":"$d"}]
8:["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]
9:["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]
a:["$","$1","c",{"children":[["$","$Le",null,{}],null,["$","$Lf",null,{"children":["$L10",["$","$L11",null,{"promise":"$@12"}]]}]]}]
b:["$","$1","h",{"children":[null,[["$","$L13",null,{"children":"$L14"}],null],["$","$L15",null,{"children":["$","div",null,{"hidden":true,"children":["$","$16",null,{"fallback":null,"children":"$L17"}]}]}]]}]
14:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=cover"}],["$","meta","2",{"name":"theme-color","content":"#0b0d10"}]]
10:null
18:I[622,[],"IconMark"]
12:{"metadata":[["$","title","0",{"children":"Profile | Busbar Calculator"}],["$","meta","1",{"name":"description","content":"Professional real-time copper and aluminum busbar cost calculator for electrical engineers. Live COMEX pricing, manual dimension inputs, 17 currencies, IEC standard cross-sections."}],["$","link","2",{"rel":"author","href":"https://www.payapress.com"}],["$","meta","3",{"name":"author","content":"PAYAP MACHINERY"}],["$","link","4",{"rel":"manifest","href":"/manifest.json","crossOrigin":"$undefined"}],["$","meta","5",{"name":"keywords","content":"copper busbar,cost calculator,electrical panel,IEC 60317,Cu-ETP,live copper price,COMEX,busbar weight,شینه مسی,قیمت شینه مسی,محاسبه قیمت مس"}],["$","meta","6",{"name":"creator","content":"PAYAP MACHINERY"}],["$","meta","7",{"name":"publisher","content":"PAYAPRESS"}],["$","meta","8",{"name":"robots","content":"noindex, nofollow"}],["$","meta","9",{"name":"googlebot","content":"noindex, nofollow"}],["$","link","10",{"rel":"canonical","href":"https://calculator.payapress.com"}],["$","meta","11",{"name":"mobile-web-app-capable","content":"yes"}],["$","meta","12",{"name":"apple-mobile-web-app-title","content":"Busbar Calc"}],["$","meta","13",{"name":"apple-mobile-web-app-status-bar-style","content":"black-translucent"}],["$","meta","14",{"property":"og:title","content":"Busbar Calculator"}],["$","meta","15",{"property":"og:description","content":"Live COMEX copper & aluminum pricing · 17 currencies · IEC standard cross-sections."}],["$","meta","16",{"property":"og:url","content":"https://calculator.payapress.com"}],["$","meta","17",{"property":"og:site_name","content":"Busbar Calculator"}],["$","meta","18",{"property":"og:locale","content":"en_US"}],["$","meta","19",{"property":"og:image:alt","content":"Busbar Calculator — copper and aluminum busbar cost calculator"}],["$","meta","20",{"property":"og:image:type","content":"image/png"}],["$","meta","21",{"property":"og:image","content":"https://calculator.payapress.com/opengraph-image?6e5de0338667de08"}],["$","meta","22",{"property":"og:image:width","content":"1200"}],["$","meta","23",{"property":"og:image:height","content":"630"}],["$","meta","24",{"property":"og:type","content":"website"}],["$","meta","25",{"name":"twitter:card","content":"summary_large_image"}],["$","meta","26",{"name":"twitter:creator","content":"@payapress"}],["$","meta","27",{"name":"twitter:title","content":"Busbar Calculator"}],["$","meta","28",{"name":"twitter:description","content":"Live COMEX copper & aluminum pricing · 17 currencies · IEC standard cross-sections."}],["$","meta","29",{"name":"twitter:image:alt","content":"Busbar Calculator — copper and aluminum busbar cost calculator"}],["$","meta","30",{"name":"twitter:image:type","content":"image/png"}],["$","meta","31",{"name":"twitter:image","content":"https://calculator.payapress.com/opengraph-image?6e5de0338667de08"}],["$","meta","32",{"name":"twitter:image:width","content":"1200"}],["$","meta","33",{"name":"twitter:image:height","content":"630"}],["$","link","34",{"rel":"shortcut icon","href":"/favicon.svg"}],["$","link","35",{"rel":"icon","href":"/favicon.svg","type":"image/svg+xml"}],["$","link","36",{"rel":"apple-touch-icon","href":"/apple-icon","sizes":"180x180","type":"image/png"}],["$","link","37",{"rel":"mask-icon","href":"/favicon.svg","color":"#cd7f32"}],["$","$L18","38",{}]],"error":null,"digest":"$undefined"}
17:"$12:metadata"
