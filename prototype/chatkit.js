/* BOC chat kit: everything WhatsApp Business chats do, inside BOC.
   - chat with any number without saving it; save, block or report later
   - reply, react, forward, star, edit, delete (for me / for everyone), copy, message info, read ticks
   - attachments: photo, document, location, contact, poll, voice note, product
   - chat controls: voice/video call, search in chat, mute, pin, archive, mark unread, disappearing
     messages, media and starred lists, export, clear, block, report
   - groups, chat link and QR, shoppable status updates, how-to guides
   Loaded after ledger.js. */
(function(){
"use strict";
Object.assign(IC,{
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
 smile:'<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0"/><path d="M9 9.5v.5M15 9.5v.5"/>',
 clip:'<path d="M20 11.5 12.2 19.3a5 5 0 0 1-7.1-7.1l8.3-8.3a3.4 3.4 0 0 1 4.8 4.8l-8.3 8.3a1.7 1.7 0 0 1-2.4-2.4l7.4-7.4"/>',
 video:'<rect x="3" y="6.5" width="12.5" height="11" rx="2"/><path d="m15.5 10.5 5-3v9l-5-3z"/>',
 dots:'<circle cx="12" cy="5.5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="18.5" r="1.3"/>',
 reply:'<path d="M10 6 4 12l6 6"/><path d="M4 12h9a7 7 0 0 1 7 7"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
 trash:'<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
 pinx:'<path d="M9 3.5h6l-1 6 3.5 3.5h-11L10 9.5z"/><path d="M12 13v7.5"/>',
 mute:'<path d="M4 9.5v5h3.5l5 4v-13l-5 4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
 archive:'<rect x="3.5" y="4" width="17" height="4.5" rx="1"/><path d="M5 8.5V20h14V8.5M10 12.5h4"/>',
 ban:'<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
 flag:'<path d="M5 21V4h11l-1.5 4L16 12H5"/>',
 timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5M9.5 2.5h5"/>',
 image:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-5-5L6 19.5"/>',
 group:'<circle cx="9" cy="8.5" r="3.4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9.5" r="2.6"/><path d="M16.5 14.6A5.3 5.3 0 0 1 21.5 20"/>',
 qr:'<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM18 14h2M14 18v2"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7v.5M12 17v.3"/>',
 play:'<path d="M8 5.5v13l10.5-6.5z"/>',
 poll:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
 fwd:'<path d="M14 6l6 6-6 6"/><path d="M20 12h-9a7 7 0 0 0-7 7"/>',
 bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
 link:'<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>'
});
const DAY=864e5,MIN=6e4;
const ticks=n=>n===1?`<svg class="tk" viewBox="0 0 18 12" aria-label="Sent"><path d="M2 6.5 5.5 10 12 2"/></svg>`:`<svg class="tk ${n===3?"rd":""}" viewBox="0 0 22 12" aria-label="${n===3?"Read":"Delivered"}"><path d="M1.5 6.5 5 10l6.5-8"/><path d="M8.5 9 9.5 10 16 2"/></svg>`;

/* ---------- every message gets an id and a time ---------- */
const _post=post;
window.post=post=function(cid,by,m){_post(cid,by,m);const c=C(cid),x=c.msgs[c.msgs.length-1];x.ts=Date.now();x.id="m"+(++SEQ);
  if(c.archived&&by!==side()&&!c.muted)c.archived=false};

/* ---------- seed: an unsaved number, a group, statuses ---------- */
if(!C("u1"))chat({id:"u1",name:"+91 99001 23456",kind:"customer",unsaved:true,labels:["New lead"],color:"#8D8E94",acct:"Not in your contacts",crm:{stage:"Lead",notes:[]},
  msgs:[M("cp","Hi, saw your Kanjivaram sarees on Instagram. Do you deliver to Hyderabad?","11:02 am")],unread:1,ts:Date.now()-60*MIN});
if(!C("g1"))chat({id:"g1",name:"Coimbatore Retailers Circle",kind:"group",members:["Arjun Retail Pvt Ltd","Nisha Boutique","Lakshmi Silks & Sarees"],labels:["Group"],color:"#111214",acct:"Group · 4 members",
  msgs:[M("sys","You created this group","Mon"),M("cp",{type:"text",text:"Is the new Pongal rate list out?",from:"Nisha Boutique"},"9:40 am"),M("cp",{type:"poll",poll:{q:"Best day for the January stock fair?",opts:[{t:"Saturday 10th",v:2},{t:"Sunday 11th",v:1},{t:"Saturday 17th",v:0}],mine:null}},"9:44 am",{from:"Lakshmi Silks & Sarees"})],ts:Date.now()-90*MIN});
S.statuses=S.statuses||[
  {biz:"st",ts:Date.now()-2*3600e3,items:[{pid:"p1",text:"New maroon Kanjivaram just in. 12 pieces."},{pid:"p4",text:"Chanderi dupattas, three new colours."}],views:128},
  {biz:"gs",ts:Date.now()-5*3600e3,items:[{svc:"s2",text:"December bridal trial slots are open."}],views:64},
  {biz:"ms",ts:Date.now()-8*3600e3,items:[{name:"Malabar black pepper, 500 g",price:450,color:"#3E3A2F",text:"Fresh harvest from Wayanad."}],views:210}];
S.seenStatus=S.seenStatus||[];

/* ---------- chat with any number ---------- */
const fmtPhone=d=>"+91 "+d.slice(0,5)+" "+d.slice(5);
window.chatWithNumber=function(raw){const d=String(raw).replace(/\D/g,"").replace(/^91(?=\d{10}$)/,"");
  if(!/^[6-9]\d{9}$/.test(d))return{error:"Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9."};
  if(isBiz()){let c=S.chats.find(x=>!x.custOnly&&x.phone===d);
    if(!c){const id="n"+d;chat({id,name:fmtPhone(d),phone:d,kind:"customer",unsaved:true,labels:["New lead"],color:"#8D8E94",acct:"Not in your contacts",crm:{stage:"Lead",notes:[]},msgs:[],ts:Date.now()});c=C(id)}
    return{id:c.id}}
  const key="u"+d;if(!BIZ[key])BIZ[key]={key,name:fmtPhone(d),color:"#8D8E94",kind:"retail",cat:"Not a registered business",city:"Not shared",since:"just now",orders:0,rating:null,reviews:0,reply:"No reply history yet",lv:{phone:1},hours:"",ships:"",returns:"",disputes:""};
  let c=S.chats.find(x=>x.custOnly&&x.biz===key);if(!c){chat({id:"x"+d,name:"Meera Nair",kind:"customer",biz:key,cp:"me",custOnly:true,color:PARTY[5],msgs:[],ts:Date.now()});c=C("x"+d)}
  return{id:c.id}};
window.saveContact=function(cid,name){const c=C(cid);if(!name||!name.trim())return false;c.name=name.trim();c.unsaved=false;c.acct="Personal account · phone verified";return true};

/* ---------- sending: reply, edit, groups, blocked ---------- */
const quoteOf=(c,i)=>{const m=c.msgs[i];return{i,who:m.by===side()?"You":m.from||chatTitle(c),text:m.type==="text"?m.text:({image:"Photo",file:"Document",location:"Location",contact:"Contact",poll:"Poll: "+(m.poll&&m.poll.q),voice:"Voice message",doc:KIND[(D(m.ref)||{}).kind]||"Document"})[m.type]||"Message"}};
const _send=sendText;
window.sendText=sendText=function(cid){const c=C(cid),v=(S.drafts[cid]||"").trim();
  if(c.blocked){toast("Unblock this contact to send messages");return}
  if(S.editing&&S.editing.cid===cid){if(v){const m=c.msgs[S.editing.i];m.text=v;m.edited=true}S.drafts[cid]="";S.editing=null;render();return}
  if(!v)return;const n=c.msgs.length,rp=S.replyTo&&S.replyTo[cid];
  if(c.kind==="group"){S.drafts[cid]="";post(cid,side(),v);const who=c.members[Math.floor(Math.random()*c.members.length)];sim(cid,1300,()=>post(cid,"cp",{type:"text",text:"Noted, thanks!",from:who}))}
  else _send(cid);
  if(rp!=null&&c.msgs[n]){c.msgs[n].reply=quoteOf(c,rp);S.replyTo[cid]=null}
  render()};
function postMine(cid,m){const c=C(cid);if(c.blocked){toast("Unblock this contact to send messages");return}post(cid,side(),m);S.sheet=null;
  const rp=S.replyTo&&S.replyTo[cid];if(rp!=null){c.msgs[c.msgs.length-1].reply=quoteOf(c,rp);S.replyTo[cid]=null}render()}

/* ---------- new message types ---------- */
const _card=cardHTML;
window.cardHTML=cardHTML=function(m,c){
  if((m.type==="rate"||m.type==="doc")&&m.ref&&!D(m.ref))return "";
  switch(m.type){
    case "image":return `<div class="ck-img" style="background:${m.color||"#6FA3D6"}">${ic("image")}</div>${m.caption?`<div class="ck-cap">${esc(m.caption)}</div>`:""}`;
    case "file":return `<div class="ck-file"><span class="ck-fi">${ic("file","s")}</span><span class="ck-fm"><b>${esc(m.name)}</b><small>${esc(m.meta)}</small></span><button class="ck-ib" data-act="ckopen" aria-label="Open">${ic("chevr","s")}</button></div>`;
    case "location":return `<div class="ck-map">${ic("pin")}</div><div class="ck-cap"><b>${esc(m.place)}</b><small>${esc(m.addr)}</small></div>`;
    case "contact":return `<div class="ck-file">${av(m.name,"#566366",40)}<span class="ck-fm"><b>${esc(m.name)}</b><small>${esc(m.phone)}</small></span></div><div class="acts"><button data-act="ckmsgnum" data-n="${esc(m.phone)}">Message</button><button data-act="cksavenum" data-n="${esc(m.phone)}" data-nm="${esc(m.name)}">Save</button></div>`;
    case "voice":return `<div class="ck-voice"><button class="ck-play" data-act="ckplay" aria-label="Play voice message">${ic("play","s")}</button><span class="ck-wave">${Array.from({length:28},(_,i)=>`<i style="height:${20+Math.round(70*Math.abs(Math.sin(i*1.7+m.len)))}%"></i>`).join("")}</span><small class="num">0:${String(m.len).padStart(2,"0")}</small></div>`;
    case "poll":{const p=m.poll,tot=p.opts.reduce((a,o)=>a+o.v,0)||1,i=c.msgs.indexOf(m);
      return `<div class="ck-poll"><div class="ck-pq">${ic("poll","s")}<b>${esc(p.q)}</b></div>${p.opts.map((o,k)=>`<button class="ck-po ${p.mine===k?"on":""}" data-act="ckvote" data-i="${i}" data-o="${k}"><span class="ck-pr" style="width:${Math.round(o.v/tot*100)}%"></span><span class="ck-pt">${p.mine===k?ic("check","s"):"<i></i>"}${esc(o.t)}</span><span class="num">${o.v}</span></button>`).join("")}<small>${p.opts.reduce((a,o)=>a+o.v,0)} votes · tap to vote</small></div>`}
    case "statusreply":return `<div class="ck-sr" style="--sc:${m.color}"><small>Replied to ${esc(m.owner)}'s status</small><b>${esc(m.stext)}</b></div><div class="ck-cap">${esc(m.text)}</div>`;
  }
  return _card(m,c)};

/* ---------- chat screen: header actions, banners, search, reply/edit bars, composer ---------- */
const _cv=chatView;
window.chatView=chatView=function(v){let h=_cv(v);const c=C(v.id);if(!c)return h;
  h=h.replace(/<button class="ib" data-act="(?:profile|bizprofile)" data-id="[^"]*" aria-label="Details">[\s\S]*?<\/button>/,
    `${c.kind!=="group"?`<button class="ib" data-act="ckcall" data-v="voice" aria-label="Voice call">${ic("phone","s")}</button><button class="ib" data-act="ckcall" data-v="video" aria-label="Video call">${ic("video","s")}</button>`:""}<button class="ib" data-act="ckmenu" aria-label="Chat options">${ic("dots","s")}</button>`);
  if(c.kind==="group")h=h.replace(/<div class="sub">[^<]*<\/div>/,`<div class="sub">You, ${esc(c.members.map(n=>n.split(" ")[0]).join(", "))}</div>`);
  if(c.disappear)h=h.replace('</h2>',` <span class="ck-dis" title="Disappearing messages">${ic("timer","s")}</span></h2>`);
  let top="";
  if(isBiz()&&c.unsaved)top+=`<div class="ck-unsaved"><span>${ic("user","s")}<b>Not in your contacts</b>Messages from unknown numbers come straight in, no saving needed.</span><div><button data-act="cksave">Save contact</button><button data-act="ckblock">Block</button></div></div>`;
  if(c.blocked)top+=`<div class="banner warn" style="margin:8px 12px">${ic("ban")}<span><b>You blocked this contact</b>They can't message or call you. <button class="linkbtn" data-act="ckunblock">Unblock</button></span></div>`;
  const q=(S.csearch||{})[c.id];
  if(q!=null)top=`<div class="ck-search">${ic("search","s")}<input id="csq" placeholder="Search in this chat" value="${esc(q)}" aria-label="Search in this chat"><span class="num">${q?c.msgs.filter(m=>(m.text||"").toLowerCase().includes(q.toLowerCase())).length+" found":""}</span><button class="ck-ib" data-act="cksearchx" aria-label="Close search">${ic("close","s")}</button></div>`+top;
  if(top)h=h.replace('<div class="body" id="chatbody">',top+'<div class="body" id="chatbody">');
  /* reply / edit bar */
  const rp=S.replyTo&&S.replyTo[c.id];
  const bar=S.editing&&S.editing.cid===c.id?`<div class="ck-rbar"><span class="quote"><b>Editing message</b>${esc(c.msgs[S.editing.i].text)}</span><button class="ck-ib" data-act="ckcancel" aria-label="Cancel">${ic("close","s")}</button></div>`
    :rp!=null&&c.msgs[rp]?`<div class="ck-rbar"><span class="quote"><b>${esc(quoteOf(c,rp).who)}</b>${esc(quoteOf(c,rp).text)}</span><button class="ck-ib" data-act="ckcancel" aria-label="Cancel reply">${ic("close","s")}</button></div>`:"";
  if(c.blocked)return h.replace(/<div class="composer">[\s\S]*$/,`<div class="composer ck-blocked"><button class="pg-btn ghost" data-act="ckunblock">Unblock to send messages</button></div>`);
  /* composer: attach (business documents live inside it), emoji, input, voice, send */
  h=h.replace(/<div class="composer">(?:<button class="round ghost" data-act="plus"[^>]*>[\s\S]*?<\/button>)?/,
    `${bar}<div class="ck-emoji" ${S.emoji===c.id?"":"hidden"}>${["🙏","👍","😊","❤️","🎉","✅","📦","🙂"].map(e=>`<button data-act="ckemoji" data-e="${e}">${e}</button>`).join("")}</div><div class="composer"><button class="round ghost" data-act="ckattach" aria-label="Attach">${ic("clip")}</button><button class="ck-emb" data-act="ckemojis" aria-label="Emoji">${ic("smile","s")}</button>`);
  h=h.replace(/(<button class="round" data-act="send")/,`<button class="round ghost" data-act="ckvoice" aria-label="Record a voice message">${ic("mic")}</button>$1`);
  return h};

/* decorate rendered messages: quotes, forwarded, reactions, star, edited, ticks, options button, search */
function decorate(){const v=cur();if(v.name!=="chat")return;const c=C(v.id);if(!c)return;
  const els=[...document.querySelectorAll("#chatbody .chat > .sys, #chatbody .chat > .m")];if(els.length!==c.msgs.length)return;
  const q=((S.csearch||{})[c.id]||"").toLowerCase();let pending=false;
  els.forEach((el,i)=>{const m=c.msgs[i];if(m.by==="sys")return;const mine=m.by===side();
    if(m.deleted)el.classList.add("ck-del");
    if(m.fwd)el.insertAdjacentHTML("afterbegin",`<div class="ck-fwd">${ic("fwd","s")}Forwarded</div>`);
    if(m.reply)el.insertAdjacentHTML("afterbegin",`<button class="quote ck-q" data-act="ckjump" data-i="${m.reply.i}"><b>${esc(m.reply.who)}</b>${esc(m.reply.text)}</button>`);
    const t=el.querySelector(":scope > .time");
    if(t){t.insertAdjacentHTML("afterbegin",(m.star?`<span class="ck-st">${ic("star","s")}</span>`:"")+(m.edited?"Edited · ":""));
      if(mine&&!m.deleted){const later=c.msgs.slice(i+1).some(x=>x.by!==side()&&x.by!=="sys"),age=m.ts?Date.now()-m.ts:1e9;const n=later||age>4000&&!c.blocked?3:age>900?2:1;if(n<3)pending=true;t.insertAdjacentHTML("beforeend",ticks(n))}}
    if(m.react)el.insertAdjacentHTML("beforeend",`<span class="ck-rx">${m.react}</span>`);
    if(!m.deleted)el.insertAdjacentHTML("beforeend",`<button class="ck-mm" data-act="ckmsg" data-i="${i}" aria-label="Message options">${ic("dots","s")}</button>`);
    if(q)el.classList.add((m.text||"").toLowerCase().includes(q)?"ck-hit":"ck-dim")});
  if(pending&&!decorate.t)decorate.t=setTimeout(()=>{decorate.t=null;if(cur().name==="chat")render()},1200)}

/* ---------- sheets ---------- */
const row=(act,icon,label,data="",cls="")=>`<button class="ck-row ${cls}" data-act="${act}" ${data}>${ic(icon,"s")}<span>${label}</span></button>`;
const _rs=renderSheet;
window.renderSheet=renderSheet=function(){const sh=S.sheet,c=cur().name==="chat"?C(cur().id):null;
  switch(sh.type){
    case "newchat":{const people=S.chats.filter(x=>visibleChat(x)&&x.kind!=="team").slice(0,8);
      return sheetWrap("New chat",`<div class="ck-num"><span>+91</span><input id="cknum" inputmode="tel" placeholder="Mobile number, saved or not" value="${esc(sh.num||"")}" aria-label="Mobile number"><button class="btn sm" data-act="cknumgo">Chat</button></div>${sh.err?`<p class="ck-err">${esc(sh.err)}</p>`:`<p class="muted" style="margin:6px 2px 12px;font-size:12.5px">No need to save the number first. You can save it later from the chat.</p>`}
        <div class="ck-rows">${isBiz()?row("ckgroupnew","group","New group")+row("go","mega","New broadcast",'data-s="broadcast"')+row("go","link","Your chat link and QR",'data-s="chatlink"'):row("tab","compass","Find a business",'data-t="explore"')}</div>
        <div class="lab" style="margin-top:12px">Recent</div><div class="ck-rows">${people.map(x=>`<button class="ck-row" data-act="open" data-id="${x.id}">${av(chatTitle(x),chatColor(x),32)}<span>${esc(chatTitle(x))}</span></button>`).join("")}</div>`)}
    case "ckattach":{const t=(a,icon,l,col)=>`<button class="ck-at" data-act="${a}"><span style="background:${col}">${ic(icon)}</span>${l}</button>`;
      return sheetWrap("Send",`<div class="ck-ats">${t("ckphoto","image","Photo","#6B4FB3")}${t("ckdoc","file","Document","#2F6FB0")}${t("ckloc","pin","Location","#1E9E45")}${t("ckcontact","user","Contact","#0F7C86")}${t("ckpollnew","poll","Poll","#B97A06")}${t("ckvoice","mic","Voice note","#E5484D")}${isBiz()?t("ckprod","tag","Product","#111214")+t("plus","card","Quote, invoice, order","#111214"):""}</div>`)}
    case "ckmsg":{const m=c.msgs[sh.i],mine=m.by===side(),age=m.ts?Date.now()-m.ts:1e9;
      return sheetWrap("Message",`<div class="ck-rxs">${["👍","❤️","😂","😮","🙏","🎉"].map(e=>`<button class="${m.react===e?"on":""}" data-act="ckreact" data-e="${e}" aria-label="React ${e}">${e}</button>`).join("")}</div>
        <div class="ck-rows">${row("ckreply","reply","Reply")}${m.type==="text"?row("ckcopy","copy","Copy"):""}${row("ckfwd","fwd","Forward")}${row("ckstar","star",m.star?"Unstar":"Star")}${mine&&m.type==="text"&&age<15*MIN?row("ckedit","pen","Edit"):""}${mine?row("ckinfo","info","Message info"):""}${row("ckdelme","trash","Delete for me","","bad")}${mine&&age<60*MIN?row("ckdelall","trash","Delete for everyone","","bad"):""}</div>`)}
    case "ckinfo":{const m=c.msgs[sh.i],t=m.ts?new Date(m.ts):null,f=d=>d?d.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"}):m.time;
      return sheetWrap("Message info",`<div class="ck-rows">${row("noop","check","Sent · "+f(t))}${row("noop","check","Delivered · "+f(t&&new Date(+t+800)))}${row("noop","check","Read · "+(c.msgs.slice(sh.i+1).some(x=>x.by!==side()&&x.by!=="sys")?f(t&&new Date(+t+60000)):"not yet"))}</div>`)}
    case "ckfwd":return sheetWrap("Forward to",`<div class="ck-rows">${S.chats.filter(x=>visibleChat(x)&&x.id!==c.id&&!x.blocked).map(x=>`<button class="ck-row" data-act="ckfwdto" data-id="${x.id}">${av(chatTitle(x),chatColor(x),32)}<span>${esc(chatTitle(x))}</span></button>`).join("")}</div>`);
    case "ckmenu":{const pin=c.pinned,mut=c.muted;
      return sheetWrap(esc(chatTitle(c)),`<div class="ck-rows">${isBiz()&&c.unsaved?row("cksave","user","Save contact"):""}${row(c.kind==="group"?"ckginfo":isBiz()?"profile":"bizprofile",c.kind==="group"?"group":"info",c.kind==="group"?"Group info":isBiz()?"Contact and CRM":"Business info",`data-id="${isBiz()?c.id:c.biz}"`)}
        ${row("cksearch","search","Search in chat")}${row("ckmedia","image","Media, links and documents")}${row("ckstarred","star","Starred messages")}
        ${row("ckmute","mute",mut?"Unmute notifications":"Mute notifications")}${row("ckdisappear","timer","Disappearing messages"+(c.disappear?" · "+c.disappear:""))}
        ${row("ckpin","pinx",pin?"Unpin chat":"Pin chat")}${row("ckarchive","archive",c.archived?"Unarchive chat":"Archive chat")}${row("ckunread","chat","Mark as unread")}
        ${isBiz()&&c.kind!=="group"?row("clabels","tag","Labels",`data-id="${c.id}"`):""}${row("ckexport","file","Export chat")}${row("ckclear","trash","Clear chat")}
        ${c.kind==="group"?row("ckexit","close","Exit group","","bad"):(c.blocked?row("ckunblock","ban","Unblock"):row("ckblock","ban","Block","","bad"))+row("ckreport","flag","Report","","bad")}</div>`)}
    case "ckdis":return sheetWrap("Disappearing messages",`<p class="muted" style="margin:0 0 10px">New messages in this chat disappear after the time you choose. Invoices, orders, payments and contracts are always kept.</p><div class="ck-rows">${["Off","24 hours","7 days","90 days"].map(o=>row("ckdisset",(c.disappear||"Off")===o?"check":"timer",o,`data-v="${o}"`)).join("")}</div>`);
    case "ckcall":return `<div class="ck-call"><div class="ck-cav">${av(chatTitle(c),chatColor(c),96)}</div><b>${esc(chatTitle(c))}</b><span>${sh.state==="on"?"0:"+String(sh.sec||0).padStart(2,"0"):sh.v==="video"?"Video calling…":"Calling…"}</span><small>End-to-end encrypted call · simulated</small><div class="ck-cbtns"><button data-act="ckmutecall" aria-label="Mute microphone">${ic("mic")}</button><button class="end" data-act="ckend" aria-label="End call">${ic("phone")}</button><button data-act="ckspk" aria-label="Speaker">${ic(sh.v==="video"?"video":"mega")}</button></div></div>`;
    case "ckpoll":return sheetWrap("Create poll",`<div class="field"><label for="pq">Question</label><input id="pq" value="${esc(sh.q||"")}" placeholder="Ask a question"></div>${[0,1,2].map(k=>`<div class="field"><label for="po${k}">Option ${k+1}${k===2?" (optional)":""}</label><input id="po${k}" placeholder="Option"></div>`).join("")}${sh.err?`<p class="ck-err">${esc(sh.err)}</p>`:""}`,`<button class="btn" data-act="ckpollsend">Send poll</button>`);
    case "ckcontact":return sheetWrap("Share a contact",`<div class="ck-rows">${S.chats.filter(x=>!x.custOnly&&["customer","b2b","supplier"].includes(x.kind)).slice(0,8).map(x=>`<button class="ck-row" data-act="ckcontactsend" data-id="${x.id}">${av(x.name,x.color,32)}<span>${esc(x.name)}</span></button>`).join("")}</div>`);
    case "ckprod":return sheetWrap("Send a product",`<div class="ck-rows">${S.products.filter(p=>p.vis!=="Hidden").map(p=>`<button class="ck-row" data-act="ckprodsend" data-id="${p.id}"><span class="pg-sw" style="background:${p.color};width:32px;height:32px"></span><span>${esc(p.name)} · ${money(p.price)}</span></button>`).join("")}</div>`);
    case "cksave":return sheetWrap("Save contact",`<div class="field"><label for="ckname">Name</label><input id="ckname" placeholder="e.g. Priya Hyderabad" value=""></div><div class="field"><label>Mobile</label><input value="${esc(c.name.startsWith("+")?c.name:"")}" readonly></div>${sh.err?`<p class="ck-err">${esc(sh.err)}</p>`:""}`,`<button class="btn" data-act="cksavego">Save</button>`);
    case "ckreport":return sheetWrap("Report "+esc(chatTitle(c)),`<p style="margin:0 0 12px">The last 5 messages are sent to BOC for review. ${esc(chatTitle(c))} isn't told.</p><label class="ck-chk"><input type="checkbox" id="ckrb" checked> Also block this contact</label>`,`<button class="btn" data-act="ckreportgo" style="background:var(--bad);color:#fff">Report</button>`);
    case "ckgroup":{const pick=sh.pick||[];return sheetWrap("New group",`<div class="field"><label for="gname">Group name</label><input id="gname" placeholder="e.g. Diwali wholesale buyers" value="${esc(sh.name||"")}"></div><div class="lab">Members · ${pick.length} chosen</div><div class="ck-rows">${S.chats.filter(x=>!x.custOnly&&["customer","b2b","supplier","team"].includes(x.kind)).map(x=>`<button class="ck-row ${pick.includes(x.id)?"on":""}" data-act="ckgpick" data-id="${x.id}" role="checkbox" aria-checked="${pick.includes(x.id)}">${av(x.name,x.color,32)}<span>${esc(x.name)}</span>${pick.includes(x.id)?ic("check","s"):""}</button>`).join("")}</div>${sh.err?`<p class="ck-err">${esc(sh.err)}</p>`:""}`,`<button class="btn" data-act="ckgcreate">Create group</button>`)}
    case "ckstatusnew":return sheetWrap("Post a status",`<p class="muted" style="margin:0 0 10px">Your customers see it for 24 hours and can order straight from it.</p><div class="ck-rows">${S.products.filter(p=>p.vis==="Everyone").map(p=>`<button class="ck-row" data-act="ckstpost" data-id="${p.id}"><span class="pg-sw" style="background:${p.color};width:32px;height:32px"></span><span>${esc(p.name)} · ${money(p.price)}</span></button>`).join("")}</div>`);
    case "ckstatus":return statusViewer(sh);
  }
  return _rs()};

/* ---------- statuses ---------- */
function statusViewer(sh){const s=S.statuses.find(x=>x.biz===sh.biz),it=s.items[sh.i],b=BIZ[s.biz],mine=isBiz()&&s.biz==="st";
  const p=it.pid?P(it.pid):null,svc=it.svc&&SERVICES[s.biz]?SERVICES[s.biz].find(x=>x.id===it.svc):null;
  const name=p?p.name:svc?svc.name:it.name,price=p?p.price:svc?svc.price:it.price,color=p?p.color:it.color||b.color;
  const hrs=Math.max(1,Math.round((Date.now()-s.ts)/3600e3));
  return `<div class="ck-sv" role="dialog" aria-label="Status from ${esc(b.name)}"><div class="ck-bars">${s.items.map((_,k)=>`<i class="${k<sh.i?"done":k===sh.i?"on":""}"></i>`).join("")}</div>
  <div class="ck-sh">${av(b.name,b.color,36)}<span><b>${esc(mine?"My status":b.name)}</b><small>${hrs}h ago</small></span><button class="ck-ib" data-act="closesheet" aria-label="Close">${ic("close")}</button></div>
  <button class="ck-tap l" data-act="ckstnav" data-d="-1" aria-label="Previous"></button><button class="ck-tap r" data-act="ckstnav" data-d="1" aria-label="Next"></button>
  <div class="ck-sbody" style="background:${color}"><p>${esc(it.text)}</p></div>
  <div class="ck-sprod"><span class="pg-sw" style="background:${color}"></span><span class="ck-fm"><b>${esc(name)}</b><small class="num">${money(price)}${svc?" · "+svc.dur:""}</small></span>
    ${mine?`<span class="ck-views">${ic("info","s")}Seen by ${s.views}</span>`:`<button class="pg-btn" data-act="ckstbuy" style="width:auto;min-height:44px;gap:6px">${svc?"Book":"Buy"} · ${money(price)}</button>`}</div>
  ${mine?"":`<div class="ck-sreply"><input id="ckstr" placeholder="Reply to ${esc(b.name)}…" aria-label="Reply to status"><button class="round" data-act="ckstreply" aria-label="Send reply">${ic("send")}</button></div>`}</div>`}
function statusRow(){const list=S.statuses.filter(s=>isBiz()?true:s.biz!=="__");
  const mineS=list.find(s=>s.biz==="st");const others=list.filter(s=>!(isBiz()&&s.biz==="st"));
  return `<div class="ck-stories" aria-label="Status updates">${isBiz()?`<button class="ck-story" data-act="${mineS?"ckstopen":"ckstnew"}" data-b="st"><span class="ck-ring ${mineS?"":"none"}">${av("Shree Textiles",BIZ.st.color,52)}${mineS?"":`<i class="ck-plus">${ic("plus","s")}</i>`}</span><small>My status</small></button>${mineS?`<button class="ck-story" data-act="ckstnew"><span class="ck-ring none">${ic("plus")}</span><small>Add</small></button>`:""}`:""}
    ${others.map(s=>`<button class="ck-story" data-act="ckstopen" data-b="${s.biz}"><span class="ck-ring ${S.seenStatus.includes(s.biz)?"seen":""}">${av(BIZ[s.biz].name,BIZ[s.biz].color,52)}</span><small>${esc(BIZ[s.biz].name.split(" ")[0])}</small></button>`).join("")}</div>`}
const _cl=chatList;
window.chatList=chatList=function(){let h=_cl();return h.replace(/(<div class="sbar">[\s\S]*?<\/div>)/,"$1"+statusRow())};

/* ---------- actions ---------- */
const CC=()=>C(cur().id);
Object.assign(act,{
  newchat:()=>{S.sheet={type:"newchat"};render()},
  cknumgo:()=>{const v=(document.getElementById("cknum")||{}).value||"";const r=chatWithNumber(v);if(r.error){S.sheet.err=r.error;S.sheet.num=v;render();return}S.sheet=null;openChat(r.id)},
  ckmsgnum:e=>{const r=chatWithNumber(e.dataset.n);if(r.id)openChat(r.id)},
  cksavenum:e=>{const r=chatWithNumber(e.dataset.n);if(r.id&&isBiz()){saveContact(r.id,e.dataset.nm);toast("Saved "+e.dataset.nm)}},
  cksave:()=>{S.sheet={type:"cksave"};render()},
  cksavego:()=>{const v=(document.getElementById("ckname")||{}).value;if(!saveContact(cur().id,v)){S.sheet.err="Type a name to save this contact.";render();return}S.sheet=null;toast("Contact saved");render()},
  ckattach:()=>{S.sheet={type:"ckattach"};render()},
  ckemojis:()=>{S.emoji=S.emoji===cur().id?null:cur().id;render()},
  ckemoji:e=>{const id=cur().id;S.drafts[id]=(S.drafts[id]||"")+e.dataset.e;render();const el=document.getElementById("composer");el&&el.focus()},
  ckphoto:()=>postMine(cur().id,{type:"image",color:["#6FA3D6","#C06C84","#7FCB8A","#C9B48F"][Math.floor(Math.random()*4)],caption:isBiz()?"New stock, just unpacked":"Photo of the item"}),
  ckdoc:()=>postMine(cur().id,{type:"file",name:isBiz()?"Shree Textiles price list, Nov.pdf":"Delivery address proof.pdf",meta:"PDF · 2 pages · 340 KB"}),
  ckloc:()=>postMine(cur().id,{type:"location",place:isBiz()?"Shree Textiles":"Meera's home",addr:isBiz()?"42 Town Hall Road, Coimbatore 641001":"14 Marine Drive, Kochi 682031"}),
  ckcontact:()=>{S.sheet={type:"ckcontact"};render()},
  ckcontactsend:e=>{const x=C(e.dataset.id);postMine(cur().id,{type:"contact",name:x.name,phone:x.phone?fmtPhone(x.phone):"+91 98•••• "+(1000+x.name.length*37)%9000})},
  ckvoice:()=>postMine(cur().id,{type:"voice",len:4+Math.floor(Math.random()*20)}),
  ckplay:()=>toast("Playing voice message (simulated)"),
  ckopen:()=>toast("Opening document (simulated)"),
  ckpollnew:()=>{S.sheet={type:"ckpoll"};render()},
  ckpollsend:()=>{const g=id=>((document.getElementById(id)||{}).value||"").trim();const q=g("pq"),o=[g("po0"),g("po1"),g("po2")].filter(Boolean);
    if(!q||o.length<2){S.sheet.err="Add a question and at least two options.";S.sheet.q=q;render();return}postMine(cur().id,{type:"poll",poll:{q,opts:o.map(t=>({t,v:0})),mine:null}})},
  ckvote:e=>{const c=CC(),m=c.msgs[+e.dataset.i],p=m.poll,o=+e.dataset.o;if(p.mine!=null)p.opts[p.mine].v--;if(p.mine===o)p.mine=null;else{p.mine=o;p.opts[o].v++}render()},
  ckprod:()=>{S.sheet={type:"ckprod"};render()},
  ckprodsend:e=>postMine(cur().id,{type:"product",pid:e.dataset.id}),
  ckmsg:e=>{S.sheet={type:"ckmsg",i:+e.dataset.i};render()},
  ckreact:e=>{const m=CC().msgs[S.sheet.i];m.react=m.react===e.dataset.e?null:e.dataset.e;S.sheet=null;render()},
  ckreply:()=>{S.replyTo=S.replyTo||{};S.replyTo[cur().id]=S.sheet.i;S.sheet=null;render();const el=document.getElementById("composer");el&&el.focus()},
  ckcopy:()=>{const m=CC().msgs[S.sheet.i];try{navigator.clipboard.writeText(m.text)}catch(e){}S.sheet=null;toast("Copied")},
  ckfwd:()=>{S.sheet={type:"ckfwd",i:S.sheet.i};render()},
  ckfwdto:e=>{const m=CC().msgs[S.sheet.i],copy={...m};delete copy.reply;delete copy.react;delete copy.star;delete copy.edited;copy.fwd=true;delete copy.by;delete copy.time;delete copy.id;delete copy.ts;
    S.sheet=null;post(e.dataset.id,side(),copy);toast("Forwarded to "+chatTitle(C(e.dataset.id)));render()},
  ckstar:()=>{const m=CC().msgs[S.sheet.i];m.star=!m.star;S.sheet=null;render()},
  ckedit:()=>{const c=CC(),i=S.sheet.i;S.editing={cid:c.id,i};S.drafts[c.id]=c.msgs[i].text;S.sheet=null;render()},
  ckcancel:()=>{S.editing=null;if(S.replyTo)S.replyTo[cur().id]=null;S.drafts[cur().id]="";render()},
  ckinfo:()=>{S.sheet={type:"ckinfo",i:S.sheet.i};render()},
  ckdelme:()=>{CC().msgs.splice(S.sheet.i,1);S.sheet=null;toast("Deleted for you");render()},
  ckdelall:()=>{const m=CC().msgs[S.sheet.i];Object.assign(m,{type:"text",text:"This message was deleted",deleted:true,react:null,star:false,reply:null});delete m.ref;S.sheet=null;render()},
  ckjump:e=>{const el=document.querySelectorAll("#chatbody .chat > .sys, #chatbody .chat > .m")[+e.dataset.i];if(el){el.scrollIntoView({block:"center"});el.classList.add("ck-flash");setTimeout(()=>el.classList.remove("ck-flash"),1200)}},
  ckmenu:()=>{S.sheet={type:"ckmenu"};render()},
  cksearch:()=>{S.csearch=S.csearch||{};S.csearch[cur().id]="";S.sheet=null;render();const el=document.getElementById("csq");el&&el.focus()},
  cksearchx:()=>{delete S.csearch[cur().id];render()},
  ckmedia:()=>{S.sheet=null;go("ckmedia",{id:cur().id})},
  ckstarred:()=>{S.sheet=null;go("ckstarred",{id:cur().id})},
  ckmute:()=>{const c=CC();c.muted=!c.muted;S.sheet=null;toast(c.muted?"Notifications muted":"Notifications on");render()},
  ckdisappear:()=>{S.sheet={type:"ckdis"};render()},
  ckdisset:e=>{const c=CC(),v=e.dataset.v;c.disappear=v==="Off"?null:v;post(c.id,"sys",{type:"sys",text:v==="Off"?"You turned off disappearing messages":`New messages will disappear after ${v}. Business documents are kept.`});S.sheet=null;render()},
  ckpin:()=>{const c=CC();if(!c.pinned&&S.chats.filter(x=>x.pinned&&visibleChat(x)).length>=3){S.sheet=null;toast("You can pin up to 3 chats");return}c.pinned=!c.pinned;S.sheet=null;toast(c.pinned?"Chat pinned":"Chat unpinned");render()},
  ckarchive:()=>{const c=CC();c.archived=!c.archived;S.sheet=null;if(c.archived){S.stack=[{name:"tab"}];S.tab="chats";toast("Chat archived")}render()},
  ckunread:()=>{const c=CC();if(isBiz())c.unread=Math.max(1,c.unread);else c.unreadC=Math.max(1,c.unreadC);S.sheet=null;S.stack=[{name:"tab"}];S.tab="chats";render()},
  ckexport:()=>{S.sheet=null;toast("Chat exported as a text file (simulated)")},
  ckclear:()=>{const c=CC();c.msgs=c.msgs.filter(m=>m.type==="doc"||m.type==="payment");post(c.id,"sys",{type:"sys",text:"Messages cleared. Business documents and payments are kept."});S.sheet=null;render()},
  ckblock:()=>{const c=CC();c.blocked=true;S.sheet=null;toast(chatTitle(c)+" blocked");render()},
  ckunblock:()=>{const c=CC();c.blocked=false;S.sheet=null;toast("Unblocked");render()},
  ckreport:()=>{S.sheet={type:"ckreport"};render()},
  ckreportgo:()=>{const c=CC(),blk=(document.getElementById("ckrb")||{}).checked;BOCStore.patch("admin",a=>{a=a||structuredClone(SEED.admin);a.tickets.unshift({id:"TK-"+(2000+Math.floor(Math.random()*900)),from:isBiz()?BIZ.st.name:"Meera Nair",about:c.id,biz:c.biz||"st",subject:"Reported chat: "+chatTitle(c),cat:"Report",status:"open",access:true,at:now(),notes:[]});return a});
    if(blk)c.blocked=true;S.sheet=null;toast("Reported to BOC"+(blk?" and blocked":""));render()},
  ckcall:e=>{const v=e.dataset.v;S.sheet={type:"ckcall",v,state:"ring"};render();clearInterval(act._ct);setTimeout(()=>{if(S.sheet&&S.sheet.type==="ckcall"){S.sheet.state="on";S.sheet.sec=0;render();act._ct=setInterval(()=>{if(!S.sheet||S.sheet.type!=="ckcall"){clearInterval(act._ct);return}S.sheet.sec++;render()},1000)}},1600)},
  ckend:()=>{const s=S.sheet,c=CC();clearInterval(act._ct);S.sheet=null;post(c.id,"sys",{type:"sys",text:s.state==="on"?`${s.v==="video"?"Video":"Voice"} call · 0:${String(s.sec||0).padStart(2,"0")}`:`Missed ${s.v} call`});render()},
  ckmutecall:()=>toast("Microphone muted"),ckspk:()=>toast("Speaker on"),
  ckgroupnew:()=>{S.sheet={type:"ckgroup",pick:[]};render()},
  ckgpick:e=>{const n=(document.getElementById("gname")||{}).value;S.sheet.name=n;const p=S.sheet.pick,id=e.dataset.id,k=p.indexOf(id);if(k<0)p.push(id);else p.splice(k,1);render()},
  ckgcreate:()=>{const n=((document.getElementById("gname")||{}).value||"").trim(),p=S.sheet.pick;if(!n||!p.length){S.sheet.err="Give the group a name and pick at least one member.";S.sheet.name=n;render();return}
    const id="g"+(++SEQ);chat({id,name:n,kind:"group",members:p.map(x=>C(x).name),labels:["Group"],color:"#111214",acct:"Group · "+(p.length+1)+" members",msgs:[],ts:Date.now()});post(id,"sys",{type:"sys",text:`You created "${n}" and added ${p.map(x=>C(x).name).join(", ")}`});S.sheet=null;openChat(id)},
  ckginfo:()=>{S.sheet=null;go("ckginfo",{id:cur().id})},
  ckexit:()=>{const c=CC();post(c.id,"sys",{type:"sys",text:"You left the group"});c.blocked=true;S.sheet=null;render()},
  ckstnew:()=>{S.sheet={type:"ckstatusnew"};render()},
  ckstpost:e=>{const p=P(e.dataset.id);let s=S.statuses.find(x=>x.biz==="st");if(!s){s={biz:"st",ts:Date.now(),items:[],views:0};S.statuses.unshift(s)}s.items.push({pid:p.id,text:p.desc});s.ts=Date.now();S.sheet=null;toast("Status posted for 24 hours");render()},
  ckstopen:e=>{const b=e.dataset.b;if(!S.seenStatus.includes(b))S.seenStatus.push(b);S.sheet={type:"ckstatus",biz:b,i:0};render()},
  ckstnav:e=>{const s=S.statuses.find(x=>x.biz===S.sheet.biz),i=S.sheet.i+ +e.dataset.d;if(i<0)return;if(i>=s.items.length){const k=S.statuses.indexOf(s)+1;const nx=S.statuses[k];if(nx&&!(isBiz()&&nx.biz==="st")){S.sheet={type:"ckstatus",biz:nx.biz,i:0};if(!S.seenStatus.includes(nx.biz))S.seenStatus.push(nx.biz)}else S.sheet=null}else S.sheet.i=i;render()},
  ckstbuy:()=>{const sh=S.sheet,s=S.statuses.find(x=>x.biz===sh.biz),it=s.items[sh.i];
    if(it.pid){if(isSuspended(s.biz)){toast("This business is suspended by BOC");return}S.sheet=null;setView("customer");openChat("c1");S.sheet={type:"order",pid:it.pid,qty:1,v:P(it.pid).vars[0],ship:"std",pay:"upi"};render();return}
    if(it.svc){S.sheet=null;setView("customer");openChat("y1");S.sheet={type:"booking",chat:"y1",svc:it.svc,slot:"Sat 11:00 am"};render();return}
    const r=chatWithBiz(s.biz);S.sheet=null;openChat(r);post(r,"cp",`I'd like to order ${it.name}, ${money(it.price)}.`);sim(r,1400,()=>post(r,"biz","Sure! Sending you a payment request now."));render()},
  ckstreply:()=>{const sh=S.sheet,v=((document.getElementById("ckstr")||{}).value||"").trim();if(!v)return;const s=S.statuses.find(x=>x.biz===sh.biz),it=s.items[sh.i],b=BIZ[s.biz];
    const cid=chatWithBiz(s.biz);S.sheet=null;post(cid,"cp",{type:"statusreply",owner:b.name,stext:it.text,color:(it.pid&&P(it.pid).color)||it.color||b.color,text:v});openChat(cid)},
  noop:()=>{}
});
function chatWithBiz(k){let c=S.chats.find(x=>x.custOnly&&x.biz===k)||(k==="st"?C("c1"):null);if(!c){chat({id:"z"+k,name:"Meera Nair",kind:"customer",biz:k,cp:"me",custOnly:true,color:PARTY[5],msgs:[],ts:Date.now()});c=C("z"+k)}return c.id}
document.addEventListener("input",e=>{if(e.target.id==="csq"){S.csearch[cur().id]=e.target.value;render()}});

/* ---------- screens: media, starred, group info, chat link, how-tos ---------- */
screens.ckmedia=v=>{const c=C(v.id),ms=c.msgs.filter(m=>["image","file","location","voice"].includes(m.type)||m.type==="doc"),links=c.msgs.filter(m=>/https?:|boc\.in/.test(m.text||""));
  return PG.page({title:"Media and docs",sub:esc(chatTitle(c)),body:PG.group("Photos and files",ms.map(m=>PG.item({lead:PG.ico(m.type==="image"?"image":m.type==="voice"?"mic":m.type==="location"?"pin":"file"),t:esc(m.type==="doc"?code(m.ref)+" · "+(KIND[(D(m.ref)||{}).kind]||""):m.name||m.caption||m.place||"Voice message"),s:esc(m.time||"")})).join(""))+PG.group("Links",links.map(m=>PG.item({lead:PG.ico("link"),t:esc(m.text)})).join(""))+(ms.length||links.length?"":`<div class="pg-empty"><b>Nothing shared yet</b><span>Photos, documents and links in this chat show up here.</span></div>`)})};
screens.ckstarred=v=>{const c=C(v.id),ms=c.msgs.map((m,i)=>({m,i})).filter(x=>x.m.star);
  return PG.page({title:"Starred",sub:esc(chatTitle(c)),body:ms.length?PG.group("Starred messages",ms.map(({m})=>PG.item({lead:PG.ico("star"),t:esc(m.text||m.caption||m.name||KIND[(D(m.ref)||{}).kind]||"Message"),s:esc((m.by===side()?"You":chatTitle(c))+" · "+m.time)})).join("")):`<div class="pg-empty"><b>No starred messages</b><span>Open a message's options and tap Star to keep it here.</span></div>`})};
screens.ckginfo=v=>{const c=C(v.id);return PG.page({title:esc(c.name),sub:`Group · ${c.members.length+1} members`,
  body:PG.group("Members",[PG.item({lead:av("Shree Textiles",BIZ.st.color,40),t:"You",vl:"Admin",tone:"good"}),...c.members.map(n=>{const x=S.chats.find(y=>y.name===n);return PG.item({lead:av(n,x?x.color:"#566366",40),t:esc(n),act:x?"open":"",id:x?x.id:""})})].join(""))+
    PG.group("Invite",PG.item({lead:PG.ico("link"),t:"boc.in/g/"+c.id,s:"Anyone with the link can ask to join. You approve each request."})),
  cta:`<button class="pg-btn" data-act="ckgadd" data-id="${c.id}">Add members${ic("chevr","s")}</button>`})};
act.ckgadd=e=>{const c=C(e.dataset.id);S.sheet={type:"ckgroup",pick:S.chats.filter(x=>c.members.includes(x.name)).map(x=>x.id),name:c.name,edit:c.id};render()};
const qr=seed=>{let s=seed,cells="";const r=()=>(s=(s*1103515245+12345)%2147483648)/2147483648;for(let y=0;y<25;y++)for(let x=0;x<25;x++){const f=(x<7&&y<7)||(x>17&&y<7)||(x<7&&y>17);const on=f?((x%6===0||y%6===0||(x>1&&x<5&&y>1&&y<5))||((x>18&&x<24)&&(y===0||y===6))||((y>18)&&(x===0||x===6))):r()>.52;
  if(f){const fx=x>17?x-18:x,fy=y>17?y-18:y;if(!(fx===0||fx===6||fy===0||fy===6||(fx>1&&fx<5&&fy>1&&fy<5)))continue}else if(!on)continue;cells+=`<rect x="${x}" y="${y}" width="1" height="1"/>`}return `<svg viewBox="-2 -2 29 29" class="ck-qr" aria-label="Example QR code">${cells}</svg>`};
screens.chatlink=()=>PG.page({title:"Chat link and QR",sub:"Anyone can message you without saving your number",
  hero:`<div class="pg-hero">${qr(42)}<div class="v" style="font-size:20px;margin-top:10px">boc.in/shreetextiles</div><div class="n">Print it at the counter, on bills and on your shop board. Example QR.</div></div>`,
  body:PG.group("Ways to share",[PG.item({lead:PG.ico("link"),t:"Copy chat link",act:"ckcopylink"}),PG.item({lead:PG.ico("chat"),t:"Link with a message ready",s:"boc.in/shreetextiles?text=I want to order",act:"ckcopylink"}),PG.item({lead:PG.ico("compass"),t:"See your public page",act:"frame",data:'data-v="web"'})].join(""))});
act.ckcopylink=()=>{try{navigator.clipboard.writeText("https://boc.in/shreetextiles")}catch(e){}toast("Link copied")};

const HOW_BIZ=[
 ["Chat with a number you haven't saved",["Tap the new-chat button on Chats.","Type the 10-digit mobile number. You don't need to save it.","Tap Chat. Save it later from the banner in the chat if you want."],()=>{S.stack=[{name:"tab"}];S.tab="chats";S.sheet={type:"newchat"};render()}],
 ["Send a quote, invoice or order",["Open the chat.","Tap the paperclip, then Quote, invoice, order.","Pick items and terms, then Send. The buyer accepts or pays inside the chat."],()=>GUIDE[7].run()],
 ["Take payments through your own gateway",["Share an invoice or payment request.","The buyer pays by UPI or card through the gateway you connected.","The money goes straight to your bank. BOC never holds it or takes a cut."],()=>GUIDE[5].run()],
 ["Ship an order",["Open the order card and tap Ship it.","Choose courier, transporter, your own staff or pickup.","Tracking updates appear in the chat on their own."],()=>GUIDE[5].run()],
 ["Label contacts and use the CRM",["Open a chat, tap the menu, then Labels.","Pick or create labels like VIP or Pays late.","Open Contacts to see stages, dues and follow-ups."],()=>{setView("owner");go("customers")}],
 ["Post a status people can buy from",["On Chats, tap My status.","Pick a product.","Customers see it for 24 hours and tap Buy to order."],()=>{setView("owner");S.sheet={type:"ckstatusnew"};render()}],
 ["Create a group",["Tap the new-chat button, then New group.","Name it and pick members.","Share news, run polls and take orders together."],()=>{setView("owner");S.sheet={type:"ckgroup",pick:[]};render()}],
 ["Reply, react, forward, star or delete a message",["Tap the dots on any message.","Choose React, Reply, Forward, Star, Edit or Delete.","Delete for everyone works for an hour after sending."],()=>{setView("owner");openChat("c2")}],
 ["Block or report someone",["Open the chat and tap the menu.","Tap Block, or Report to send the last messages to BOC.","Blocked contacts can't message or call you."],()=>{setView("owner");openChat("u1")}],
 ["Ask the AI assistant",["Tap Ask anything at the bottom of Chats, Pending or Business.","Pick a question or type your own.","Answers come only from your own chats, invoices and stock."],()=>{setView("owner");S.sheet={type:"aiask",i:-1};render()}]];
const HOW_CP=[
 ["Message a business by number",["Tap the new-chat button.","Type their mobile number, saved or not.","Check the banner: verified businesses show a green badge."],()=>{setView("customer");S.sheet={type:"newchat"};render()}],
 ["Buy from a status",["Tap a business's circle at the top of Chats.","Tap Buy or Book on the product.","Pay by UPI or card, straight to the business."],()=>{setView("customer");S.sheet={type:"ckstatus",biz:"st",i:0};render()}],
 ["Check who you're dealing with",["Tap the business name at the top of the chat.","See GST, KYC, bank checks, orders and reviews.","Never pay outside BOC to an unverified seller."],()=>GUIDE[3].run()],
 ["Report a scam",["Open the chat and tap the menu.","Tap Report. The last messages go to BOC.","Tick Block to stop them messaging you."],()=>{setView("customer");openChat("x1")}]];
screens.help=()=>{const list=isBiz()?HOW_BIZ:HOW_CP;window.__how=list;
  return PG.page({title:"Help and how-tos",sub:"Short steps for everything in BOC",
    body:`<div class="ck-how">${list.map(([t,steps],i)=>`<details ${i===0?"open":""}><summary>${ic("help","s")}<span>${esc(t)}</span>${ic("chevr","s")}</summary><ol>${steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol><button class="pg-btn ghost" data-act="ckshow" data-i="${i}">Show me</button></details>`).join("")}</div>`})};
act.ckshow=e=>{const f=window.__how[+e.dataset.i][2];S.stack=[{name:"tab"}];f()};
const _more=moreView;
window.moreView=moreView=function(){const r=(go,icon,t,s)=>`<button class="row" data-act="go" data-s="${go}"><span class="mini" style="background:var(--tint-soft);color:var(--tint)">${ic(icon)}</span><div class="mid"><div class="t">${t}</div><div class="s">${s}</div></div>${ic("chevr")}</button>`;
  return _more().replace('<div class="body">','<div class="body">'+r("help","help","Help and how-tos","Step-by-step guides for every feature")+r("chatlink","qr","Chat link and QR","Let anyone message you without saving your number"))};
const _me=meView;
window.meView=meView=function(){return _me().replace('<section class="pg-g"><div class="pg-gh"><h2>Personal vs business',PG.group("Help",PG.item({lead:PG.ico("help"),t:"Help and how-tos",s:"Message by number, buy from status, report scams",act:"go",data:'data-s="help"'}))+'<section class="pg-g"><div class="pg-gh"><h2>Personal vs business')};

/* ---------- render hook ---------- */
const _render=render;
window.render=render=function(){_render();try{decorate()}catch(e){console.error(e)}};
render();
})();
