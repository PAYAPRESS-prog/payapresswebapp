1:"$Sreact.fragment"
2:I[588,["7177","static/chunks/app/layout-6e266f0d6b3489be.js"],"default"]
3:I[717,["7177","static/chunks/app/layout-6e266f0d6b3489be.js"],"FxAnalytics"]
4:I[3032,["7177","static/chunks/app/layout-6e266f0d6b3489be.js"],"PulseHost"]
5:I[1402,["7177","static/chunks/app/layout-6e266f0d6b3489be.js"],""]
6:I[9766,[],""]
7:I[960,["8039","static/chunks/app/error-518059702c0e8849.js"],"default"]
8:I[8924,[],""]
9:I[2619,["2619","static/chunks/2619-3c9e02e22d10480a.js","7066","static/chunks/app/terms/page-64fe8376549c8fcb.js"],""]
f:I[4062,["4219","static/chunks/app/global-error-2d3366cc2d6de52d.js"],"default"]
:HL["/_next/static/css/ae850d3ec42ea020.css","style"]
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
        0:{"P":null,"b":"3Ir42LexwACZGJQ47xD3u","p":"","c":["","terms"],"i":false,"f":[[["",{"children":["terms",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/ae850d3ec42ea020.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","style":{"background":"#0b0d10"},"suppressHydrationWarning":true,"children":[["$","meta",null,{"httpEquiv":"Cache-Control","content":"no-cache, no-store, must-revalidate"}],["$","meta",null,{"httpEquiv":"Pragma","content":"no-cache"}],["$","meta",null,{"httpEquiv":"Expires","content":"0"}],["$","style",null,{"dangerouslySetInnerHTML":{"__html":"html,body{background:#0b0d10!important;color:#f5f7fa;margin:0;padding:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}*{box-sizing:border-box}"}}],["$","body",null,{"style":{"background":"#0b0d10"},"children":[["$","$L2",null,{}],["$","$L3",null,{}],["$","$L4",null,{}],[["$","$L5",null,{"src":"https://www.googletagmanager.com/gtag/js?id=G-NXYRQ0MNE4","strategy":"afterInteractive"}],["$","$L5",null,{"id":"ga4-init","strategy":"afterInteractive","children":"\n              window.dataLayer = window.dataLayer || [];\n              function gtag(){dataLayer.push(arguments);}\n              gtag('js', new Date());\n              gtag('config', 'G-NXYRQ0MNE4');\n            "}]],["$","$L6",null,{"parallelRouterKey":"children","error":"$7","errorStyles":[],"errorScripts":[],"template":["$","$L8",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","div",null,{"style":{"minHeight":"100svh","background":"#060608","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","padding":"2rem","fontFamily":"system-ui, sans-serif","textAlign":"center","gap":"1.25rem"},"children":[["$","svg",null,{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 64 64","width":"56","height":"56","children":[["$","defs",null,{"children":["$","linearGradient",null,{"id":"nfg","x1":"0","y1":"0","x2":"1","y2":"1","children":[["$","stop",null,{"offset":"0%","stopColor":"#e8953a"}],["$","stop",null,{"offset":"100%","stopColor":"#a85c18"}]]}]}],["$","rect",null,{"width":"64","height":"64","rx":"14","fill":"url(#nfg)"}],["$","rect",null,{"x":"12","y":"18","width":"40","height":"8","rx":"2.5","fill":"white","opacity":"0.55"}],["$","rect",null,{"x":"12","y":"28","width":"40","height":"8","rx":"2.5","fill":"white","opacity":"0.95"}],["$","rect",null,{"x":"12","y":"38","width":"40","height":"8","rx":"2.5","fill":"white","opacity":"0.35"}]]}],["$","p",null,{"style":{"color":"#f0f0f0","fontWeight":700,"fontSize":"1.5rem","margin":0},"children":"404"}],["$","p",null,{"style":{"color":"#a1a1aa","fontSize":"0.9rem","maxWidth":"22rem","lineHeight":1.6,"margin":0},"children":"This page doesn't exist. Head back to the calculator."}],["$","$L9",null,{"href":"/","style":{"display":"inline-block","background":"linear-gradient(135deg,#cd7f32,#b87333)","color":"#fff","borderRadius":"0.5rem","padding":"0.7rem 2rem","fontSize":"0.9rem","fontWeight":600,"textDecoration":"none","marginTop":"0.5rem"},"children":"Go to Calculator"}]]}],[]],"forbidden":"$undefined","unauthorized":"$undefined"}],["$","$L5",null,{"id":"err-capture","strategy":"beforeInteractive","children":"$a"}],"$Lb"]}]]}]]}],{"children":["terms","$Lc",{"children":["__PAGE__","$Ld",{},null,false]},null,false]},null,false],"$Le",false]],"m":"$undefined","G":["$f",[]],"s":false,"S":true}
1f:I[4431,[],"ViewportBoundary"]
21:I[4431,[],"MetadataBoundary"]
22:"$Sreact.suspense"
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
d:["$","$1","c",{"children":[["$","div",null,{"style":{"minHeight":"100svh","background":"#060608","fontFamily":"'Inter', system-ui, sans-serif","color":"#d4d4d8","padding":"2rem 1.5rem 4rem"},"children":["$","div",null,{"style":{"maxWidth":"44rem","margin":"0 auto"},"children":[["$","$L9",null,{"href":"/","style":{"display":"inline-block","marginBottom":"2rem","color":"#cd7f32","textDecoration":"none","fontSize":"0.85rem"},"children":"← Back to Calculator"}],["$","h1",null,{"style":{"fontSize":"clamp(1.6rem, 5vw, 2.2rem)","fontWeight":900,"color":"#f0f0f0","marginBottom":"0.5rem","letterSpacing":"-0.02em"},"children":"Terms of Use"}],["$","p",null,{"style":{"color":"#52525b","fontSize":"0.85rem","marginBottom":"2.5rem"},"children":"Last updated: June 2025  ·  Effective immediately"}],["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":{"fontSize":"1rem","fontWeight":700,"color":"#cd7f32","marginBottom":"0.6rem","letterSpacing":"0.01em"},"children":"1. Ownership"}],["$","p",null,{"style":{"fontSize":"0.9rem","lineHeight":1.75,"color":"#a1a1aa"},"children":["This platform — including all source code, algorithms, calculation methodologies, user interface designs, visual assets, database schemas, API structures, and all associated materials — is the exclusive proprietary property of"," ",["$","strong",null,{"style":{"color":"#f0f0f0"},"children":"Busbar Calculator"}]," (trading as"," ",["$","strong",null,{"style":{"color":"#f0f0f0"},"children":"Busbar Calculator"}],"). All intellectual property rights are reserved. No ownership rights are transferred to you through your use of this platform."]}]]}],["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"2. License to Use"}],["$","p",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"Subject to these Terms, Busbar Calculator grants you a limited, non-exclusive, non-transferable, revocable license to access and use this platform solely for your personal or internal professional purposes. This license does not include the right to:"}],["$","ul",null,{"style":{"fontSize":"0.9rem","lineHeight":1.75,"color":"#a1a1aa","paddingLeft":"1.5rem","listStyleType":"disc","marginTop":"0.75rem"},"children":[["$","li",null,{"style":{"marginBottom":"0.4rem"},"children":"reproduce, copy, or duplicate any part of the platform;"}],["$","li",null,{"style":{"marginBottom":"0.4rem"},"children":"sell, resell, or commercially exploit any part of the platform;"}],["$","li",null,{"style":{"marginBottom":"0.4rem"},"children":"reverse engineer, decompile, disassemble, or attempt to derive the source code, algorithms, or underlying methodology;"}],["$","li",null,{"style":{"marginBottom":"0.4rem"},"children":"create derivative works, competing products, or substantially similar services;"}],["$","li",null,{"style":{"marginBottom":"0.4rem"},"children":"scrape, crawl, or systematically extract data from the platform;"}],["$","li",null,{"style":{"marginBottom":"0.4rem"},"children":"use the platform for training, fine-tuning, or developing artificial intelligence or machine learning models."}]]}]]}],["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"3. Intellectual Property"}],["$","p",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"All intellectual property on this platform — including but not limited to copyrights, trademarks, trade secrets, patents, design rights, and know-how — is owned exclusively by Busbar Calculator. The busbar cost calculation methodology, pricing algorithms, currency conversion processes, and all associated business logic are proprietary and constitute protected trade secrets."}],["$","p",null,{"style":{"fontSize":"0.9rem","lineHeight":1.75,"color":"#a1a1aa","marginTop":"0.75rem"},"children":"You may not challenge or contest Busbar Calculator’s ownership of any intellectual property rights in this platform."}]]}],["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"4. Prohibited Uses"}],["$","p",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"You agree not to:"}],["$","ul",null,{"style":{"fontSize":"0.9rem","lineHeight":1.75,"color":"#a1a1aa","paddingLeft":"1.5rem","listStyleType":"disc","marginTop":"0.75rem"},"children":["$L11","$L12","$L13","$L14","$L15"]}]]}],"$L16","$L17","$L18","$L19","$L1a","$L1b","$L1c","$L1d"]}]}],null,"$L1e"]}]
e:["$","$1","h",{"children":[null,[["$","$L1f",null,{"children":"$L20"}],null],["$","$L21",null,{"children":["$","div",null,{"hidden":true,"children":["$","$22",null,{"fallback":null,"children":"$L23"}]}]}]]}]
24:I[4431,[],"OutletBoundary"]
26:I[5278,[],"AsyncMetadataOutlet"]
11:["$","li",null,{"style":{"marginBottom":"0.4rem"},"children":"use the platform for any unlawful purpose;"}]
12:["$","li",null,{"style":{"marginBottom":"0.4rem"},"children":"circumvent, disable, or interfere with security-related features of the platform;"}]
13:["$","li",null,{"style":{"marginBottom":"0.4rem"},"children":"transmit any automated requests (bots, scrapers, or crawlers) without prior written permission;"}]
14:["$","li",null,{"style":{"marginBottom":"0.4rem"},"children":"impersonate or misrepresent your affiliation with any person or entity;"}]
15:["$","li",null,{"style":{"marginBottom":"0.4rem"},"children":"use the platform in any way that could damage, disable, overburden, or impair it."}]
16:["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"5. Accuracy of Calculations"}],["$","p",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"All price calculations are provided for informational purposes only, based on live market data (COMEX, ECB) fetched at the time of the request. Prices may vary. Busbar Calculator makes no warranty as to the accuracy, completeness, or fitness for purpose of any calculation. You assume sole responsibility for any decisions made based on information provided by this platform."}]]}]
17:["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"6. Disclaimer of Warranties"}],["$","p",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"This platform is provided “as is” without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. Busbar Calculator does not warrant that the platform will be uninterrupted, error-free, or free of viruses or other harmful components."}]]}]
18:["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"7. Limitation of Liability"}],["$","p",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"To the maximum extent permitted by applicable law, Busbar Calculator shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of this platform, even if advised of the possibility of such damages."}]]}]
19:["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"8. Governing Law"}],["$","p",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"These Terms are governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts. Busbar Calculator reserves the right to seek injunctive or other equitable relief in any jurisdiction to protect its intellectual property rights."}]]}]
1a:["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"9. Changes to These Terms"}],["$","p",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"We may update these Terms at any time. The “Last updated” date at the top of this page reflects the most recent revision. Continued use of the platform following any changes constitutes your acceptance of the new Terms."}]]}]
1b:["$","section",null,{"style":{"marginBottom":"2rem"},"children":[["$","h2",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:0:props:style","children":"10. Contact"}],["$","p",null,{"style":"$d:props:children:0:props:children:props:children:3:props:children:1:props:style","children":"For legal inquiries, licensing requests, or intellectual property matters:"}],["$","p",null,{"style":{"fontSize":"0.9rem","lineHeight":1.75,"color":"#a1a1aa","marginTop":"0.5rem"},"children":[["$","strong",null,{"style":{"color":"#f0f0f0"},"children":"Busbar Calculator"}]," (trading as Busbar Calculator)",["$","br",null,{}],"Email:"," ",["$","a",null,{"href":"mailto:info@calculator.payapress.com","style":{"color":"#cd7f32"},"children":"info@calculator.payapress.com"}],["$","br",null,{}],"Website:"," ",["$","a",null,{"href":"https://www.payapress.com","style":{"color":"#cd7f32"},"children":"www.payapress.com"}]]}]]}]
1c:["$","hr",null,{"style":{"border":"none","borderTop":"1px solid #1c1c23","margin":"2.5rem 0 1.5rem"}}]
1d:["$","p",null,{"style":{"color":"#3f3f46","fontSize":"0.75rem"},"children":"© 2025 Busbar Calculator · Trading as Busbar Calculator · All Rights Reserved"}]
1e:["$","$L24",null,{"children":["$L25",["$","$L26",null,{"promise":"$@27"}]]}]
20:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=cover, interactive-widget=resizes-visual"}],["$","meta","2",{"name":"theme-color","content":"#0b0d10"}]]
25:null
28:I[622,[],"IconMark"]
27:{"metadata":[["$","title","0",{"children":"Terms of Use | Busbar Calculator"}],["$","meta","1",{"name":"description","content":"Terms of Use and Intellectual Property Notice for the Busbar Calculator platform."}],["$","link","2",{"rel":"author","href":"https://calculator.payapress.com"}],["$","meta","3",{"name":"author","content":"Busbar Calculator"}],["$","link","4",{"rel":"manifest","href":"/manifest.json","crossOrigin":"$undefined"}],["$","meta","5",{"name":"keywords","content":"copper busbar,cost calculator,electrical panel,IEC 60317,Cu-ETP,live copper price,COMEX,busbar weight,شینه مسی,قیمت شینه مسی,محاسبه قیمت مس"}],["$","meta","6",{"name":"creator","content":"Busbar Calculator"}],["$","meta","7",{"name":"publisher","content":"Busbar Calculator"}],["$","meta","8",{"name":"robots","content":"index, follow"}],["$","meta","9",{"name":"googlebot","content":"index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"}],["$","link","10",{"rel":"canonical","href":"https://calculator.payapress.com/terms"}],["$","meta","11",{"name":"mobile-web-app-capable","content":"yes"}],["$","meta","12",{"name":"apple-mobile-web-app-title","content":"Busbar Calc"}],["$","meta","13",{"name":"apple-mobile-web-app-status-bar-style","content":"black-translucent"}],["$","meta","14",{"property":"og:title","content":"Busbar Calculator"}],["$","meta","15",{"property":"og:description","content":"Live COMEX copper & aluminum pricing · 17 currencies · IEC standard cross-sections."}],["$","meta","16",{"property":"og:url","content":"https://calculator.payapress.com"}],["$","meta","17",{"property":"og:site_name","content":"Busbar Calculator"}],["$","meta","18",{"property":"og:locale","content":"en_US"}],["$","meta","19",{"property":"og:image:alt","content":"Busbar Calculator — copper and aluminum busbar cost calculator"}],["$","meta","20",{"property":"og:image:type","content":"image/png"}],["$","meta","21",{"property":"og:image","content":"https://calculator.payapress.com/opengraph-image?1ce20b1c8838303d"}],["$","meta","22",{"property":"og:image:width","content":"1200"}],["$","meta","23",{"property":"og:image:height","content":"630"}],["$","meta","24",{"property":"og:type","content":"website"}],["$","meta","25",{"name":"twitter:card","content":"summary_large_image"}],["$","meta","26",{"name":"twitter:title","content":"Busbar Calculator"}],["$","meta","27",{"name":"twitter:description","content":"Live COMEX copper & aluminum pricing · 17 currencies · IEC standard cross-sections."}],["$","meta","28",{"name":"twitter:image:alt","content":"Busbar Calculator — copper and aluminum busbar cost calculator"}],["$","meta","29",{"name":"twitter:image:type","content":"image/png"}],["$","meta","30",{"name":"twitter:image","content":"https://calculator.payapress.com/opengraph-image?1ce20b1c8838303d"}],["$","meta","31",{"name":"twitter:image:width","content":"1200"}],["$","meta","32",{"name":"twitter:image:height","content":"630"}],["$","link","33",{"rel":"shortcut icon","href":"/icon"}],["$","link","34",{"rel":"icon","href":"/icon","type":"image/png","sizes":"512x512"}],["$","link","35",{"rel":"icon","href":"/favicon.svg","type":"image/svg+xml"}],["$","link","36",{"rel":"apple-touch-icon","href":"/apple-icon","sizes":"180x180","type":"image/png"}],["$","link","37",{"rel":"mask-icon","href":"/favicon.svg","color":"#cd7f32"}],["$","$L28","38",{}]],"error":null,"digest":"$undefined"}
23:"$27:metadata"
