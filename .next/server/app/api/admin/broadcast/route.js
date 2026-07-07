(()=>{var a={};a.id=5391,a.ids=[5391],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4573:a=>{"use strict";a.exports=require("node:buffer")},7749:(a,b,c)=>{"use strict";c.d(b,{E:()=>e,T:()=>f});let d=new Map;function e(a,b,c){let e=Date.now();if(d.size>=5e4&&!d.has(a)){for(let[a,b]of d)e>b.resetAt&&d.delete(a);if(d.size>=5e4)return!0}let f=d.get(a);return!f||e>f.resetAt?(d.set(a,{count:1,resetAt:e+c}),!0):(f.count++,f.count<=b)}function f(a){let b=a.headers.get("x-real-ip"),c=a.headers.get("x-forwarded-for")?.split(",")[0]?.trim();return(b||c||"unknown").slice(0,45)||"unknown"}setInterval(()=>{let a=Date.now();for(let[b,c]of d)a>c.resetAt&&d.delete(b)},3e5).unref()},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14985:a=>{"use strict";a.exports=require("dns")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},19771:a=>{"use strict";a.exports=require("process")},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},28303:a=>{function b(a){var b=Error("Cannot find module '"+a+"'");throw b.code="MODULE_NOT_FOUND",b}b.keys=()=>[],b.resolve=b,b.id=28303,a.exports=b},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},35552:(a,b,c)=>{"use strict";c.d(b,{P:()=>g,d:()=>f});var d=c(29382);let e=globalThis;function f(){if(e.__mysqlPool)return e.__mysqlPool;let a=process.env.DB_HOST??"localhost",b="localhost"===a.trim().toLowerCase()?"127.0.0.1":a.trim(),c=d.createPool({host:b,port:Number(process.env.DB_PORT??3306),user:(process.env.DB_USER??"").trim(),password:process.env.DB_PASSWORD??"",database:(process.env.DB_NAME??"").trim(),waitForConnections:!0,connectionLimit:5,queueLimit:0,enableKeepAlive:!0,keepAliveInitialDelay:1e4});return e.__mysqlPool=c,c}function g(){return!!(process.env.DB_USER&&process.env.DB_NAME)}},41204:a=>{"use strict";a.exports=require("string_decoder")},42844:(a,b,c)=>{"use strict";c.d(b,{W:()=>e});let d="https://calculator.payapress.com".replace(/\/+$/,""),e=d.startsWith("https://calculator.payapress.com")?d:"https://calculator.payapress.com"},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},49349:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>I,patchFetch:()=>H,routeModule:()=>D,serverHooks:()=>G,workAsyncStorage:()=>E,workUnitAsyncStorage:()=>F});var d={};c.r(d),c.d(d,{POST:()=>C,dynamic:()=>A,runtime:()=>z});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(71989),w=c(35552),x=c(81410),y=c(7749);let z="nodejs",A="force-dynamic";async function B(a){let b=(0,w.d)(),[c]=await b.query("subscribers"===a?"SELECT email FROM email_subscriptions":"optin"===a?"SELECT email FROM users WHERE opt_in = 1":"SELECT email FROM users");return Array.from(new Set(c.map(a=>String(a.email).toLowerCase()))).filter(Boolean)}async function C(a){let b;if(!await (0,v.ZT)(a))return u.NextResponse.json({error:"Not found"},{status:404});if(!(0,w.P)())return u.NextResponse.json({error:"Database not configured"},{status:503});if(!(0,x.nf)())return u.NextResponse.json({error:"SMTP is not configured"},{status:503});try{b=await a.json()}catch{return u.NextResponse.json({error:"Invalid request"},{status:400})}let c=["all","optin","subscribers"].includes(b.audience)?b.audience:"subscribers",d=(b.subject??"").trim().slice(0,160),e=(b.message??"").trim().slice(0,12e3);if(!d||!e)return u.NextResponse.json({error:"Subject and message are required"},{status:400});try{let f=await B(c);if(b.dryRun)return u.NextResponse.json({ok:!0,recipients:f.length});if(0===f.length)return u.NextResponse.json({error:"No recipients in this audience"},{status:400});let g=(0,x.k0)(d,e),h=0,i=0;for(let a=0;a<f.length;a+=20){let b=f.slice(a,a+20);for(let a of(await Promise.allSettled(b.map(a=>(0,x.sj)({to:a,subject:g.subject,html:g.html,text:g.text})))))"fulfilled"===a.status?h++:i++}return await (0,v.sb)("broadcast",`${c} \xb7 "${d}" \xb7 sent ${h}/${f.length}`,(0,y.T)(a)),u.NextResponse.json({ok:!0,sent:h,failed:i,total:f.length})}catch(a){return console.error("[admin/broadcast]",a),u.NextResponse.json({error:"Server error"},{status:500})}}let D=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/admin/broadcast/route",pathname:"/api/admin/broadcast",filename:"route",bundlePath:"app/api/admin/broadcast/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/home/user/payapresswebapp/src/app/api/admin/broadcast/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:E,workUnitAsyncStorage:F,serverHooks:G}=D;function H(){return(0,g.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:F})}async function I(a,b,c){var d;let e="/api/admin/broadcast/route";"/index"===e&&(e="/");let g=await D.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,resolvedPathname:C}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[C]);if(F&&!x){let a=!!y.routes[C],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||D.isDev||x||(G="/index"===(G=C)?"/":G);let H=!0===D.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>D.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>D.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&A&&B&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await D.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})},z),b}},l=await D.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",A?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await D.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},53053:a=>{"use strict";a.exports=require("node:diagnostics_channel")},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66136:a=>{"use strict";a.exports=require("timers")},71989:(a,b,c)=>{"use strict";c.d(b,{D2:()=>j,Gy:()=>k,UA:()=>t,Up:()=>m,V8:()=>s,ZT:()=>n,dn:()=>q,e4:()=>o,nQ:()=>h,sb:()=>r,zt:()=>l});var d=c(81714),e=c(55391),f=c(55511),g=c(35552);let h="bc_admin";function i(){return new TextEncoder().encode(process.env.JWT_SECRET??"")}function j(){let a=process.env.ADMIN_KEY;return"string"==typeof a&&a.length>=16&&(process.env.JWT_SECRET??"").length>=16}function k(a){let b=(process.env.ADMIN_KEY??"").trim();if(!b||b.length<16||!a)return!1;let c=(0,f.createHash)("sha256").update(a.trim()).digest(),d=(0,f.createHash)("sha256").update(b).digest();return(0,f.timingSafeEqual)(c,d)}async function l(){return new d.P({purpose:"admin"}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("12h").sign(i())}async function m(a){try{let{payload:b}=await (0,e.V)(a,i(),{algorithms:["HS256"]});return"admin"===b.purpose}catch{return!1}}async function n(a){if(!j())return!1;let b=a.cookies.get(h)?.value;return!!(b&&await m(b))||k(a.headers.get("x-admin-key")??a.nextUrl.searchParams.get("key")??"")}function o(){return{httpOnly:!0,secure:!0,sameSite:"strict",path:"/",maxAge:43200}}let p=!1;async function q(){if(p||!(0,g.P)())return;let a=(0,g.d)();await a.query(`CREATE TABLE IF NOT EXISTS admin_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(64) NOT NULL,
    target VARCHAR(255) NOT NULL DEFAULT '',
    ip VARCHAR(64) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_time (created_at),
    INDEX idx_audit_action (action)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`),await a.query(`CREATE TABLE IF NOT EXISTS cron_runs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    detail VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cron_name (name, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`),await a.query(`CREATE TABLE IF NOT EXISTS app_errors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route VARCHAR(191) NOT NULL,
    message VARCHAR(500) NOT NULL DEFAULT '',
    hits INT NOT NULL DEFAULT 1,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_err (route, message(180))
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`),p=!0}async function r(a,b,c){try{await q(),await (0,g.d)().query("INSERT INTO admin_audit (action, target, ip) VALUES (?, ?, ?)",[a.slice(0,64),b.slice(0,255),c.slice(0,64)])}catch(a){console.error("[admin] audit write failed:",a)}}async function s(a,b=""){try{await q(),await (0,g.d)().query("INSERT INTO cron_runs (name, detail) VALUES (?, ?)",[a.slice(0,64),b.slice(0,255)])}catch(a){console.error("[admin] cron_runs write failed:",a)}}async function t(a,b=200){await q();let c=Math.max(1,Math.min(500,Math.floor(b))),[d]=a?await (0,g.d)().query(`SELECT action, target, ip, created_at FROM admin_audit
         WHERE action = ? ORDER BY created_at DESC LIMIT ${c}`,[a]):await (0,g.d)().query(`SELECT action, target, ip, created_at FROM admin_audit
         ORDER BY created_at DESC LIMIT ${c}`);return d}},74075:a=>{"use strict";a.exports=require("zlib")},78335:()=>{},79428:a=>{"use strict";a.exports=require("buffer")},79551:a=>{"use strict";a.exports=require("url")},79646:a=>{"use strict";a.exports=require("child_process")},81410:(a,b,c)=>{"use strict";c.d(b,{Nd:()=>q,Pv:()=>p,Vx:()=>s,k0:()=>t,nC:()=>r,nf:()=>i,pg:()=>n,sj:()=>l,ze:()=>o});var d=c(52731),e=c(42844),f=c(55511),g=c.n(f);let h=null;function i(){return!!(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASS)}let j=()=>process.env.SMTP_FROM??process.env.SMTP_USER??"info@calculator.payapress.com",k=e.W;async function l(a){let b=(h||(h=function(){let a=process.env.SMTP_HOST,b=Number(process.env.SMTP_PORT??465),c=process.env.SMTP_USER,e=process.env.SMTP_PASS;return a&&c&&e?d.createTransport({host:a,port:b,secure:465===b,auth:{user:c,pass:e},tls:{rejectUnauthorized:!0},pool:!0,maxConnections:3,socketTimeout:12e3}):null}()),h);if(!b)return void console.warn("[mailer] SMTP not configured — skipping email to",a.to);let c=j(),e=c.split("@")[1]??"calculator.payapress.com",f=`<${g().randomUUID()}@${e}>`,i="bulk"===a.category,k={"X-Mailer":"Busbar-Calculator-Mailer/1.0","List-Unsubscribe":a.listUnsubscribe??`<mailto:${c}?subject=unsubscribe>`};i?(k.Precedence="bulk",k["List-Unsubscribe-Post"]="List-Unsubscribe=One-Click"):k["Auto-Submitted"]="auto-generated",await b.sendMail({from:`"Busbar Calculator" <${c}>`,replyTo:c,to:a.to,subject:a.subject,messageId:f,html:a.html,text:a.text,headers:k})}function m(a,b,c=""){return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Busbar Calculator</title>
<style>
  body{margin:0;padding:0;background:#f2f3f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;}
  .outer{background:#f2f3f5;padding:32px 16px;}
  .wrap{width:100%;max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;
        box-shadow:0 4px 16px rgba(0,0,0,0.10);}
  .header{background:#d71920;background:linear-gradient(135deg,#d71920 0%,#e8531f 55%,#f7941d 100%);
          padding:28px 28px 22px;text-align:center;}
  .header img{display:inline-block;}
  .header-logo{font-size:20px;font-weight:800;letter-spacing:-0.01em;color:#ffffff;margin-top:10px;}
  .header-tag{font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;
              color:rgba(255,255,255,0.85);margin-top:4px;}
  .body{padding:30px 30px 26px;}
  @media (max-width:520px){.body{padding:22px 18px 20px;}.header{padding:22px 18px 18px;}h1{font-size:19px;}}
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
    <img src="${k}/mr-busbar.png" width="58" height="166" alt="Mr Busbar"
         style="width:58px;height:auto;"/>
    <div class="header-logo">Busbar Calculator</div>
    <div class="header-tag">Live copper &amp; aluminum pricing</div>
  </div>
  <div class="body">
    ${a}
  </div>
  <div class="footer">
    <span class="footer-brand">Busbar Calculator</span><br/>
    Precision busbar tools for electrical engineers<br/>
    <a href="${k}/busbar-calculator">Calculator</a> &nbsp;\xb7&nbsp;
    <a href="${k}/terms">Terms</a> &nbsp;\xb7&nbsp;
    <a href="${k}/privacy">Privacy</a> &nbsp;\xb7&nbsp; ${b}<br/>
    \xa9 2026 Busbar Calculator \xb7 All Rights Reserved
  </div>
</div>
</div>
</body>
</html>`}function n(a){return{subject:"Welcome to Busbar Calculator — your account is ready",html:m(`
    <h1>Welcome aboard! 🎉</h1>
    <p>Your Busbar Calculator account is ready. Here's what you just unlocked:</p>
    <div class="feature">🔖 <b>Save &amp; bookmark</b> — keep every calculation in your history, on any device</div>
    <div class="feature">⚖️ <b>Compare configurations</b> — copper vs aluminum, side by side with live deltas</div>
    <div class="feature">✂️ <b>Waste calculator</b> — blade kerf &amp; punch-out losses, per cut</div>
    <div class="feature">🔔 <b>Price alerts</b> — enable the bell to get your saved prices by email</div>
    <div style="text-align:center;">
      <a class="btn" href="${k}/busbar-calculator">Open the Calculator</a>
    </div>
    <div class="divider"></div>
    <p class="muted">Signed up as ${a}. If this wasn't you, simply ignore this email.</p>
  `,`<a href="mailto:${j()}?subject=unsubscribe">Unsubscribe</a>`,"Your account is ready — saving, comparing and price alerts are unlocked."),text:`Welcome to Busbar Calculator!

Your account is ready. You just unlocked:
- Save & bookmark calculations to your history
- Compare copper vs aluminum configurations side by side
- Waste calculator (blade kerf & punch-out)
- Price alerts for your saved configurations

Open the app: ${k}/busbar-calculator

---
Signed up as: ${a}
\xa9 2026 Busbar Calculator
Unsubscribe: mailto:${j()}?subject=unsubscribe`}}function o(a,b){return{subject:"Reset your Busbar Calculator password",html:m(`
    <h1>Reset your password</h1>
    <p>We received a request to reset the password for your Busbar Calculator account. Click the button below to choose a new password. This link expires in 30 minutes.</p>
    <a class="btn" href="${b}">Reset Password</a>
    <p style="margin-top:20px;font-size:12px;color:#aaa;">If you didn't request this, you can safely ignore this email — your password will not change.</p>
    <p style="margin-top:8px;font-size:12px;color:#aaa;">Account: ${a}</p>
  `,`<a href="mailto:${j()}?subject=unsubscribe">Unsubscribe</a>`),text:`Reset your Busbar Calculator password

We received a request to reset your password.
Reset link (expires in 30 minutes): ${b}

If you didn't request this, ignore this email — your password will not change.

---
Account: ${a}
\xa9 2025 Busbar Calculator`}}function p(a){let b=`<a href="mailto:${j()}?subject=unsubscribe">Notifications</a>`,c=(a,b)=>`<div style="padding:10px 14px;margin:0 0 8px;background:#faf7f2;border:1px solid #f0e6d8;border-radius:8px;">
       <div style="font-size:11px;color:#9a7b4f;text-transform:uppercase;letter-spacing:0.04em;font-weight:700;">${a}</div>
       <div style="font-size:14px;color:#16181d;font-weight:600;word-break:break-word;line-height:1.5;margin-top:2px;">${b}</div>
     </div>`,d=m(`
    <h1>🆕 New user signed up</h1>
    <p class="muted" style="margin-top:-8px;">${new Date(a.time).toUTCString()}</p>
    ${c("Email",a.email)}
    ${c("User",a.userNumber?`#${a.userNumber}`:`id ${a.uid}`)}
    ${c("Location",a.location)}
    ${c("IP",a.ip)}
    ${c("Signed up from",a.page||"—")}
    ${c("Newsletter opt-in",a.optIn?"Yes":"No")}
    ${c("Device",a.userAgent||"—")}
    <div class="divider"></div>
    <div style="text-align:center;">
      <a class="btn" href="${k}/busbar-calculator">Open App</a>
    </div>
  `,b,`New signup: ${a.email} — ${a.location}`),e=`New user signed up — Busbar Calculator

Email:      ${a.email}
User:       ${a.userNumber?"#"+a.userNumber:"id "+a.uid}
Location:   ${a.location}
IP:         ${a.ip}
From page:  ${a.page||"-"}
Opt-in:     ${a.optIn?"Yes":"No"}
Device:     ${a.userAgent||"-"}
Time (UTC): ${new Date(a.time).toUTCString()}`;return{subject:`🆕 New signup: ${a.email}`,html:d,text:e}}function q(a,b){let c=m(`
    <h1>Confirm your email</h1>
    <p>Enter this code in the app to finish creating your account. It expires in 15 minutes.</p>
    <div style="text-align:center;margin:22px 0;">
      <span style="display:inline-block;padding:16px 28px;background:#faf7f2;border:1px solid #f0e6d8;
                   border-radius:12px;font-size:34px;font-weight:800;letter-spacing:0.35em;
                   color:#b45309;font-family:'Courier New',monospace;">${b}</span>
    </div>
    <p class="muted">If you didn't try to sign up for Busbar Calculator, you can safely ignore this email.</p>
  `,`<a href="mailto:${j()}?subject=unsubscribe">Unsubscribe</a>`,`Your Busbar Calculator verification code is ${b}`),d=`Confirm your email — Busbar Calculator

Your verification code: ${b}
It expires in 15 minutes.

If you didn't try to sign up, ignore this email.`;return{subject:`${b} is your Busbar Calculator verification code`,html:c,text:d}}function r(a){return{subject:"\uD83D\uDD14 Price alerts activated — Busbar Calculator",html:m(`
    <h1>🔔 Price alerts activated</h1>
    <p>You're all set! From now on we'll keep you posted on the metal market:</p>
    <div class="feature">📈 <b>Daily digest</b> — live COMEX copper &amp; LME aluminum prices for your saved configurations</div>
    <div class="feature">⚡ <b>Feature news</b> — price alerts, trends and new tools, the moment they ship</div>
    <p>Tip: the more configurations you bookmark, the more useful your digest gets.</p>
    <div style="text-align:center;">
      <a class="btn" href="${k}/busbar-calculator">Save a Configuration</a>
    </div>
    <div class="divider"></div>
    <p class="muted">Subscribed as ${a}. You can unsubscribe anytime with one click below.</p>
  `,`<a href="mailto:${j()}?subject=unsubscribe">Unsubscribe</a>`,"Price alerts are on — daily copper & aluminum prices for your saved busbars."),text:`Price alerts activated — Busbar Calculator

You're all set! You'll receive:
- A daily digest of live copper & aluminum prices for your saved configurations
- News about price alerts, trends and new tools

Open the app: ${k}/busbar-calculator

---
Subscribed as: ${a}
\xa9 2026 Busbar Calculator
Unsubscribe: mailto:${j()}?subject=unsubscribe`}}function s(a,b,c,d){let e=`<a href="mailto:${j()}?subject=unsubscribe">Unsubscribe</a>`,f=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),g=d.length?d.map(a=>`
      <div class="price-row">
        <span class="price-val">${a.price}</span>
        <b>${a.name}</b><br/>
        <span style="color:#9ca3af;">${"copper"===a.metal?"\uD83D\uDFE0 Copper":"\uD83D\uDD35 Aluminum"} \xb7 ${a.dims}</span>
      </div>`).join(""):`<p class="muted">You have no saved configurations yet — bookmark one in the app and it will appear here tomorrow.</p>`,h=m(`
    <h1>📈 Your daily busbar prices</h1>
    <p class="muted" style="margin-top:-8px;">${f}</p>
    <div class="price-row"><span class="price-val">$${b.toFixed(3)} /kg</span><b>Copper</b> — COMEX spot</div>
    <div class="price-row"><span class="price-val">$${c.toFixed(3)} /kg</span><b>Aluminum</b> — LME spot</div>
    <div class="divider"></div>
    <p style="font-weight:700;color:#16181d;">Your saved configurations</p>
    ${g}
    <div style="text-align:center;">
      <a class="btn" href="${k}/busbar-calculator">Open Live Calculator</a>
    </div>
    <div class="divider"></div>
    <p class="muted">Sent to ${a} because price alerts are enabled.</p>
  `,e,`Copper $${b.toFixed(2)}/kg \xb7 Aluminum $${c.toFixed(2)}/kg — today's digest.`),i=[`Your daily busbar prices — ${f}`,"",`Copper (COMEX):   $${b.toFixed(3)} /kg`,`Aluminum (LME):   $${c.toFixed(3)} /kg`,"","Your saved configurations:",...d.length?d.map(a=>`- ${a.name} (${a.metal}, ${a.dims}): ${a.price}`):["(none yet — bookmark one in the app)"],"",`Open the app: ${k}/busbar-calculator`,"","---",`Sent to: ${a}`,`Unsubscribe: mailto:${j()}?subject=unsubscribe`].join("\n");return{subject:`📈 Busbar prices today — Copper $${b.toFixed(2)}/kg`,html:h,text:i}}function t(a,b){let c=a=>a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),d=c(b.trim()).split(/\n{2,}/).map(a=>`<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3d4046;">${a.replace(/\n/g,"<br>")}</p>`).join(""),e=m(`<h1 style="margin:0 0 18px;font-size:21px;line-height:1.35;color:#17181c;">${c(a)}</h1>
     ${d}
     <p style="margin:24px 0 0;">
       <a href="https://calculator.payapress.com" style="display:inline-block;padding:12px 26px;border-radius:10px;background:linear-gradient(90deg,#f7941d,#d71920);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Open Busbar Calculator</a>
     </p>`,"You are receiving this because you have a Busbar Calculator account or price subscription.",a);return{subject:a,html:e,text:`${a}

${b.trim()}

https://calculator.payapress.com`}}},81630:a=>{"use strict";a.exports=require("http")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[5873,1692,9382,466,5112],()=>b(b.s=49349));module.exports=c})();