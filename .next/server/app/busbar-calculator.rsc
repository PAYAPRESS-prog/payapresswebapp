1:"$Sreact.fragment"
2:I[588,["7177","static/chunks/app/layout-6b99811f715a9773.js"],"default"]
3:I[717,["7177","static/chunks/app/layout-6b99811f715a9773.js"],"FxAnalytics"]
4:I[3032,["7177","static/chunks/app/layout-6b99811f715a9773.js"],"PulseHost"]
5:I[1402,["7177","static/chunks/app/layout-6b99811f715a9773.js"],""]
6:I[9766,[],""]
7:I[960,["8039","static/chunks/app/error-518059702c0e8849.js"],"default"]
8:I[8924,[],""]
9:I[2619,["2619","static/chunks/2619-3c9e02e22d10480a.js","4345","static/chunks/app/not-found-9cdf96bcf2e7d3b4.js"],""]
f:I[4062,["4219","static/chunks/app/global-error-2d3366cc2d6de52d.js"],"default"]
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
        0:{"P":null,"b":"5ReLxEcxWzC_YAIx3pea_","p":"","c":["","busbar-calculator"],"i":false,"f":[[["",{"children":["busbar-calculator",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/fcba12cd324d8257.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","style":{"background":"#0b0d10"},"suppressHydrationWarning":true,"children":[["$","meta",null,{"httpEquiv":"Cache-Control","content":"no-cache, no-store, must-revalidate"}],["$","meta",null,{"httpEquiv":"Pragma","content":"no-cache"}],["$","meta",null,{"httpEquiv":"Expires","content":"0"}],["$","style",null,{"dangerouslySetInnerHTML":{"__html":"html,body{background:#0b0d10!important;color:#f5f7fa;margin:0;padding:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}*{box-sizing:border-box}"}}],["$","body",null,{"style":{"background":"#0b0d10"},"children":[["$","$L2",null,{}],["$","$L3",null,{}],["$","$L4",null,{}],[["$","$L5",null,{"src":"https://www.googletagmanager.com/gtag/js?id=G-NXYRQ0MNE4","strategy":"afterInteractive"}],["$","$L5",null,{"id":"ga4-init","strategy":"afterInteractive","children":"\n              window.dataLayer = window.dataLayer || [];\n              function gtag(){dataLayer.push(arguments);}\n              gtag('js', new Date());\n              gtag('config', 'G-NXYRQ0MNE4');\n            "}]],["$","$L6",null,{"parallelRouterKey":"children","error":"$7","errorStyles":[],"errorScripts":[],"template":["$","$L8",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","div",null,{"style":{"minHeight":"100svh","background":"#060608","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","padding":"2rem","fontFamily":"system-ui, sans-serif","textAlign":"center","gap":"1.25rem"},"children":[["$","svg",null,{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 64 64","width":"56","height":"56","children":[["$","defs",null,{"children":["$","linearGradient",null,{"id":"nfg","x1":"0","y1":"0","x2":"1","y2":"1","children":[["$","stop",null,{"offset":"0%","stopColor":"#e8953a"}],["$","stop",null,{"offset":"100%","stopColor":"#a85c18"}]]}]}],["$","rect",null,{"width":"64","height":"64","rx":"14","fill":"url(#nfg)"}],["$","rect",null,{"x":"12","y":"18","width":"40","height":"8","rx":"2.5","fill":"white","opacity":"0.55"}],["$","rect",null,{"x":"12","y":"28","width":"40","height":"8","rx":"2.5","fill":"white","opacity":"0.95"}],["$","rect",null,{"x":"12","y":"38","width":"40","height":"8","rx":"2.5","fill":"white","opacity":"0.35"}]]}],["$","p",null,{"style":{"color":"#f0f0f0","fontWeight":700,"fontSize":"1.5rem","margin":0},"children":"404"}],["$","p",null,{"style":{"color":"#a1a1aa","fontSize":"0.9rem","maxWidth":"22rem","lineHeight":1.6,"margin":0},"children":"This page doesn't exist. Head back to the calculator."}],["$","$L9",null,{"href":"/","style":{"display":"inline-block","background":"linear-gradient(135deg,#cd7f32,#b87333)","color":"#fff","borderRadius":"0.5rem","padding":"0.7rem 2rem","fontSize":"0.9rem","fontWeight":600,"textDecoration":"none","marginTop":"0.5rem"},"children":"Go to Calculator"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}],["$","$L5",null,{"id":"err-capture","strategy":"beforeInteractive","children":"$a"}],"$Lb"]}]]}]]}],{"children":["busbar-calculator","$Lc",{"children":["__PAGE__","$Ld",{},null,false]},null,false]},null,false],"$Le",false]],"m":"$undefined","G":["$f",[]],"s":false,"S":true}
12:I[4431,[],"OutletBoundary"]
14:I[5278,[],"AsyncMetadataOutlet"]
16:I[4431,[],"ViewportBoundary"]
18:I[4431,[],"MetadataBoundary"]
19:"$Sreact.suspense"
10:Ta9d,
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
        b:["$","$L5",null,{"id":"sw-register","strategy":"afterInteractive","children":"$10"}]
c:["$","$1","c",{"children":[null,["$","$L6",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L8",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]
d:["$","$1","c",{"children":["$L11",null,["$","$L12",null,{"children":["$L13",["$","$L14",null,{"promise":"$@15"}]]}]]}]
e:["$","$1","h",{"children":[null,[["$","$L16",null,{"children":"$L17"}],null],["$","$L18",null,{"children":["$","div",null,{"hidden":true,"children":["$","$19",null,{"fallback":null,"children":"$L1a"}]}]}]]}]
17:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=cover, interactive-widget=resizes-visual"}],["$","meta","2",{"name":"theme-color","content":"#0b0d10"}]]
13:null
1b:I[622,[],"IconMark"]
15:{"metadata":[["$","title","0",{"children":"Busbar Calculator — Free Busbar Sizing & Price Calculator"}],["$","meta","1",{"name":"description","content":"Free online busbar calculator for copper & aluminum. Busbar sizing to IEC standards plus live price calculation — weight, ampacity and cost in 17 currencies with real-time COMEX/LME rates."}],["$","link","2",{"rel":"author","href":"https://calculator.payapress.com"}],["$","meta","3",{"name":"author","content":"Busbar Calculator"}],["$","link","4",{"rel":"manifest","href":"/manifest.json","crossOrigin":"$undefined"}],["$","meta","5",{"name":"keywords","content":"busbar calculator,busbar sizing calculator,busbar price calculator,copper busbar calculator,aluminum busbar calculator,busbar ampacity,busbar weight calculator,busbar cross section,IEC busbar sizing,live copper price,COMEX,LME"}],["$","meta","6",{"name":"creator","content":"Busbar Calculator"}],["$","meta","7",{"name":"publisher","content":"Busbar Calculator"}],["$","meta","8",{"name":"robots","content":"index, follow"}],["$","meta","9",{"name":"googlebot","content":"index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"}],["$","link","10",{"rel":"canonical","href":"https://calculator.payapress.com/busbar-calculator"}],["$","meta","11",{"name":"mobile-web-app-capable","content":"yes"}],["$","meta","12",{"name":"apple-mobile-web-app-title","content":"Busbar Calc"}],["$","meta","13",{"name":"apple-mobile-web-app-status-bar-style","content":"black-translucent"}],["$","meta","14",{"property":"og:title","content":"Busbar Calculator — Free Busbar Sizing & Price Calculator"}],["$","meta","15",{"property":"og:description","content":"Size copper & aluminum busbars to IEC standards and price them live. Weight, ampacity and cost in 17 currencies — free, no sign-up needed."}],["$","meta","16",{"property":"og:url","content":"https://calculator.payapress.com/busbar-calculator"}],["$","meta","17",{"property":"og:type","content":"website"}],["$","meta","18",{"name":"twitter:card","content":"summary_large_image"}],["$","meta","19",{"name":"twitter:title","content":"Busbar Calculator — Free Busbar Sizing & Price Calculator"}],["$","meta","20",{"name":"twitter:description","content":"Size copper & aluminum busbars to IEC standards and price them live in 17 currencies."}],["$","link","21",{"rel":"shortcut icon","href":"/icon"}],["$","link","22",{"rel":"icon","href":"/icon","type":"image/png","sizes":"512x512"}],["$","link","23",{"rel":"icon","href":"/favicon.svg","type":"image/svg+xml"}],["$","link","24",{"rel":"apple-touch-icon","href":"/apple-icon","sizes":"180x180","type":"image/png"}],["$","link","25",{"rel":"mask-icon","href":"/favicon.svg","color":"#cd7f32"}],["$","$L1b","26",{}]],"error":null,"digest":"$undefined"}
1a:"$15:metadata"
1c:I[1334,["2619","static/chunks/2619-3c9e02e22d10480a.js","6877","static/chunks/6877-ef2578e703a6cd17.js","3871","static/chunks/3871-31ac7dbf88a3f786.js","3881","static/chunks/3881-b7cc6fc0f671f697.js","5477","static/chunks/5477-d3285287fb7a954c.js","6802","static/chunks/6802-afb3c052902c7ac9.js","8111","static/chunks/app/busbar-calculator/page-c1fe519f7e44facb.js"],"SectionErrorBoundary"]
1e:I[6305,["2619","static/chunks/2619-3c9e02e22d10480a.js","6877","static/chunks/6877-ef2578e703a6cd17.js","3871","static/chunks/3871-31ac7dbf88a3f786.js","3881","static/chunks/3881-b7cc6fc0f671f697.js","5477","static/chunks/5477-d3285287fb7a954c.js","6802","static/chunks/6802-afb3c052902c7ac9.js","8111","static/chunks/app/busbar-calculator/page-c1fe519f7e44facb.js"],"FxDesktopLanding"]
1f:I[6891,["2619","static/chunks/2619-3c9e02e22d10480a.js","6877","static/chunks/6877-ef2578e703a6cd17.js","3871","static/chunks/3871-31ac7dbf88a3f786.js","3881","static/chunks/3881-b7cc6fc0f671f697.js","5477","static/chunks/5477-d3285287fb7a954c.js","6802","static/chunks/6802-afb3c052902c7ac9.js","8111","static/chunks/app/busbar-calculator/page-c1fe519f7e44facb.js"],"FxSwipeApp"]
20:I[3881,["2619","static/chunks/2619-3c9e02e22d10480a.js","6877","static/chunks/6877-ef2578e703a6cd17.js","3871","static/chunks/3871-31ac7dbf88a3f786.js","3881","static/chunks/3881-b7cc6fc0f671f697.js","5477","static/chunks/5477-d3285287fb7a954c.js","6802","static/chunks/6802-afb3c052902c7ac9.js","8111","static/chunks/app/busbar-calculator/page-c1fe519f7e44facb.js"],"FxFooter"]
1d:Ta1e,{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://calculator.payapress.com/#organization","name":"Busbar Calculator","url":"https://calculator.payapress.com","logo":{"@type":"ImageObject","url":"https://calculator.payapress.com/icon","width":512,"height":512},"contactPoint":{"@type":"ContactPoint","email":"info@calculator.payapress.com","contactType":"customer support","availableLanguage":["en"]}},{"@type":"WebSite","@id":"https://calculator.payapress.com/#website","url":"https://calculator.payapress.com","name":"Busbar Calculator","alternateName":"Busbar Calculator","publisher":{"@id":"https://calculator.payapress.com/#organization"},"inLanguage":"en"},{"@type":"WebApplication","@id":"https://calculator.payapress.com/busbar-calculator#app","name":"Busbar Calculator","alternateName":["Busbar Sizing Calculator","Busbar Price Calculator"],"url":"https://calculator.payapress.com/busbar-calculator","description":"Free online busbar calculator: size copper and aluminum busbars to IEC standards and calculate live prices — weight, ampacity and cost in 17 currencies.","applicationCategory":"EngineeringApplication","operatingSystem":"Any (web browser)","browserRequirements":"Requires JavaScript","isAccessibleForFree":true,"image":"https://calculator.payapress.com/opengraph-image","screenshot":"https://calculator.payapress.com/opengraph-image","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"featureList":["Copper & aluminum busbar sizing (IEC cross-sections)","Live COMEX copper and LME aluminum pricing","Weight, ampacity and total cost calculation","17 currencies with live FX rates","Historical price chart up to 1 year","Configuration compare, saved history and waste (kerf/punch) calculator"],"publisher":{"@id":"https://calculator.payapress.com/#organization"},"inLanguage":"en"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://calculator.payapress.com"},{"@type":"ListItem","position":2,"name":"Busbar Calculator","item":"https://calculator.payapress.com/busbar-calculator"}]},{"@type":"HowTo","name":"How to size and price a busbar","step":[{"@type":"HowToStep","position":1,"name":"Select Material","text":"Choose Copper or Aluminum based on your project requirements."},{"@type":"HowToStep","position":2,"name":"Enter Electrical Parameters","text":"Input length, width, thickness, material grade and currency."},{"@type":"HowToStep","position":3,"name":"Get Instant Results","text":"Receive busbar weight, ampacity and live price calculations instantly."}]}]}11:["$","$L1c",null,{"children":[["$","script",null,{"type":"application/ld+json","dangerouslySetInnerHTML":{"__html":"$1d"}}],["$","$L1e",null,{"copperPrice":9.921,"aluminumPrice":2.5}],["$","div",null,{"id":"fx-app-anchor","children":["$","$L1f",null,{"initialData":{"copper":{"pricePerLb":4.5,"pricePerKg":9.921,"pricePerMT":9921,"currency":"USD","source":"estimated","isFallback":true,"updatedAt":"2026-07-08T08:13:49.047Z"},"aluminum":{"pricePerLb":1.134,"pricePerKg":2.5,"pricePerMT":2500,"currency":"USD","source":"estimated","isFallback":true,"updatedAt":"2026-07-08T08:13:49.048Z"},"fx":{"EUR":0.91,"GBP":0.77,"CHF":0.87,"JPY":145,"CAD":1.42,"AUD":1.59,"CNY":7.28,"INR":85,"SGD":1.34,"KRW":1380,"TRY":38.5,"BRL":5.75,"MXN":18.5,"NOK":10.85,"SEK":10.4,"ZAR":18.5,"RUB":90,"AED":3.6725,"SAR":3.75,"QAR":3.64,"KWD":0.3075,"BHD":0.376,"isFallback":true,"source":"static fallback","updatedAt":"2026-07-08T08:13:49.042Z"}},"copperPrice":9.921,"aluminumPrice":2.5}]}],["$","div",null,{"className":"fx-dl-footer-wrap","children":["$","$L20",null,{"copperPrice":9.921,"aluminumPrice":2.5}]}]]}]
