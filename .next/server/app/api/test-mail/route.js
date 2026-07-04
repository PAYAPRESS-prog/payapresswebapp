(()=>{var a={};a.id=178,a.ids=[178],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4274:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>F,patchFetch:()=>E,routeModule:()=>A,serverHooks:()=>D,workAsyncStorage:()=>B,workUnitAsyncStorage:()=>C});var d={};c.r(d),c.d(d,{GET:()=>z,dynamic:()=>y,runtime:()=>x});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(81410),w=c(7749);let x="nodejs",y="force-dynamic";async function z(a){let{searchParams:b}=new URL(a.url),c=b.get("to");if(!(0,w.E)(`testmail:${(0,w.T)(a)}`,5,6e4))return u.NextResponse.json({error:"Too many requests"},{status:429});let d=process.env.ADMIN_KEY,e=a.headers.get("x-admin-key")??b.get("key")??"";if(!d||d.length<16||e!==d)return u.NextResponse.json({error:"Not found"},{status:404});let f={configured:(0,v.nf)(),SMTP_HOST:process.env.SMTP_HOST??"(not set)",SMTP_PORT:process.env.SMTP_PORT??"(not set)",SMTP_USER:process.env.SMTP_USER??"(not set)",SMTP_PASS:process.env.SMTP_PASS?"(set)":"(not set)"};if(!c)return u.NextResponse.json({config:f,usage:"Add ?to=your@email.com to send a test email"});try{return await (0,v.sj)({to:c,subject:"Delivery Test — Busbar Calculator",category:"transactional",html:`<div style="font-family:Arial,sans-serif;padding:20px">
               <h2 style="color:#cd7f32">Email delivery test</h2>
               <p>If you received this, SMTP is working correctly.</p>
               <p style="color:#888;font-size:12px">Sent at ${new Date().toISOString()}</p>
             </div>`,text:`Email delivery test

If you received this, SMTP is working correctly.

Sent at ${new Date().toISOString()}`}),u.NextResponse.json({ok:!0,config:f,sent_to:c,time:new Date().toISOString()})}catch(a){return u.NextResponse.json({ok:!1,config:f,error:String(a)},{status:500})}}let A=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/test-mail/route",pathname:"/api/test-mail",filename:"route",bundlePath:"app/api/test-mail/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/home/user/payapresswebapp/src/app/api/test-mail/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:B,workUnitAsyncStorage:C,serverHooks:D}=A;function E(){return(0,g.patchFetch)({workAsyncStorage:B,workUnitAsyncStorage:C})}async function F(a,b,c){var d;let e="/api/test-mail/route";"/index"===e&&(e="/");let g=await A.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||A.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===A.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>A.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>A.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await A.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},z),b}},l=await A.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await A.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},7749:(a,b,c)=>{"use strict";c.d(b,{E:()=>e,T:()=>f});let d=new Map;function e(a,b,c){let e=Date.now(),f=d.get(a);return!f||e>f.resetAt?(d.set(a,{count:1,resetAt:e+c}),!0):(f.count++,f.count<=b)}function f(a){return a.headers.get("x-forwarded-for")?.split(",")[0].trim()??a.headers.get("x-real-ip")??"unknown"}setInterval(()=>{let a=Date.now();for(let[b,c]of d)a>c.resetAt&&d.delete(b)},3e5).unref()},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14985:a=>{"use strict";a.exports=require("dns")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},74075:a=>{"use strict";a.exports=require("zlib")},78335:()=>{},79551:a=>{"use strict";a.exports=require("url")},79646:a=>{"use strict";a.exports=require("child_process")},81410:(a,b,c)=>{"use strict";c.d(b,{nC:()=>o,nf:()=>h,pg:()=>m,sj:()=>k,ze:()=>n});var d=c(52731),e=c(55511),f=c.n(e);let g=null;function h(){return!!(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASS)}let i=()=>process.env.SMTP_FROM??process.env.SMTP_USER??"info@calculator.payapress.com",j="https://calculator.payapress.com";async function k(a){let b=(g||(g=function(){let a=process.env.SMTP_HOST,b=Number(process.env.SMTP_PORT??465),c=process.env.SMTP_USER,e=process.env.SMTP_PASS;return a&&c&&e?d.createTransport({host:a,port:b,secure:465===b,auth:{user:c,pass:e},tls:{rejectUnauthorized:!0},pool:!0,maxConnections:3,socketTimeout:12e3}):null}()),g);if(!b)return void console.warn("[mailer] SMTP not configured — skipping email to",a.to);let c=i(),e=c.split("@")[1]??"calculator.payapress.com",h=`<${f().randomUUID()}@${e}>`,j="bulk"===a.category,k={"X-Mailer":"Busbar-Calculator-Mailer/1.0","List-Unsubscribe":a.listUnsubscribe??`<mailto:${c}?subject=unsubscribe>`};j?(k.Precedence="bulk",k["List-Unsubscribe-Post"]="List-Unsubscribe=One-Click"):k["Auto-Submitted"]="auto-generated",await b.sendMail({from:`"Busbar Calculator" <${c}>`,replyTo:c,to:a.to,subject:a.subject,messageId:h,html:a.html,text:a.text,headers:k})}function l(a,b,c=""){return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Busbar Calculator</title>
<style>
  body{margin:0;padding:0;background:#f2f3f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;}
  .outer{background:#f2f3f5;padding:32px 16px;}
  .wrap{max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;
        box-shadow:0 4px 16px rgba(0,0,0,0.10);}
  .header{background:#d71920;background:linear-gradient(135deg,#d71920 0%,#e8531f 55%,#f7941d 100%);
          padding:28px 28px 22px;text-align:center;}
  .header img{display:inline-block;}
  .header-logo{font-size:20px;font-weight:800;letter-spacing:-0.01em;color:#ffffff;margin-top:10px;}
  .header-tag{font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;
              color:rgba(255,255,255,0.85);margin-top:4px;}
  .body{padding:30px 30px 26px;}
  h1{margin:0 0 14px;font-size:21px;font-weight:800;color:#16181d;letter-spacing:-0.01em;}
  p{margin:0 0 13px;font-size:14px;line-height:1.75;color:#4b5563;}
  .btn{display:inline-block;margin:10px 0 6px;padding:13px 32px;
       background:#d71920;background:linear-gradient(135deg,#e8531f,#f7941d);
       color:#ffffff !important;font-size:14px;font-weight:700;border-radius:10px;text-decoration:none;}
  .feature{margin:0 0 10px;padding:12px 16px;background:#faf7f2;border:1px solid #f0e6d8;
           border-radius:10px;font-size:13px;line-height:1.6;color:#4b5563;}
  .feature b{color:#b45309;}
  .price-row{display:block;padding:12px 16px;margin:0 0 8px;background:#fafafa;
             border:1px solid #eeeeee;border-left:3px solid #f7941d;border-radius:8px;
             font-size:13px;color:#374151;}
  .price-row b{color:#16181d;}
  .price-val{float:right;font-weight:800;color:#b45309;}
  .divider{height:1px;background:#eeeeee;margin:20px 0;}
  .muted{font-size:12px;color:#9ca3af;}
  .footer{background:#16181d;padding:22px 28px;font-size:11px;color:#9ca3af;
          text-align:center;line-height:1.9;}
  .footer a{color:#f7941d;text-decoration:none;}
  .footer-brand{font-size:12px;font-weight:700;color:#e5e7eb;letter-spacing:0.04em;}
</style>
</head>
<body>
<div style="display:none;max-height:0;overflow:hidden;">${c}</div>
<div class="outer">
<div class="wrap">
  <div class="header">
    <img src="${j}/mr-busbar.png" width="58" height="166" alt="Mr Busbar"
         style="width:58px;height:auto;"/>
    <div class="header-logo">Busbar Calculator</div>
    <div class="header-tag">Live copper &amp; aluminum pricing</div>
  </div>
  <div class="body">
    ${a}
  </div>
  <div class="footer">
    <span class="footer-brand">PAYAP MACHINERY</span><br/>
    Precision busbar tools for electrical engineers<br/>
    <a href="${j}/busbar-calculator">Calculator</a> &nbsp;\xb7&nbsp;
    <a href="${j}/terms">Terms</a> &nbsp;\xb7&nbsp;
    <a href="${j}/privacy">Privacy</a> &nbsp;\xb7&nbsp; ${b}<br/>
    \xa9 2026 PAYAP MACHINERY \xb7 All Rights Reserved
  </div>
</div>
</div>
</body>
</html>`}function m(a){return{subject:"Welcome to Busbar Calculator — your account is ready",html:l(`
    <h1>Welcome aboard! 🎉</h1>
    <p>Your Busbar Calculator account is ready. Here's what you just unlocked:</p>
    <div class="feature">🔖 <b>Save &amp; bookmark</b> — keep every calculation in your history, on any device</div>
    <div class="feature">⚖️ <b>Compare configurations</b> — copper vs aluminum, side by side with live deltas</div>
    <div class="feature">✂️ <b>Waste calculator</b> — blade kerf &amp; punch-out losses, per cut</div>
    <div class="feature">🔔 <b>Price alerts</b> — enable the bell to get your saved prices by email</div>
    <div style="text-align:center;">
      <a class="btn" href="${j}/busbar-calculator">Open the Calculator</a>
    </div>
    <div class="divider"></div>
    <p class="muted">Signed up as ${a}. If this wasn't you, simply ignore this email.</p>
  `,`<a href="mailto:${i()}?subject=unsubscribe">Unsubscribe</a>`,"Your account is ready — saving, comparing and price alerts are unlocked."),text:`Welcome to Busbar Calculator!

Your account is ready. You just unlocked:
- Save & bookmark calculations to your history
- Compare copper vs aluminum configurations side by side
- Waste calculator (blade kerf & punch-out)
- Price alerts for your saved configurations

Open the app: ${j}/busbar-calculator

---
Signed up as: ${a}
\xa9 2026 PAYAP MACHINERY
Unsubscribe: mailto:${i()}?subject=unsubscribe`}}function n(a,b){return{subject:"Reset your Busbar Calculator password",html:l(`
    <h1>Reset your password</h1>
    <p>We received a request to reset the password for your Busbar Calculator account. Click the button below to choose a new password. This link expires in 30 minutes.</p>
    <a class="btn" href="${b}">Reset Password</a>
    <p style="margin-top:20px;font-size:12px;color:#aaa;">If you didn't request this, you can safely ignore this email — your password will not change.</p>
    <p style="margin-top:8px;font-size:12px;color:#aaa;">Account: ${a}</p>
  `,`<a href="mailto:${i()}?subject=unsubscribe">Unsubscribe</a>`),text:`Reset your Busbar Calculator password

We received a request to reset your password.
Reset link (expires in 30 minutes): ${b}

If you didn't request this, ignore this email — your password will not change.

---
Account: ${a}
\xa9 2025 PAYAP MACHINERY`}}function o(a){return{subject:"\uD83D\uDD14 Price alerts activated — Busbar Calculator",html:l(`
    <h1>🔔 Price alerts activated</h1>
    <p>You're all set! From now on we'll keep you posted on the metal market:</p>
    <div class="feature">📈 <b>Daily digest</b> — live COMEX copper &amp; LME aluminum prices for your saved configurations</div>
    <div class="feature">⚡ <b>Feature news</b> — price alerts, trends and new tools, the moment they ship</div>
    <p>Tip: the more configurations you bookmark, the more useful your digest gets.</p>
    <div style="text-align:center;">
      <a class="btn" href="${j}/busbar-calculator">Save a Configuration</a>
    </div>
    <div class="divider"></div>
    <p class="muted">Subscribed as ${a}. You can unsubscribe anytime with one click below.</p>
  `,`<a href="mailto:${i()}?subject=unsubscribe">Unsubscribe</a>`,"Price alerts are on — daily copper & aluminum prices for your saved busbars."),text:`Price alerts activated — Busbar Calculator

You're all set! You'll receive:
- A daily digest of live copper & aluminum prices for your saved configurations
- News about price alerts, trends and new tools

Open the app: ${j}/busbar-calculator

---
Subscribed as: ${a}
\xa9 2026 PAYAP MACHINERY
Unsubscribe: mailto:${i()}?subject=unsubscribe`}}},81630:a=>{"use strict";a.exports=require("http")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[1331,1692,5112],()=>b(b.s=4274));module.exports=c})();