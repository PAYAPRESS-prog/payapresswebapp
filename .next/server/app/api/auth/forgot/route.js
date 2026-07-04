(()=>{var a={};a.id=990,a.ids=[990],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4573:a=>{"use strict";a.exports=require("node:buffer")},5974:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>K,patchFetch:()=>J,routeModule:()=>F,serverHooks:()=>I,workAsyncStorage:()=>G,workUnitAsyncStorage:()=>H});var d={};c.r(d),c.d(d,{POST:()=>E,dynamic:()=>C,runtime:()=>B});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(42844),w=c(35552),x=c(26396),y=c(67360),z=c(7749),A=c(81410);let B="nodejs",C="force-dynamic",D=v.W;async function E(a){let b,c=(0,z.T)(a);if(!(0,z.E)(`forgot:${c}`,3,9e5))return u.NextResponse.json({error:"Too many requests. Please wait a few minutes."},{status:429});if(!(0,w.P)()||!(0,y.Zx)()||!(0,A.nf)())return u.NextResponse.json({error:"Password reset is not available right now."},{status:503});try{b=await a.json()}catch{return u.NextResponse.json({error:"Invalid request."},{status:400})}let d=(b.email??"").trim().toLowerCase();if(!(0,y.B9)(d))return u.NextResponse.json({error:"Please enter a valid email."},{status:400});try{let a=await (0,x.Gs)(d);if(a){let b=await (0,y.PL)({uid:a.id,email:a.email}),c=`${D}/reset-password?token=${encodeURIComponent(b)}`,d=(0,A.ze)(a.email,c);(0,A.sj)({to:a.email,subject:d.subject,html:d.html,text:d.text}).catch(a=>console.error("[auth/forgot] reset email failed:",a))}return u.NextResponse.json({ok:!0})}catch(a){return console.error("[auth/forgot]",a),u.NextResponse.json({error:"Server error. Please try again."},{status:500})}}let F=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/auth/forgot/route",pathname:"/api/auth/forgot",filename:"route",bundlePath:"app/api/auth/forgot/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/home/user/payapresswebapp/src/app/api/auth/forgot/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:G,workUnitAsyncStorage:H,serverHooks:I}=F;function J(){return(0,g.patchFetch)({workAsyncStorage:G,workUnitAsyncStorage:H})}async function K(a,b,c){var d;let e="/api/auth/forgot/route";"/index"===e&&(e="/");let g=await F.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,resolvedPathname:C}=g,D=(0,j.normalizeAppPath)(e),E=!!(y.dynamicRoutes[D]||y.routes[C]);if(E&&!x){let a=!!y.routes[C],b=y.dynamicRoutes[D];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!E||F.isDev||x||(G="/index"===(G=C)?"/":G);let H=!0===F.isDev||!E,I=E&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>F.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>F.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&A&&B&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!E)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await F.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})},z),b}},l=await F.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,responseGenerator:k,waitUntil:c.waitUntil});if(!E)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",A?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&E||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await F.onRequestError(a,b,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})}),E)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},7749:(a,b,c)=>{"use strict";c.d(b,{E:()=>e,T:()=>f});let d=new Map;function e(a,b,c){let e=Date.now(),f=d.get(a);return!f||e>f.resetAt?(d.set(a,{count:1,resetAt:e+c}),!0):(f.count++,f.count<=b)}function f(a){return a.headers.get("x-forwarded-for")?.split(",")[0].trim()??a.headers.get("x-real-ip")??"unknown"}setInterval(()=>{let a=Date.now();for(let[b,c]of d)a>c.resetAt&&d.delete(b)},3e5).unref()},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14985:a=>{"use strict";a.exports=require("dns")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},19771:a=>{"use strict";a.exports=require("process")},21820:a=>{"use strict";a.exports=require("os")},26396:(a,b,c)=>{"use strict";c.d(b,{Gs:()=>g,Ln:()=>k,iR:()=>n,kg:()=>i,lC:()=>h,r7:()=>j});var d=c(35552);let e=!1;async function f(){if(e)return;let a=(0,d.d)();await a.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
      email         VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      opt_in        TINYINT(1)   NOT NULL DEFAULT 0,
      created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);let[b]=await a.query(`SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`),c=new Set(b.map(a=>String(a.COLUMN_NAME).toLowerCase()));for(let[b,d]of[["first_name","VARCHAR(100) NULL"],["last_name","VARCHAR(100) NULL"],["company","VARCHAR(150) NULL"],["phone","VARCHAR(30)  NULL"]])c.has(b)||await a.query(`ALTER TABLE users ADD COLUMN ${b} ${d}`).catch(a=>{console.error(`[users] failed to add column ${b}:`,a)});e=!0}async function g(a){await f();let b=(0,d.d)(),[c]=await b.query("SELECT id, email, password_hash, opt_in FROM users WHERE email = ? LIMIT 1",[a.toLowerCase()]);return c[0]??null}async function h(a){await f();let b=(0,d.d)(),[c]=await b.query("SELECT id, email, password_hash, opt_in, first_name, last_name, company, phone FROM users WHERE id = ? LIMIT 1",[a]);return c[0]??null}async function i(a,b,c){await f();let e=(0,d.d)(),[g]=await e.query("INSERT INTO users (email, password_hash, opt_in) VALUES (?, ?, ?)",[a.toLowerCase(),b,+!!c]);return g.insertId}async function j(a,b){await f();let c=(0,d.d)(),e=[],g=[];for(let[a,c]of Object.entries(b))e.push(`${a} = ?`),g.push(c??null);0!==e.length&&(g.push(a),await c.query(`UPDATE users SET ${e.join(", ")} WHERE id = ?`,g))}async function k(a,b){await f();let c=(0,d.d)();await c.query("UPDATE users SET password_hash = ? WHERE id = ?",[b,a])}let l=!1;async function m(){if(l)return;let a=(0,d.d)();await a.query(`
    CREATE TABLE IF NOT EXISTS deleted_accounts (
      id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
      original_uid   INT UNSIGNED NOT NULL,
      email          VARCHAR(255) NOT NULL,
      first_name     VARCHAR(100) NULL,
      last_name      VARCHAR(100) NULL,
      company        VARCHAR(150) NULL,
      phone          VARCHAR(30)  NULL,
      opt_in         TINYINT(1)   NOT NULL DEFAULT 0,
      history_count  INT          NOT NULL DEFAULT 0,
      registered_at  TIMESTAMP    NULL,
      deleted_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ip             VARCHAR(64)  NULL,
      user_agent     VARCHAR(512) NULL,
      PRIMARY KEY (id),
      INDEX idx_deleted_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `),l=!0}async function n(a,b){await m();let c=(0,d.d)(),[e]=await c.query(`SELECT id, email, first_name, last_name, company, phone, opt_in, created_at
     FROM users WHERE id = ? LIMIT 1`,[a]),f=e[0];if(!f)return;let[g]=await c.query("SELECT COUNT(*) AS c FROM busbar_history WHERE user_id = ?",[a]),h=Number(g[0]?.c)||0;await c.query(`INSERT INTO deleted_accounts
       (original_uid, email, first_name, last_name, company, phone, opt_in,
        history_count, registered_at, ip, user_agent)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,[f.id,f.email,f.first_name,f.last_name,f.company,f.phone,f.opt_in,h,f.created_at,b.ip.slice(0,64),b.userAgent.slice(0,512)]),await c.query("DELETE FROM busbar_history WHERE user_id = ?",[a]),await c.query("DELETE FROM email_subscriptions WHERE email = ?",[f.email]).catch(()=>{}),await c.query("DELETE FROM users WHERE id = ?",[a])}},27910:a=>{"use strict";a.exports=require("stream")},28303:a=>{function b(a){var b=Error("Cannot find module '"+a+"'");throw b.code="MODULE_NOT_FOUND",b}b.keys=()=>[],b.resolve=b,b.id=28303,a.exports=b},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},35552:(a,b,c)=>{"use strict";c.d(b,{P:()=>g,d:()=>f});var d=c(29382);let e=globalThis;function f(){if(e.__mysqlPool)return e.__mysqlPool;let a=process.env.DB_HOST??"localhost",b="localhost"===a.trim().toLowerCase()?"127.0.0.1":a.trim(),c=d.createPool({host:b,port:Number(process.env.DB_PORT??3306),user:(process.env.DB_USER??"").trim(),password:process.env.DB_PASSWORD??"",database:(process.env.DB_NAME??"").trim(),waitForConnections:!0,connectionLimit:5,queueLimit:0,enableKeepAlive:!0,keepAliveInitialDelay:1e4});return e.__mysqlPool=c,c}function g(){return!!(process.env.DB_USER&&process.env.DB_NAME)}},41204:a=>{"use strict";a.exports=require("string_decoder")},42844:(a,b,c)=>{"use strict";c.d(b,{W:()=>e});let d="https://calculator.payapress.com".replace(/\/+$/,""),e=d.startsWith("https://calculator.payapress.com")?d:"https://calculator.payapress.com"},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},53053:a=>{"use strict";a.exports=require("node:diagnostics_channel")},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66136:a=>{"use strict";a.exports=require("timers")},67360:(a,b,c)=>{"use strict";c.d(b,{B9:()=>s,BE:()=>k,Er:()=>j,Ji:()=>r,PL:()=>n,Q:()=>g,Q7:()=>l,Ud:()=>o,Zx:()=>i,_9:()=>p,vp:()=>q,zP:()=>m});var d=c(7028),e=c(81714),f=c(55391);let g="pp_session";function h(){let a=process.env.JWT_SECRET;if(!a||a.length<16)throw Error("JWT_SECRET env var is missing or too short (need ≥16 chars).");return new TextEncoder().encode(a)}function i(){let a=process.env.JWT_SECRET;return!!(a&&a.length>=16)}async function j(a){return d.Ay.hash(a,10)}async function k(a,b){return d.Ay.compare(a,b)}async function l(a){return new e.P({email:a.email}).setProtectedHeader({alg:"HS256"}).setSubject(String(a.uid)).setIssuedAt().setExpirationTime("30d").sign(h())}async function m(a){try{let{payload:b}=await (0,f.V)(a,h());return{uid:Number(b.sub),email:String(b.email)}}catch{return null}}async function n(a){return new e.P({email:a.email,purpose:"pwreset"}).setProtectedHeader({alg:"HS256"}).setSubject(String(a.uid)).setIssuedAt().setExpirationTime("30m").sign(h())}async function o(a){try{let{payload:b}=await (0,f.V)(a,h());if("pwreset"!==b.purpose)return null;return{uid:Number(b.sub),email:String(b.email)}}catch{return null}}async function p(a){return new e.P({...a,purpose:"signup-otp"}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("15m").sign(h())}async function q(a){try{let{payload:b}=await (0,f.V)(a,h());if("signup-otp"!==b.purpose)return null;return{email:String(b.email),ph:String(b.ph),optIn:!!b.optIn,codeHash:String(b.codeHash)}}catch{return null}}function r(a){return{httpOnly:!0,secure:!0,sameSite:"lax",path:"/",...a?{maxAge:2592e3}:{}}}function s(a){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)}},74075:a=>{"use strict";a.exports=require("zlib")},78335:()=>{},79428:a=>{"use strict";a.exports=require("buffer")},79551:a=>{"use strict";a.exports=require("url")},79646:a=>{"use strict";a.exports=require("child_process")},81410:(a,b,c)=>{"use strict";c.d(b,{Nd:()=>q,Pv:()=>p,Vx:()=>s,nC:()=>r,nf:()=>i,pg:()=>n,sj:()=>l,ze:()=>o});var d=c(52731),e=c(42844),f=c(55511),g=c.n(f);let h=null;function i(){return!!(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASS)}let j=()=>process.env.SMTP_FROM??process.env.SMTP_USER??"info@calculator.payapress.com",k=e.W;async function l(a){let b=(h||(h=function(){let a=process.env.SMTP_HOST,b=Number(process.env.SMTP_PORT??465),c=process.env.SMTP_USER,e=process.env.SMTP_PASS;return a&&c&&e?d.createTransport({host:a,port:b,secure:465===b,auth:{user:c,pass:e},tls:{rejectUnauthorized:!0},pool:!0,maxConnections:3,socketTimeout:12e3}):null}()),h);if(!b)return void console.warn("[mailer] SMTP not configured — skipping email to",a.to);let c=j(),e=c.split("@")[1]??"calculator.payapress.com",f=`<${g().randomUUID()}@${e}>`,i="bulk"===a.category,k={"X-Mailer":"Busbar-Calculator-Mailer/1.0","List-Unsubscribe":a.listUnsubscribe??`<mailto:${c}?subject=unsubscribe>`};i?(k.Precedence="bulk",k["List-Unsubscribe-Post"]="List-Unsubscribe=One-Click"):k["Auto-Submitted"]="auto-generated",await b.sendMail({from:`"Busbar Calculator" <${c}>`,replyTo:c,to:a.to,subject:a.subject,messageId:f,html:a.html,text:a.text,headers:k})}function m(a,b,c=""){return`<!DOCTYPE html>
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
\xa9 2025 Busbar Calculator`}}function p(a){let b=`<a href="mailto:${j()}?subject=unsubscribe">Notifications</a>`,c=(a,b)=>`<div class="price-row"><span class="price-val" style="max-width:60%;text-align:right;word-break:break-all;">${b}</span><b>${a}</b></div>`,d=m(`
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
  `,e,`Copper $${b.toFixed(2)}/kg \xb7 Aluminum $${c.toFixed(2)}/kg — today's digest.`),i=[`Your daily busbar prices — ${f}`,"",`Copper (COMEX):   $${b.toFixed(3)} /kg`,`Aluminum (LME):   $${c.toFixed(3)} /kg`,"","Your saved configurations:",...d.length?d.map(a=>`- ${a.name} (${a.metal}, ${a.dims}): ${a.price}`):["(none yet — bookmark one in the app)"],"",`Open the app: ${k}/busbar-calculator`,"","---",`Sent to: ${a}`,`Unsubscribe: mailto:${j()}?subject=unsubscribe`].join("\n");return{subject:`📈 Busbar prices today — Copper $${b.toFixed(2)}/kg`,html:h,text:i}}},81630:a=>{"use strict";a.exports=require("http")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[1331,1692,9382,5331,5112],()=>b(b.s=5974));module.exports=c})();