exports.id=32,exports.ids=[32],exports.modules={293:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,4702,23)),Promise.resolve().then(c.bind(c,7964))},1472:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>j,metadata:()=>h,viewport:()=>i});var d=c(5338),e=c(4105),f=c(2874);c(5692);let g=process.env.NEXT_PUBLIC_BASE_URL??"https://payapress.com",h={metadataBase:new URL(g),title:{default:"Busbar Calculator — PAYAPRESS",template:"%s | Busbar Calculator"},description:"Professional real-time copper busbar cost calculator for electrical panel fabricators. Live COMEX pricing, manual dimension inputs, 22 currencies, IEC/DIN standards.",keywords:["copper busbar","cost calculator","electrical panel","IEC 60317","Cu-ETP","live copper price","COMEX","busbar weight","شینه مسی","قیمت شینه مسی","محاسبه قیمت مس"],authors:[{name:"PAYAP MACHINERY",url:"https://www.payapress.com"}],creator:"PAYAP MACHINERY",publisher:"PAYAPRESS",robots:{index:!1,follow:!1,googleBot:{index:!1,follow:!1}},openGraph:{type:"website",locale:"en_US",url:g,siteName:"Busbar Calculator",title:"Busbar Calculator — PAYAPRESS",description:"Live COMEX copper pricing \xb7 manual dimension inputs \xb7 22 currencies \xb7 IEC/DIN standards.",images:[{url:"/og-image.png",width:1200,height:630,alt:"PAYAPRESS Copper Busbar Cost Calculator"}]},twitter:{card:"summary_large_image",title:"Busbar Calculator — PAYAPRESS",description:"Live COMEX copper pricing \xb7 22 currencies \xb7 IEC/DIN standards.",images:["/og-image.png"],creator:"@payapress"},icons:{icon:[{url:"/favicon.svg",type:"image/svg+xml"}],shortcut:"/favicon.svg",apple:[{url:"/apple-icon",sizes:"180x180",type:"image/png"}],other:[{rel:"mask-icon",url:"/favicon.svg",color:"#cd7f32"}]},appLinks:{},appleWebApp:{capable:!0,title:"Busbar Calc",statusBarStyle:"black-translucent",startupImage:[]},manifest:"/manifest.json",alternates:{canonical:g}},i={width:"device-width",initialScale:1,minimumScale:1,viewportFit:"cover",themeColor:"#cd7f32"};function j({children:a}){return(0,d.jsxs)("html",{lang:"en",style:{background:"#060608"},suppressHydrationWarning:!0,children:[(0,d.jsx)("meta",{httpEquiv:"Cache-Control",content:"no-cache, no-store, must-revalidate"}),(0,d.jsx)("meta",{httpEquiv:"Pragma",content:"no-cache"}),(0,d.jsx)("meta",{httpEquiv:"Expires",content:"0"}),(0,d.jsx)("style",{dangerouslySetInnerHTML:{__html:"html,body{background:#060608!important;color:#f0f0f0;margin:0;padding:0;font-family:ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}*{box-sizing:border-box}"}}),(0,d.jsxs)("body",{style:{background:"#060608"},children:[(0,d.jsx)(f.default,{}),a,(0,d.jsx)(e.default,{id:"err-capture",strategy:"beforeInteractive",children:`
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
                __pp_errDiv.innerHTML = '<b style="color:#ef4444">PAYAPRESS JS ERROR (send this to dev):</b>\\n';
                document.body.appendChild(__pp_errDiv);
              }
              __pp_errDiv.innerHTML += msg + '\\n';
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
            var m = msg + '\\n  @ ' + file + ':' + e.lineno + ':' + e.colno;
            if (e.error && e.error.stack) m += '\\n' + e.error.stack;
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
            if (reason && reason.stack) m += '\\n' + reason.stack;
            window.__pp_errs.push(m);
            __pp_showErr(m);
          });
        `}),(0,d.jsx)(e.default,{id:"sw-register",strategy:"afterInteractive",children:`
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
        `})]})]})}},2314:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,3597,23)),Promise.resolve().then(c.t.bind(c,6893,23)),Promise.resolve().then(c.t.bind(c,9748,23)),Promise.resolve().then(c.t.bind(c,6060,23)),Promise.resolve().then(c.t.bind(c,7184,23)),Promise.resolve().then(c.t.bind(c,9576,23)),Promise.resolve().then(c.t.bind(c,3041,23)),Promise.resolve().then(c.t.bind(c,1384,23))},2328:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>f}),c(5338);var d=c(7523);let e={size:{width:180,height:180},contentType:"image/png"};async function f(a){let{__metadata_id__:b,...c}=await a.params,f=(0,d.fillMetadataSegment)(".",c,"apple-icon"),{generateImageMetadata:g}=e;function h(a,b){let c={alt:a.alt,type:a.contentType||"image/png",url:f+(b?"/"+b:"")+"?02d4ff0720825f90"},{size:d}=a;return d&&(c.sizes=d.width+"x"+d.height),c}return g?(await g({params:c})).map((a,b)=>{let c=(a.id||b)+"";return h(a,c)}):[h(e,"")]}},2874:(a,b,c)=>{"use strict";c.d(b,{default:()=>d});let d=(0,c(7954).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/home/user/payapresswebapp/src/components/SplashScreen.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/home/user/payapresswebapp/src/components/SplashScreen.tsx","default")},3044:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>f}),c(5338);var d=c(7523);let e={size:{width:512,height:512},contentType:"image/png"};async function f(a){let{__metadata_id__:b,...c}=await a.params,f=(0,d.fillMetadataSegment)(".",c,"icon"),{generateImageMetadata:g}=e;function h(a,b){let c={alt:a.alt,type:a.contentType||"image/png",url:f+(b?"/"+b:"")+"?f060b5f113789b85"},{size:d}=a;return d&&(c.sizes=d.width+"x"+d.height),c}return g?(await g({params:c})).map((a,b)=>{let c=(a.id||b)+"";return h(a,c)}):[h(e,"")]}},4182:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>d});let d=(0,c(7954).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/home/user/payapresswebapp/src/app/global-error.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/home/user/payapresswebapp/src/app/global-error.tsx","default")},5199:(a,b,c)=>{Promise.resolve().then(c.bind(c,5682))},5362:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,1603,23)),Promise.resolve().then(c.t.bind(c,8495,23)),Promise.resolve().then(c.t.bind(c,5170,23)),Promise.resolve().then(c.t.bind(c,7526,23)),Promise.resolve().then(c.t.bind(c,8922,23)),Promise.resolve().then(c.t.bind(c,9234,23)),Promise.resolve().then(c.t.bind(c,2263,23)),Promise.resolve().then(c.bind(c,2146))},5682:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>d});let d=(0,c(7954).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/home/user/payapresswebapp/src/app/error.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/home/user/payapresswebapp/src/app/error.tsx","default")},5692:()=>{},6019:(a,b,c)=>{Promise.resolve().then(c.bind(c,9800))},6699:(a,b,c)=>{Promise.resolve().then(c.bind(c,4182))},6908:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>e});var d=c(1124);function e({error:a,reset:b}){return(0,d.jsxs)("div",{style:{minHeight:"100svh",background:"#060608",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",fontFamily:"system-ui, sans-serif",textAlign:"center",gap:"1.25rem"},children:[(0,d.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 64 64",width:"56",height:"56",children:[(0,d.jsx)("defs",{children:(0,d.jsxs)("linearGradient",{id:"eg",x1:"0",y1:"0",x2:"1",y2:"1",children:[(0,d.jsx)("stop",{offset:"0%",stopColor:"#e8953a"}),(0,d.jsx)("stop",{offset:"100%",stopColor:"#a85c18"})]})}),(0,d.jsx)("rect",{width:"64",height:"64",rx:"14",fill:"url(#eg)"}),(0,d.jsx)("rect",{x:"12",y:"27",width:"40",height:"10",rx:"2.5",fill:"white",opacity:"0.95"})]}),(0,d.jsx)("p",{style:{color:"#cd7f32",fontWeight:700,letterSpacing:"0.18em",fontSize:"0.75rem",textTransform:"uppercase"},children:"PAYAPRESS"}),(0,d.jsx)("p",{style:{color:"#f0f0f0",fontWeight:700,fontSize:"1.1rem",lineHeight:1.4,margin:0},children:"Something went wrong"}),(0,d.jsx)("p",{style:{color:"#71717a",fontSize:"0.85rem",maxWidth:"28rem",lineHeight:1.6},children:"The app encountered an unexpected error. Tap the button below to try again. If the problem persists, do a hard refresh (pull down to refresh on iOS)."}),(0,d.jsx)("button",{onClick:b,style:{background:"linear-gradient(135deg,#cd7f32,#b87333)",color:"#fff",border:"none",borderRadius:"0.5rem",padding:"0.7rem 2rem",fontSize:"0.9rem",fontWeight:600,cursor:"pointer",marginTop:"0.5rem"},children:"Try Again"})]})}c(8301)},7964:(a,b,c)=>{"use strict";c.d(b,{default:()=>f});var d=c(1124),e=c(8301);function f(){let[a,b]=(0,e.useState)("hidden");return"hidden"===a?null:(0,d.jsxs)("div",{"aria-hidden":"true",style:{position:"fixed",inset:0,zIndex:9999,background:"#060608",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:0,transition:"opacity 0.6s ease",opacity:+("fading"!==a),pointerEvents:"none"},children:[(0,d.jsx)("div",{style:{animation:"pp_splash_in 0.5s cubic-bezier(0.34,1.56,0.64,1) both"},children:(0,d.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 64 64",width:"88",height:"88",children:[(0,d.jsx)("defs",{children:(0,d.jsxs)("linearGradient",{id:"pp_g",x1:"0",y1:"0",x2:"1",y2:"1",children:[(0,d.jsx)("stop",{offset:"0%",stopColor:"#e8953a"}),(0,d.jsx)("stop",{offset:"100%",stopColor:"#a85c18"})]})}),(0,d.jsx)("rect",{width:"64",height:"64",rx:"14",fill:"url(#pp_g)"}),(0,d.jsx)("rect",{x:"12",y:"27",width:"40",height:"10",rx:"2.5",fill:"white",opacity:"0.95"}),(0,d.jsx)("rect",{x:"18",y:"19",width:"36",height:"9",rx:"2.5",fill:"white",opacity:"0.55",transform:"skewX(-9) translate(-2,0)"}),(0,d.jsx)("rect",{x:"14",y:"38",width:"32",height:"7",rx:"2",fill:"white",opacity:"0.3",transform:"skewX(6) translate(1,0)"})]})}),(0,d.jsx)("p",{style:{color:"#cd7f32",fontSize:"1.35rem",fontWeight:700,letterSpacing:"0.22em",marginTop:"1.4rem",fontFamily:"system-ui, sans-serif",animation:"pp_splash_in 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both"},children:"PAYAPRESS"}),(0,d.jsx)("p",{style:{color:"rgba(255,255,255,0.28)",fontSize:"0.65rem",letterSpacing:"0.18em",marginTop:"0.4rem",fontFamily:"system-ui, sans-serif",animation:"pp_splash_in 0.5s 0.2s ease both"},children:"BUSBAR CALCULATOR"})]})}},8327:(a,b,c)=>{Promise.resolve().then(c.bind(c,6908))},8437:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,7532,23)),Promise.resolve().then(c.bind(c,2874))},9800:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>f});var d=c(1124),e=c(8301);function f({error:a,reset:b}){let[c,f]=(0,e.useState)(""),g=[a?.message,a?.stack,c].filter(Boolean).join("\n\n");return(0,d.jsx)("html",{lang:"en",children:(0,d.jsxs)("body",{style:{margin:0,background:"#060608",minHeight:"100svh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",fontFamily:"system-ui, sans-serif",textAlign:"center",gap:"1rem"},children:[(0,d.jsx)("p",{style:{color:"#cd7f32",fontWeight:700,letterSpacing:"0.18em",fontSize:"0.75rem",textTransform:"uppercase"},children:"PAYAPRESS"}),(0,d.jsx)("p",{style:{color:"#f0f0f0",fontWeight:700,fontSize:"1.1rem"},children:"Something went wrong"}),!!g&&(0,d.jsx)("pre",{style:{color:"#ef4444",fontSize:"0.65rem",background:"#0c0c0f",border:"1px solid #1c1c23",borderRadius:"0.5rem",padding:"0.75rem 1rem",maxWidth:"90vw",overflowX:"auto",textAlign:"left",whiteSpace:"pre-wrap",wordBreak:"break-all"},children:g}),(0,d.jsx)("button",{onClick:b,style:{background:"linear-gradient(135deg,#cd7f32,#b87333)",color:"#fff",border:"none",borderRadius:"0.5rem",padding:"0.7rem 2rem",fontSize:"0.9rem",fontWeight:600,cursor:"pointer"},children:"Try Again"})]})})}}};