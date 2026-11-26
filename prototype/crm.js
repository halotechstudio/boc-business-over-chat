/* BOC: contact labels + CRM, and a cleaner Chats / Pending / contact layout.
   Labels live on each chat (c.labels, names) with colours in S.labels; CRM data lives in c.crm.
   Loaded after app-ext.js; replaces chatList, pendingView, screens.contact and screens.customers. */
(function(){
"use strict";
const DAY=864e5;
const LABEL_COLORS=["#2F6FB0","#1E7A47","#A86A12","#B3261E","#6B4FB3","#0F7C86","#7A2E5C","#566366"];
S.labels=S.labels||[
  {name:"New lead",color:"#2F6FB0"},{name:"Hot lead",color:"#B3261E"},{name:"Repeat customer",color:"#1E7A47"},
  {name:"VIP",color:"#6B4FB3"},{name:"Wholesale",color:"#0F7C86"},{name:"Net 30",color:"#566366"},{name:"Net 15",color:"#566366"},
  {name:"Pays late",color:"#A86A12"},{name:"Supplier",color:"#7A2E5C"},{name:"New customer",color:"#2F6FB0"},{name:"Paid",color:"#1E7A47"},{name:"Team",color:"#566366"},{name:"BOC",color:"#00262B"}];
window.STAGES_CRM=["Lead","Talking","Quoted","Won","Repeat","Lost"];
const seedCrm={c1:{stage:"Talking",next:Date.now(),notes:[{t:"Asked about maroon Kanjivaram for a wedding on 8 Dec.",at:"Today"}]},
  c2:{stage:"Repeat",next:Date.now()+2*DAY,notes:[{t:"Orders every month before the 5th. Prefers Net 30.",at:"Oct"}]},
  c7:{stage:"Won",notes:[]},c9:{stage:"Won",notes:[]},c10:{stage:"Repeat",next:Date.now()-DAY,notes:[{t:"Pongal stock every January. Chase INV 0139 first.",at:"2 Nov"}]}};
S.chats.forEach(c=>{if(!c.crm&&!c.custOnly&&["customer","b2b"].includes(c.kind))c.crm={stage:"Lead",notes:[],...(seedCrm[c.id]||{})}});
if(C("c10")&&!C("c10").labels.includes("Pays late"))C("c10").labels.push("Pays late");
if(C("c2")&&!C("c2").labels.includes("VIP"))C("c2").labels.push("VIP");
if(C("c1")&&!C("c1").labels.includes("Hot lead"))C("c1").labels.push("Hot lead");

const labelColor=n=>(S.labels.find(l=>l.name===n)||{}).color||"#566366";
const pill=(n,act)=>`<span class="lp" style="--lc:${labelColor(n)}">${esc(n)}</span>`;
window.labelPills=(c,max=3)=>{const l=(c.labels||[]).filter(n=>n!=="Team");return l.slice(0,max).map(n=>pill(n)).join("")+(l.length>max?`<span class="lp more">+${l.length-max}</span>`:"")};

/* ---------- CRM numbers from the chat's documents ---------- */
window.crmOf=function(c){const docs=Object.values(S.docs).filter(d=>d.chat===c.id);
  const paid=docs.filter(d=>(d.kind==="invoice"&&d.status==="paid")||(d.kind==="order"&&["completed","delivered"].includes(d.status))||(d.kind==="paylink"&&d.status==="paid"));
  const ltv=paid.reduce((a,d)=>a+(d.kind==="paylink"?d.amount:docTotal(d)),0);
  const dues=docs.filter(d=>d.kind==="invoice"&&d.status!=="paid").reduce((a,d)=>a+balance(d),0);
  const orders=docs.filter(d=>["order","invoice"].includes(d.kind)).length;
  const late=docs.filter(d=>d.kind==="invoice"&&d.status!=="paid"&&d.dueTs&&d.dueTs<Date.now()).length;
  return{ltv,dues,orders,late,last:(c.msgs[c.msgs.length-1]||{}).time||""}};
const followDue=c=>c.crm&&c.crm.next&&c.crm.next<=Date.now()+DAY/2;
const relDay=ts=>{const d=Math.round((ts-Date.now())/DAY);return d<-1?`${-d} days ago`:d===-1?"Yesterday":d===0?"Today":d===1?"Tomorrow":`In ${d} days`};

/* ---------- Chats ---------- */
const FILTERS_BIZ=["All","Unread","Follow up","Customers","Wholesale","Suppliers","Team"];
function matchFilter(c,f){const u=isBiz()?c.unread:c.unreadC;
  switch(f){case "All":return true;case "Unread":return!!u;case "Follow up":return followDue(c);case "Customers":return c.kind==="customer";case "Wholesale":return c.kind==="b2b";case "Suppliers":return c.kind==="supplier";case "Team":return c.kind==="team";
    default:return(c.labels||[]).includes(f)}}
function needsYou(){const p=pending(),items=[];
  p.sign.forEach(d=>items.push({id:d.id,t:"Sign the contract",who:party(d.chat),icon:"pen"}));
  if(role()==="owner")p.approvals.forEach(d=>items.push({id:d.id,t:"Approve "+KIND[d.kind].toLowerCase(),who:party(d.chat),icon:"check"}));
  p.orders.forEach(d=>items.push({id:d.id,t:d.status==="placed"?"Accept the order":"Ship the order",who:party(d.chat),amt:docTotal(d),icon:"truck"}));
  p.collect.forEach(d=>items.push({id:d.id,t:d.dueTs&&d.dueTs<Date.now()?"Payment overdue":"Collect payment",who:party(d.chat),amt:balance(d),icon:"wallet",bad:d.dueTs&&d.dueTs<Date.now()}));
  p.pay.forEach(d=>items.push({id:d.id,t:"Pay the supplier",who:party(d.chat),amt:d.amount,icon:"bank"}));
  p.compare.forEach(d=>items.push({id:d.id,t:"Compare quotes",who:"Suppliers",icon:"swap"}));
  p.inbound.forEach(d=>items.push({id:d.id,t:"Mark goods received",who:party(d.chat),icon:"box"}));
  p.human.forEach(c=>items.push({cid:c.id,t:"Reply in person",who:c.name,icon:"user"}));
  S.chats.filter(c=>!c.custOnly&&followDue(c)).forEach(c=>items.push({cid:c.id,t:"Follow up",who:c.name,icon:"clock"}));
  return items}
window.needsYou=needsYou;
const _chatList=chatList;
window.chatList=chatList=function(){
  const q=(S.q||"").toLowerCase(),f=S.filter||"All";
  const list=S.chats.filter(visibleChat).filter(c=>matchFilter(c,f)).filter(c=>!q||[chatTitle(c),(c.labels||[]).join(" "),(c.msgs[c.msgs.length-1]||{}).text||""].join(" ").toLowerCase().includes(q))
    .sort((a,b)=>(b.ts||0)-(a.ts||0));
  const usedLabels=[...new Set(S.chats.filter(c=>!c.custOnly).flatMap(c=>c.labels||[]))].filter(n=>!["Team","BOC","Paid"].includes(n));
  const filters=isBiz()?[...FILTERS_BIZ,...usedLabels.filter(n=>!FILTERS_BIZ.includes(n))]:["All","Unread"];
  const ny=isBiz()?needsYou():[];
  const needs=ny.length?`<section class="needs" aria-label="Waiting on you"><div class="needs-h"><h2>Waiting on you <span class="num">${ny.length}</span></h2><button class="linkbtn" data-act="tab" data-t="pending">See all</button></div>
    ${ny.slice(0,3).map(x=>`<button class="needs-i" ${x.id?`data-act="dopen" data-id="${x.id}"`:`data-act="open" data-id="${x.cid}"`}><span class="ni ${x.bad?"bad":""}">${ic(x.icon,"s")}</span><span class="nt"><b>${esc(x.t)}</b><small>${esc(x.who)}${x.id?" · "+code(x.id):""}</small></span>${x.amt?`<span class="num na">${money(x.amt)}</span>`:""}${ic("chevr","s")}</button>`).join("")}</section>`:"";
  const rows=list.map(c=>{const last=[...c.msgs].reverse().find(m=>m.by!=="sys")||c.msgs[c.msgs.length-1]||{};const u=isBiz()?c.unread:c.unreadC;
    const prev=last.type==="text"?last.text:last.type==="doc"?(KIND[(D(last.ref)||{}).kind]||"Document")+" "+code(last.ref||""):last.type==="payment"?"Payment "+money(last.amount):last.text||"";
    const b=!isBiz()&&BIZ[c.biz];
    return `<button class="crow ${u?"unread":""}" data-act="open" data-id="${c.id}">${av(chatTitle(c),chatColor(c),46)}<span class="cm"><span class="cn"><b>${esc(chatTitle(c))}</b>${b&&verified(b)?vbadge(b):""}<time>${esc(last.time||"")}</time></span><span class="cp">${last.by===side()?"You: ":""}${esc(prev)}</span>${isBiz()&&(c.labels||[]).length?`<span class="cl">${labelPills(c)}</span>`:""}</span>${u?`<span class="cu num" aria-label="${u} unread">${u}</span>`:followDue(c)&&isBiz()?`<span class="cf" title="Follow up due">${ic("clock","s")}</span>`:""}</button>`}).join("");
  return status()+big("Chats",isBiz()?`<button class="ib" data-act="go" data-s="customers" aria-label="Contacts and CRM">${ic("users")}</button>`:"")+`<div class="body">
    <div class="sbar">${ic("search","s")}<input id="q" type="search" placeholder="Search names, labels, messages" value="${esc(S.q||"")}" aria-label="Search chats"></div>
    ${f==="All"&&!q?needs:""}
    <div class="frow" role="tablist">${filters.map(x=>`<button class="fc ${f===x?"on":""}" data-act="filt" data-v="${esc(x)}" role="tab" aria-selected="${f===x}">${S.labels.some(l=>l.name===x)?`<i class="ld" style="background:${labelColor(x)}"></i>`:""}${esc(x)}</button>`).join("")}</div>
    <div class="clist">${rows||`<div class="empty-s"><b>No chats here</b><span>${f==="Follow up"?"No follow-ups due. Set one from a contact's profile.":"Try another filter or search."}</span></div>`}</div>
    <div style="height:84px"></div></div>${isBiz()?`<button class="fab" data-act="newchat" aria-label="New chat">${ic("plus")}</button>`:""}`+nav()};
act.filt=e=>{S.filter=e.dataset.v;render()};
if(!act.newchat)act.newchat=()=>{S.sheet={type:"newchat"};render()};

/* ---------- Pending: only groups that have something ---------- */
window.pendingView=pendingView=function(){const ny=needsYou(),p=pending();
  const collect=p.collect.reduce((a,d)=>a+balance(d),0),pay=p.pay.reduce((a,d)=>a+d.amount,0);
  const groups={};ny.forEach(x=>(groups[x.t]=groups[x.t]||[]).push(x));
  const low=p.low;
  return status()+big("Pending")+`<div class="body">
  <div class="stat2" style="margin:4px 16px 0"><div><div class="l">To collect</div><div class="v num">${money(collect)}</div></div><div><div class="l">To pay</div><div class="v num">${money(pay)}</div></div></div>
  ${ny.length?Object.entries(groups).map(([t,xs])=>`<div class="secttl"><h3>${esc(t)}</h3><span class="num">${xs.length}</span></div><div class="glist">${xs.map(x=>`<button class="needs-i" ${x.id?`data-act="dopen" data-id="${x.id}"`:`data-act="open" data-id="${x.cid}"`}><span class="ni ${x.bad?"bad":""}">${ic(x.icon,"s")}</span><span class="nt"><b>${esc(x.who)}</b><small>${x.id?code(x.id):"Open chat"}${x.bad?" · overdue":""}</small></span>${x.amt?`<span class="num na">${money(x.amt)}</span>`:""}${ic("chevr","s")}</button>`).join("")}</div>`).join(""):`<div class="empty-s" style="margin:24px 16px"><b>Nothing is waiting on you</b><span>New orders, payments and signatures show up here.</span></div>`}
  ${low.length?`<div class="secttl"><h3>Running low</h3><span class="num">${low.length}</span></div><div class="glist">${low.map(x=>`<div class="needs-i"><span class="ni">${ic("box","s")}</span><span class="nt"><b>${esc(x.name)}</b><small>${x.stock} left · reorder at ${x.reorder}</small></span><button class="btn sm ghost" data-act="reorder" data-id="${x.id}">Restock</button></div>`).join("")}</div>`:""}
  <div style="height:20px"></div></div>`+nav()};

/* ---------- contact profile = CRM record ---------- */
screens.contact=function(v){const c=C(v.id);if(!c)return status()+hdr("Contact")+`<div class="body"></div>`;
  const k=crmOf(c),cr=c.crm||{stage:"Lead",notes:[]};c.crm=cr;const b=S.buyers&&S.buyers[c.id];
  return status()+hdr("Contact",{actions:`<button class="ib" data-act="open" data-id="${c.id}" aria-label="Open chat">${ic("chat")}</button>`})+`<div class="body">
  <div class="phead">${av(c.name,c.color,64)}<div><h2>${esc(c.name)}</h2><p>${esc(c.acct||"")}</p></div></div>
  <div class="qa"><button data-act="open" data-id="${c.id}">${ic("chat","s")}Message</button><button data-act="cquote" data-id="${c.id}">${ic("file","s")}Send quote</button><button data-act="ccall" data-id="${c.id}">${ic("phone","s")}Call</button></div>
  <div class="secttl"><h3>Stage</h3><span>${esc(cr.stage)}</span></div>
  <div class="stages" role="radiogroup" aria-label="Sales stage">${STAGES_CRM.map(s=>`<button role="radio" aria-checked="${cr.stage===s}" class="${cr.stage===s?"on":""} ${s==="Lost"?"lost":""}" data-act="cstage" data-id="${c.id}" data-v="${s}">${s}</button>`).join("")}</div>
  <div class="secttl"><h3>Labels</h3><button class="linkbtn" data-act="clabels" data-id="${c.id}">Edit</button></div>
  <div class="lwrap">${(c.labels||[]).map(n=>pill(n)).join("")||`<span class="muted">No labels yet</span>`}</div>
  <div class="stat2" style="margin-top:16px"><div><div class="l">Bought so far</div><div class="v num">${money(k.ltv)}</div></div><div><div class="l">Owes you</div><div class="v num" style="${k.late?"color:var(--bad)":""}">${money(k.dues)}</div></div></div>
  <div class="stat2" style="margin-top:-1px"><div><div class="l">Orders and invoices</div><div class="v num">${k.orders}</div></div><div><div class="l">${b?"Credit terms":"Last message"}</div><div class="v" style="font-size:18px">${b?esc(b.terms)+` <small class="num">${money(b.used)} of ${money(b.limit)}</small>`:esc(k.last||"—")}</div></div></div>
  <div class="secttl"><h3>Follow-up</h3><span>${cr.next?relDay(cr.next):"None set"}</span></div>
  <div class="wchips" style="padding:0 16px">${[["Today",0],["Tomorrow",1],["Next week",7],["Clear",-1]].map(([l,d])=>`<button class="fc" data-act="cnext" data-id="${c.id}" data-d="${d}">${l}</button>`).join("")}</div>
  <div class="secttl"><h3>Notes</h3><span>Only your team sees these</span></div>
  <div class="notes">${cr.notes.map(n=>`<div class="nt1"><p>${esc(n.t)}</p><small>${esc(n.at)}</small></div>`).join("")}
    <div class="nadd"><input id="cnote" placeholder="Add a note, e.g. prefers delivery after 5 pm" aria-label="New note"><button class="btn sm" data-act="cnote" data-id="${c.id}">Add</button></div></div>
  <div class="secttl"><h3>Documents</h3><span class="num">${Object.values(S.docs).filter(d=>d.chat===c.id).length}</span></div>
  <div class="glist" style="margin-bottom:24px">${Object.values(S.docs).filter(d=>d.chat===c.id).slice(-6).reverse().map(d=>{const[t,l]=docState(d);return `<button class="needs-i" data-act="dopen" data-id="${d.id}"><span class="nt"><b>${code(d.id)} · ${esc(KIND[d.kind]||d.kind)}</b><small class="st-${t}">${esc(l)}</small></span><span class="num na">${money(d.kind==="paylink"||d.kind==="bill"?d.amount:docTotal(d)||0)}</span></button>`}).join("")||`<div class="empty-s"><span>No documents yet</span></div>`}</div>
  </div>`};

/* ---------- Contacts and CRM board ---------- */
screens.customers=function(){const st=S.crmStage||"All",lab=S.crmLabel||"";
  const people=S.chats.filter(c=>c.crm&&!c.custOnly);
  const list=people.filter(c=>(st==="All"||c.crm.stage===st)&&(!lab||(c.labels||[]).includes(lab)));
  const counts=Object.fromEntries(STAGES_CRM.map(s=>[s,people.filter(c=>c.crm.stage===s).length]));
  const pipe=people.filter(c=>["Talking","Quoted"].includes(c.crm.stage)).length;
  return status()+hdr("Contacts",{sub:`${people.length} contacts · ${pipe} in talks`,actions:`<button class="ib" data-act="labelsheet" aria-label="Manage labels">${ic("tag")}</button>`})+`<div class="body">
  <div class="stagebar">${["All",...STAGES_CRM].map(s=>`<button class="${st===s?"on":""}" data-act="crmstage" data-v="${s}"><span>${s}</span><b class="num">${s==="All"?people.length:counts[s]}</b></button>`).join("")}</div>
  <div class="frow"><button class="fc ${!lab?"on":""}" data-act="crmlabel" data-v="">Any label</button>${S.labels.filter(l=>people.some(c=>(c.labels||[]).includes(l.name))).map(l=>`<button class="fc ${lab===l.name?"on":""}" data-act="crmlabel" data-v="${esc(l.name)}"><i class="ld" style="background:${l.color}"></i>${esc(l.name)}</button>`).join("")}</div>
  <div class="clist">${list.map(c=>{const k=crmOf(c);return `<button class="crow" data-act="go" data-s="contact" data-id="${c.id}">${av(c.name,c.color,46)}<span class="cm"><span class="cn"><b>${esc(c.name)}</b><time class="num">${money(k.ltv)}</time></span><span class="cp">${esc(c.crm.stage)}${k.dues?` · owes <span class="num" style="${k.late?"color:var(--bad)":""}">${money(k.dues)}</span>`:""}${c.crm.next?" · follow up "+relDay(c.crm.next).toLowerCase():""}</span>${(c.labels||[]).length?`<span class="cl">${labelPills(c)}</span>`:""}</span></button>`}).join("")||`<div class="empty-s"><b>No contacts match</b><span>Change the stage or label filter.</span></div>`}</div>
  <div class="sec"><button class="btn ghost" data-act="go" data-s="broadcast" style="width:100%">Send a broadcast to a label</button></div></div>`};

/* ---------- sheets: label picker and label manager ---------- */
const _rs=renderSheet;
window.renderSheet=renderSheet=function(){const sh=S.sheet;
  if(sh.type==="clabels"){const c=C(sh.chat);return sheetWrap("Labels for "+esc(c.name),`<div class="lpick">${S.labels.filter(l=>!["BOC","Team"].includes(l.name)).map(l=>{const on=(c.labels||[]).includes(l.name);return `<button class="${on?"on":""}" data-act="ltoggle" data-v="${esc(l.name)}" role="checkbox" aria-checked="${on}"><i class="ld" style="background:${l.color}"></i>${esc(l.name)}${on?ic("check","s"):""}</button>`}).join("")}</div>
    <div class="nadd" style="margin-top:12px"><input id="newlabel" placeholder="New label, e.g. Diwali buyer" aria-label="New label name"><button class="btn sm" data-act="laddnew">Create</button></div>`,`<button class="btn" data-act="closesheet">Done</button>`)}
  if(sh.type==="labelsheet"){return sheetWrap("Your labels",`<p class="muted" style="margin:0 0 10px">Labels group contacts for filters, follow-ups and broadcasts. Tap a colour to change it.</p>${S.labels.filter(l=>!["BOC","Team"].includes(l.name)).map(l=>{const n=S.chats.filter(c=>(c.labels||[]).includes(l.name)).length;return `<div class="lrow"><span class="lp" style="--lc:${l.color}">${esc(l.name)}</span><span class="muted num">${n}</span><span class="swatches">${LABEL_COLORS.map(col=>`<button aria-label="Colour" data-act="lcolor" data-n="${esc(l.name)}" data-v="${col}" style="background:${col}" class="${l.color===col?"on":""}"></button>`).join("")}</span><button class="ib" data-act="ldel" data-n="${esc(l.name)}" aria-label="Delete ${esc(l.name)}">${ic("close","s")}</button></div>`}).join("")}
    <div class="nadd" style="margin-top:12px"><input id="newlabel" placeholder="New label" aria-label="New label name"><button class="btn sm" data-act="laddnew">Create</button></div>`,`<button class="btn" data-act="closesheet">Done</button>`)}
  return _rs()};

Object.assign(act,{
  cstage:e=>{const c=C(e.dataset.id);c.crm.stage=e.dataset.v;toast(`${c.name} moved to ${e.dataset.v}`);render()},
  cnext:e=>{const c=C(e.dataset.id),d=+e.dataset.d;c.crm.next=d<0?null:Date.now()+d*DAY;render()},
  cnote:e=>{const v=(document.getElementById("cnote")||{}).value;if(!v||!v.trim()){toast("Write the note first");return}C(e.dataset.id).crm.notes.unshift({t:v.trim(),at:"Just now"});render()},
  clabels:e=>{S.sheet={type:"clabels",chat:e.dataset.id};render()},
  ltoggle:e=>{const c=C(S.sheet.chat),n=e.dataset.v;c.labels=c.labels||[];const i=c.labels.indexOf(n);if(i<0)c.labels.push(n);else c.labels.splice(i,1);render()},
  laddnew:()=>{const el=document.getElementById("newlabel"),v=el&&el.value.trim();if(!v){toast("Type a label name");return}
    if(S.labels.some(l=>l.name.toLowerCase()===v.toLowerCase())){toast("That label already exists");return}
    S.labels.push({name:v,color:LABEL_COLORS[S.labels.length%LABEL_COLORS.length]});if(S.sheet.type==="clabels"){const c=C(S.sheet.chat);c.labels=[...(c.labels||[]),v]}render()},
  labelsheet:()=>{S.sheet={type:"labelsheet"};render()},
  lcolor:e=>{S.labels.find(l=>l.name===e.dataset.n).color=e.dataset.v;render()},
  ldel:e=>{const n=e.dataset.n;S.labels=S.labels.filter(l=>l.name!==n);S.chats.forEach(c=>{c.labels=(c.labels||[]).filter(x=>x!==n)});if(S.filter===n)S.filter="All";toast(`Label "${n}" deleted`);render()},
  crmstage:e=>{S.crmStage=e.dataset.v;render()},
  crmlabel:e=>{S.crmLabel=e.dataset.v;render()},
  cquote:e=>{openChat(e.dataset.id);S.sheet={type:"quote",chat:e.dataset.id,sel:{},disc:0,terms:"Net 30"};render()},
  ccall:e=>toast("Calling "+C(e.dataset.id).name+" (simulated)")
});
const _go=act.go;act.go=e=>{if(e.dataset.id&&e.dataset.s==="contact"){go("contact",{id:e.dataset.id});return}_go(e)};

/* label pills in the chat header for the business side */
const _cv=chatView;
window.chatView=chatView=function(v){let h=_cv(v);const c=C(v.id);
  if(isBiz()&&c&&(c.labels||[]).length)h=h.replace('<div class="body" id="chatbody">',`<div class="hlabels">${labelPills(c,4)}<button class="linkbtn" data-act="clabels" data-id="${c.id}">Labels</button></div><div class="body" id="chatbody">`);
  return h};

/* deep links for the suite page: ?view=owner&tab=pending, ?screen=contact&id=c1, ?chat=c10, ?frame=web&web=gs, ?ob=b2, &shot=1 (read-only) */
const Q=new URLSearchParams(location.search);
if(Q.get("shot")){window.__shot=true;document.body.classList.add("shot");document.head.insertAdjacentHTML("beforeend","<style>body.shot{padding:0!important;overflow:hidden}body.shot .guide{display:none}body.shot .wrap{display:block}body.shot .phone{position:fixed;inset:0;width:100%!important;max-width:none!important;height:100%!important;border:0;border-radius:0;box-shadow:none;margin:0}</style>")}
if(Q.get("view"))S.view=Q.get("view");
if(Q.get("os"))S.os=Q.get("os");
if(Q.get("tab"))S.tab=Q.get("tab");
if(Q.get("screen"))S.stack=[{name:"tab"},{name:Q.get("screen"),id:Q.get("id")||undefined}];
if(Q.get("chat"))S.stack=[{name:"tab"},{name:"chat",id:Q.get("chat")}];
if(Q.get("frame")==="web"){S.frame="web";S.webBiz=Q.get("web")||"st"}
if(Q.get("ob")){S.ob=obDefaults();S.ob.type=Q.get("ob").startsWith("b")?"business":"personal";S.stack=[{name:"ob",step:Q.get("ob")}]}
if(Q.get("sheet")==="labels")S.sheet={type:"labelsheet"};
render();
})();
