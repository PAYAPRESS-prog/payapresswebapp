1:"$Sreact.fragment"
2:I[588,["177","static/chunks/app/layout-4318c4a15da8c644.js"],"default"]
3:I[9766,[],""]
4:I[960,["39","static/chunks/app/error-5dcb83ea72329615.js"],"default"]
5:I[8924,[],""]
6:I[1402,["177","static/chunks/app/layout-4318c4a15da8c644.js"],""]
c:I[4062,["219","static/chunks/app/global-error-9bc3c60ab74015d3.js"],"default"]
:HL["/_next/static/css/0594fd42265656c3.css","style"]
7:T5bc,
          window.__pp_errs = [];
          var __pp_errDiv = null;
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
          window.addEventListener('error', function(e) {
            var m = (e.message||'?') + '\n  @ ' + (e.filename||'?') + ':' + e.lineno + ':' + e.colno;
            if (e.error && e.error.stack) m += '\n' + e.error.stack;
            window.__pp_errs.push(m);
            __pp_showErr(m);
          });
          window.addEventListener('unhandledrejection', function(e) {
            var m = 'Unhandled Promise: ' + String(e.reason);
            if (e.reason && e.reason.stack) m += '\n' + e.reason.stack;
            window.__pp_errs.push(m);
            __pp_showErr(m);
          });
        8:Ta4a,
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
              // Also clear any legacy pp_css_fix flag from older versions.
              try { sessionStorage.removeItem('pp_css_fix'); } catch(e) {}
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
        0:{"P":null,"b":"dqwog4o-kpidjpNmR-Kf9","p":"","c":["","embed"],"i":false,"f":[[["",{"children":["embed",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/0594fd42265656c3.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","style":{"background":"#060608"},"suppressHydrationWarning":true,"children":[["$","meta",null,{"httpEquiv":"Cache-Control","content":"no-cache, no-store, must-revalidate"}],["$","meta",null,{"httpEquiv":"Pragma","content":"no-cache"}],["$","meta",null,{"httpEquiv":"Expires","content":"0"}],["$","style",null,{"dangerouslySetInnerHTML":{"__html":"html,body{background:#060608!important;color:#f0f0f0;margin:0;padding:0;font-family:ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}*{box-sizing:border-box}"}}],["$","body",null,{"style":{"background":"#060608"},"children":[["$","$L2",null,{}],["$","$L3",null,{"parallelRouterKey":"children","error":"$4","errorStyles":[],"errorScripts":[],"template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}],["$","$L6",null,{"id":"err-capture","strategy":"beforeInteractive","children":"$7"}],["$","$L6",null,{"id":"sw-register","strategy":"afterInteractive","children":"$8"}]]}]]}]]}],{"children":["embed","$L9",{"children":["__PAGE__","$La",{},null,false]},null,false]},null,false],"$Lb",false]],"m":"$undefined","G":["$c",[]],"s":false,"S":true}
d:I[1959,[],"ClientPageRoot"]
e:I[1937,["940","static/chunks/app/embed/page-e8166d564915e7f3.js"],"default"]
11:I[4431,[],"OutletBoundary"]
13:I[5278,[],"AsyncMetadataOutlet"]
15:I[4431,[],"ViewportBoundary"]
17:I[4431,[],"MetadataBoundary"]
18:"$Sreact.suspense"
9:["$","$1","c",{"children":[null,["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]
a:["$","$1","c",{"children":[["$","$Ld",null,{"Component":"$e","searchParams":{},"params":{},"promises":["$@f","$@10"]}],null,["$","$L11",null,{"children":["$L12",["$","$L13",null,{"promise":"$@14"}]]}]]}]
b:["$","$1","h",{"children":[null,[["$","$L15",null,{"children":"$L16"}],null],["$","$L17",null,{"children":["$","div",null,{"hidden":true,"children":["$","$18",null,{"fallback":null,"children":"$L19"}]}]}]]}]
f:{}
10:"$a:props:children:0:props:params"
16:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=cover"}],["$","meta","2",{"name":"theme-color","content":"#cd7f32"}]]
12:null
1a:I[622,[],"IconMark"]
14:{"metadata":[["$","title","0",{"children":"Busbar Calculator — PAYAPRESS"}],["$","meta","1",{"name":"description","content":"Professional real-time copper busbar cost calculator for electrical panel fabricators. Live COMEX pricing, manual dimension inputs, 22 currencies, IEC/DIN standards."}],["$","link","2",{"rel":"author","href":"https://www.payapress.com"}],["$","meta","3",{"name":"author","content":"PAYAP MACHINERY"}],["$","link","4",{"rel":"manifest","href":"/manifest.json","crossOrigin":"$undefined"}],["$","meta","5",{"name":"keywords","content":"copper busbar,cost calculator,electrical panel,IEC 60317,Cu-ETP,live copper price,COMEX,busbar weight,شینه مسی,قیمت شینه مسی,محاسبه قیمت مس"}],["$","meta","6",{"name":"creator","content":"PAYAP MACHINERY"}],["$","meta","7",{"name":"publisher","content":"PAYAPRESS"}],["$","meta","8",{"name":"robots","content":"noindex, nofollow"}],["$","meta","9",{"name":"googlebot","content":"noindex, nofollow"}],["$","link","10",{"rel":"canonical","href":"https://payapress.com"}],["$","meta","11",{"name":"mobile-web-app-capable","content":"yes"}],["$","meta","12",{"name":"apple-mobile-web-app-title","content":"Busbar Calc"}],["$","meta","13",{"name":"apple-mobile-web-app-status-bar-style","content":"black-translucent"}],["$","meta","14",{"property":"og:title","content":"Busbar Calculator — PAYAPRESS"}],["$","meta","15",{"property":"og:description","content":"Live COMEX copper pricing · manual dimension inputs · 22 currencies · IEC/DIN standards."}],["$","meta","16",{"property":"og:url","content":"https://payapress.com"}],["$","meta","17",{"property":"og:site_name","content":"Busbar Calculator"}],["$","meta","18",{"property":"og:locale","content":"en_US"}],["$","meta","19",{"property":"og:image","content":"https://payapress.com/og-image.png"}],["$","meta","20",{"property":"og:image:width","content":"1200"}],["$","meta","21",{"property":"og:image:height","content":"630"}],["$","meta","22",{"property":"og:image:alt","content":"PAYAPRESS Copper Busbar Cost Calculator"}],["$","meta","23",{"property":"og:type","content":"website"}],["$","meta","24",{"name":"twitter:card","content":"summary_large_image"}],["$","meta","25",{"name":"twitter:creator","content":"@payapress"}],["$","meta","26",{"name":"twitter:title","content":"Busbar Calculator — PAYAPRESS"}],["$","meta","27",{"name":"twitter:description","content":"Live COMEX copper pricing · 22 currencies · IEC/DIN standards."}],["$","meta","28",{"name":"twitter:image","content":"https://payapress.com/og-image.png"}],["$","link","29",{"rel":"shortcut icon","href":"/favicon.svg"}],["$","link","30",{"rel":"icon","href":"/favicon.svg","type":"image/svg+xml"}],["$","link","31",{"rel":"apple-touch-icon","href":"/apple-icon","sizes":"180x180","type":"image/png"}],["$","link","32",{"rel":"mask-icon","href":"/favicon.svg","color":"#cd7f32"}],["$","$L1a","33",{}]],"error":null,"digest":"$undefined"}
19:"$14:metadata"
