/* BOC round 5: business tools and customer screens rebuilt on the reference's page structure.
   One pattern everywhere: top bar → large light title → one hero figure → tab row → grouped hairline
   lists (name left, value right, small label above values) → one mint action pinned at the bottom. */
(function(){
"use strict";
/* ---------- shared page parts ---------- */
const backBtn=()=>`<button class="pg-back" data-act="back" aria-label="Back">${ic(S.os==="ios"?"chev":"arrow")}</button>`;
function page({title,sub="",hero="",tabs="",body="",cta="",right="",back=true,tab=false}){
  return status()+(back||right?`<div class="pg-top">${back?backBtn():"<span></span>"}<span class="pg-r">${right}</span></div>`:`<div class="pg-top flat"></div>`)+
  `<div class="body pg ${cta?"has-cta":""}"><header class="pg-h"><h1>${title}</h1>${sub?`<p>${sub}</p>`:""}</header>${hero}${tabs}${body}</div>`+
  (cta?`<div class="pg-cta">${cta}</div>`:"")+(tab?nav():"")}
const hero=(l,v,note="",extra="")=>`<div class="pg-hero"><div class="l">${l}</div><div class="v num">${v}</div>${note?`<div class="n">${note}</div>`:""}${extra}</div>`;
const tabs=(key,opts,cur)=>`<div class="pg-tabs" role="tablist">${opts.map(([v,l,n])=>`<button role="tab" aria-selected="${cur===v}" class="${cur===v?"on":""}" data-act="pgtab" data-k="${key}" data-v="${v}">${l}${n!=null?` <span class="num">${n}</span>`:""}</button>`).join("")}</div>`;
const group=(title,rows,aside="")=>rows?`<section class="pg-g"><div class="pg-gh"><h2>${title}</h2>${aside?`<span>${aside}</span>`:""}</div><div class="pg-list">${rows}</div></section>`:"";
/* one list row: leading visual, title + subline, value + label on the right */
function item({lead="",t,s="",v="",vl="",tone="",act="",id="",data=""}){const tag=act?"button":"div";
  return `<${tag} class="pg-i" ${act?`data-act="${act}"`:""} ${id?`data-id="${id}"`:""} ${data}>${lead}<span class="pg-m"><b>${t}</b>${s?`<small>${s}</small>`:""}</span>${v||vl?`<span class="pg-v">${vl?`<small class="${tone?"st-"+tone:""}">${vl}</small>`:""}${v?`<span class="num">${v}</span>`:""}</span>`:""}${act?ic("chevr","s"):""}</${tag}>`}
const sw=(color,codeTxt)=>`<span class="pg-sw" style="background:${color}"><span>${esc(codeTxt||"")}</span></span>`;
const ico=(n,tone="")=>`<span class="pg-ic ${tone}">${ic(n,"s")}</span>`;
const kv=(rows)=>`<dl class="pg-kv">${rows.filter(Boolean).map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
const btn=(act,label,data="",cls="")=>`<button class="pg-btn ${cls}" data-act="${act}" ${data}>${label}${ic("chevr","s")}</button>`;
act.pgtab=e=>{S["pg_"+e.dataset.k]=e.dataset.v;render()};
const T=k=>S["pg_"+k];
window.PG={page,hero,tabs,group,item,sw,ico,kv,btn};

/* ---------- business: Products ---------- */
screens.catalog=()=>{const cats=[...new Set(S.products.map(p=>p.cat))],cur=T("cat")||"All";
  const ps=S.products.filter(p=>cur==="All"||p.cat===cur),value=S.products.reduce((a,p)=>a+p.stock*p.cost,0),low=S.products.filter(p=>p.stock<=p.reorder).length;
  return page({title:"Products",sub:`${S.products.length} products in ${cats.length} categories`,
    hero:hero("Stock value at cost",money(value),low?`<span class="st-bad">${low} running low</span>`:"All stock above reorder level"),
    tabs:tabs("cat",[["All","All",S.products.length],...cats.map(c=>[c,c,S.products.filter(p=>p.cat===c).length])],cur),
    body:group(cur==="All"?"All products":cur,ps.map(p=>item({lead:sw(p.color,p.code),t:esc(p.name),s:`${p.stock} ${p.unit} in stock · ${esc(p.vis)}`,v:money(p.price),vl:p.stock<=p.reorder?"Low stock":"Wholesale "+money(p.whole),tone:p.stock<=p.reorder?"bad":"",act:"pdetail",id:p.id})).join("")),
    cta:btn("go","Add a product",'data-s="addproduct"')})};

/* ---------- business: Orders ---------- */
const orderRows=list=>list.map(d=>{const[t,l]=docState(d,"biz"),c=C(d.chat);return item({lead:av(c.name,c.color,40),t:esc(c.name),s:`${code(d.id)} · ${itemsOf(d).map(i=>i.p.name).join(", ")}`,v:money(docTotal(d)),vl:esc(l),tone:t,act:"dopen",id:d.id})}).join("");
screens.orders=()=>{const all=Object.values(S.docs).filter(d=>d.kind==="order"&&!d.ext).reverse(),cur=T("ord")||"open";
  const sets={open:all.filter(d=>["placed","accepted"].includes(d.status)),moving:all.filter(d=>["shipped","delivered"].includes(d.status)),done:all.filter(d=>["completed","cancelled"].includes(d.status))};
  const held=all.filter(d=>d.pay==="held"||d.pay==="paid").reduce((a,d)=>a+docTotal(d),0);
  return page({title:"Orders",sub:`${all.length} orders`,hero:hero("Collected online",money(held),"Straight into your bank through your own gateway"),
    tabs:tabs("ord",[["open","To accept or ship",sets.open.length],["moving","On the way",sets.moving.length],["done","Done",sets.done.length]],cur),
    body:sets[cur].length?group({open:"Needs you",moving:"Shipped",done:"Completed"}[cur],orderRows(sets[cur])):`<div class="pg-empty"><b>Nothing here</b><span>${cur==="open"?"New orders from chats land here first.":"Orders move here as they progress."}</span></div>`})};

/* ---------- business: Money ---------- */
screens.money=()=>{const d=Object.values(S.docs),rec=d.filter(x=>x.kind==="invoice"&&x.status!=="paid"),pay=d.filter(x=>x.kind==="bill"&&x.status!=="paid"),cur=T("mon")||"in";
  const max=Math.max(...S.months.map(m=>m[1])),exp=S.expenses.reduce((a,x)=>a+x.a,0);
  const chart=`<div class="pg-chart" aria-label="Sales by month">${S.months.map((m,i)=>`<div class="${i===S.months.length-1?"cur":""}"><i style="height:${Math.round(m[1]/max*100)}%"></i><span>${m[0]}</span></div>`).join("")}</div>`;
  const body=cur==="in"?group("Who owes you",rec.map(x=>{const c=C(x.chat),late=x.dueTs&&x.dueTs<Date.now();return item({lead:av(c.name,c.color,40),t:esc(c.name),s:code(x.id)+" · "+(late?"overdue":"due "+esc(x.due||"")),v:money(balance(x)),vl:late?"Overdue":"",tone:late?"bad":"",act:"dopen",id:x.id})}).join(""),money(rec.reduce((a,x)=>a+balance(x),0)))
    :cur==="out"?group("Who you owe",pay.map(x=>{const c=C(x.chat);return item({lead:av(c.name,c.color,40),t:esc(c.name),s:code(x.id)+" · due "+esc(x.due),v:money(x.amount),act:"dopen",id:x.id})}).join(""),money(pay.reduce((a,x)=>a+x.amount,0)))
    :group("Expenses this month",S.expenses.map(x=>item({lead:ico("wallet"),t:esc(x.c),s:esc(x.d),v:money(x.a)})).join(""),money(exp));
  return page({title:"Money",sub:"Sales, payouts and the ledger",
    hero:hero("Sales in November",money(S.months[5][1]),`${money(S.payout.settled)} received in ${esc(S.payout.bank)}`,chart),
    tabs:tabs("mon",[["in","To collect",rec.length],["out","To pay",pay.length],["exp","Expenses",S.expenses.length]],cur),body,
    cta:cur==="exp"?`<button class="pg-btn" data-act="addexp">Add an expense${ic("chevr","s")}</button>`:""})};

/* ---------- business: Purchases ---------- */
screens.purchases=()=>{const d=Object.values(S.docs),cur=T("pur")||"active";
  const po=d.filter(x=>x.kind==="po"),rfq=d.filter(x=>x.kind==="rfq"),bills=d.filter(x=>x.kind==="bill");
  const row=x=>{const c=C(x.chat||(x.suppliers&&x.suppliers[0]));const[t,l]=docState(x,"biz");return item({lead:av(c?c.name:"S",c?c.color:"#566366",40),t:x.kind==="rfq"?"Request for quotes":esc(c.name),s:`${code(x.id)} · ${KIND[x.kind]}`,v:x.kind==="rfq"?"":money(x.amount||docTotal(x)),vl:esc(l),tone:t,act:"dopen",id:x.id})};
  const active=[...rfq.filter(x=>x.status!=="closed"),...po.filter(x=>x.status!=="received"),...bills.filter(x=>x.status!=="paid")],done=[...po.filter(x=>x.status==="received"),...bills.filter(x=>x.status==="paid"),...rfq.filter(x=>x.status==="closed")];
  const toPay=bills.filter(x=>x.status!=="paid").reduce((a,x)=>a+x.amount,0);
  return page({title:"Purchases",sub:`${S.chats.filter(c=>c.kind==="supplier").length} suppliers`,hero:hero("Bills to pay",money(toPay),`${S.products.filter(p=>p.stock<=p.reorder).length} products need restocking`),
    tabs:tabs("pur",[["active","In progress",active.length],["done","Completed",done.length],["sup","Suppliers"]],cur),
    body:cur==="sup"?group("Suppliers",S.chats.filter(c=>c.kind==="supplier").map(c=>item({lead:av(c.name,c.color,40),t:esc(c.name),s:esc(c.acct||""),act:"open",id:c.id})).join(""))
      :(cur==="active"?active:done).length?group(cur==="active"?"In progress":"Completed",(cur==="active"?active:done).map(row).join("")):`<div class="pg-empty"><b>Nothing here yet</b><span>Request quotes from suppliers to start.</span></div>`,
    cta:`<button class="pg-btn" data-act="reorder">Request quotes from suppliers${ic("chevr","s")}</button>`})};

/* ---------- business: Contracts ---------- */
screens.contracts=()=>{const cs=Object.values(S.docs).filter(x=>x.kind==="contract"),wait=cs.filter(x=>x.status!=="signed"),done=cs.filter(x=>x.status==="signed");
  const row=x=>{const c=C(x.chat),[t,l]=docState(x,"biz");return item({lead:ico("pen",t==="wait"?"mint":""),t:esc(x.title),s:`${esc(c.name)} · ${esc(x.term||"")}`,vl:esc(l),tone:t,act:"dopen",id:x.id})};
  return page({title:"Contracts",sub:"Signed inside the chat with OTP",hero:hero("Waiting for a signature",String(wait.length),`${done.length} signed · every copy carries the same fingerprint`),
    body:group("To sign",wait.map(row).join(""))+group("Signed",done.map(row).join(""))+(cs.length?"":`<div class="pg-empty"><b>No contracts yet</b><span>Send one from any chat with the + button.</span></div>`)+
      group("Templates",TEMPLATES.map(x=>item({lead:ico("file"),t:esc(x.t),s:x.c.length+" clauses"})).join(""))})};

/* ---------- business: Team ---------- */
screens.team=()=>{const chats=n=>S.chats.filter(c=>c.assignee===n).length;
  return page({title:"Team",sub:`${TEAM.length} people · one shared inbox`,
    body:group("People",TEAM.map(t=>item({lead:av(t.n,t.n==="You"?BIZ.st.color:PARTY[TEAM.indexOf(t)+3],40),t:esc(t.n==="You"?"You (Owner)":t.n),s:esc(t.r),v:"",vl:chats(t.n)?chats(t.n)+" chats assigned":""})).join(""))+
      `<section class="pg-g"><div class="pg-gh"><h2>Needs the owner's approval</h2></div><div class="pg-list pg-tg">${tg("rules","disc","Discounts above 10%","Staff quotes wait for you before the buyer sees them.")}${tg("rules","po","Purchase orders above ₹50,000","Staff purchase orders wait for you before the supplier sees them.")}</div></section>`,
    cta:`<button class="pg-btn" data-act="teaminvite">Invite a team member${ic("chevr","s")}</button>`})};
act.teaminvite=()=>{const lim=limitFor("st","users");if(TEAM.length>=lim){S.sheet={type:"upgrade",reason:`Your ${SEED.plans[planOf("st")].name} plan is for ${lim===1?"one person":lim+" people"}. Add your team on Basic or Grow, or add a staff account for ₹149 a month.`};render();return}toast("Invite link copied (simulated). "+(lim===Infinity?"No limit on your team.":"Up to "+lim+" people on your plan."))};

/* ---------- business: Plan and billing, Credit (rebuilt on the same parts) ---------- */
screens.plan=()=>{const cur=planOf("st"),p=SEED.plans[cur],f=SEED.fees;
  return page({title:"Plan and billing",sub:"Example pricing",hero:hero("Your plan",`${p.name} <small>${money(p.price)}/month</small>`,`${p.limits.users} users · ${p.limits.items===Infinity?"unlimited":p.limits.items} products · ${p.limits.msgs.toLocaleString("en-IN")} broadcast messages`),
    body:group("Plans",Object.entries(SEED.plans).map(([k,x])=>item({lead:ico(k===cur?"check":"card",k===cur?"mint":""),t:x.name,s:`${x.limits.users} users · ${x.limits.items===Infinity?"unlimited":x.limits.items} products`,v:money(x.price),vl:k===cur?"Current":"per month",tone:k===cur?"good":"",act:k===cur?"":"planset",data:`data-v="${k}"`})).join(""))+
      group("Add-ons",Object.values(SEED.addons).map(a=>item({lead:ico("plus"),t:a.name,v:money(a.price),vl:"a "+a.per})).join(""))+
      group("Payment fees",[["UPI",f.upi+"%"],["Cards and net banking",f.card+"%"]].map(([t,v])=>item({t,v})).join("")),
    cta:`<button class="pg-btn" data-act="promote">Promote your shop${ic("chevr","s")}</button>`})};
screens.credit=()=>{const rows=Object.entries(S.buyers).map(([cid,b])=>{const c=C(cid),od=Object.values(S.docs).filter(d=>d.kind==="invoice"&&d.chat===cid&&d.status!=="paid"&&d.dueTs&&d.dueTs<Date.now()).length;
    return item({lead:av(c.name,c.color,40),t:esc(c.name),s:`${b.terms} · ${({distributor:"Distributor",retailer:"Retailer",public:"Public"})[b.list]} prices`,v:money(b.used),vl:od?od+" overdue":"of "+money(b.limit),tone:od?"bad":"",act:"go",data:`data-s="contact" data-id="${cid}"`})}).join("");
  const used=Object.values(S.buyers).reduce((a,b)=>a+b.used,0);
  return page({title:"Credit and dues",sub:"Who buys on credit, and on what terms",hero:hero("Out on credit",money(used),"Invoices past their Net date turn red and get a polite reminder"),body:group("Buyers on credit",rows)})};

/* ---------- customer: Explore ---------- */
const CATS={st:"Clothing",am:"Pharmacy",kc:"Food",ms:"Food",gs:"Services",ix:"Services",dm:"Food",tt:"Rentals",ld:"Wholesale",pm:"Wholesale",qd:"Electronics"};
window.exploreView=exploreView=function(){const cur=T("exp")||"All",cats=["All",...new Set(Object.values(CATS))];
  const ads=(ADM().ads||[]).filter(a=>a.status==="live");
  const list=Object.entries(BIZ).filter(([k])=>cur==="All"||CATS[k]===cur);
  const row=([k,b])=>item({lead:av(b.name,b.color,44),t:esc(b.name)+(verified(b)?" "+vbadge(b):""),s:`${esc(b.cat)} · ${esc(b.city)}`,v:b.rating?b.rating+"★":"",vl:b.rating?b.orders.toLocaleString("en-IN")+" orders":"Not verified",tone:b.rating?"":"bad",act:"bizprofile",id:k});
  return page({title:"Explore",back:false,tab:true,sub:"Verified businesses near you",
    body:`<div class="sbar">${ic("search","s")}<input placeholder="Search businesses and products" aria-label="Search businesses"></div>`+tabs("exp",cats.map(c=>[c,c]),cur)+
      (ads.length&&cur==="All"?group("Sponsored",ads.map(a=>item({lead:ico("store","mint"),t:esc(a.biz)+' <span class="pg-spon">Sponsored</span>',s:esc(a.text||"Verified business on BOC")})).join("")):"")+
      group(cur==="All"?"All businesses":cur,list.map(row).join(""),list.length+"")})};

/* ---------- customer: Orders ---------- */
window.ordersView=ordersView=function(){const os=Object.values(S.docs).filter(d=>["order","bkg","rnt","sub","ms"].includes(d.kind)&&C(d.chat)&&C(d.chat).cp==="me").reverse();
  const open=os.filter(d=>!["completed","returned"].includes(d.status)&&!(d.kind==="ms"&&d.status==="completed")),done=os.filter(d=>!open.includes(d));
  const row=d=>{const[t,l]=docState(d,"cp"),b=BIZ[C(d.chat).biz];const what=d.kind==="order"?itemsOf(d).map(i=>i.p.name).join(", "):d.service||d.item||KIND[d.kind];
    const amt=d.kind==="order"?docTotal(d):d.kind==="ms"?d.total:d.kind==="sub"?d.log.length*d.rate:d.price||d.amount||0;
    return item({lead:av(b.name,b.color,40),t:esc(b.name),s:`${esc(what)}`,v:money(amt),vl:esc(l),tone:t,act:"dopen",id:d.id})};
  const spent=os.filter(d=>d.kind==="order").reduce((a,d)=>a+docTotal(d),0);
  return page({title:"Your orders",back:false,tab:true,hero:hero("Spent through BOC",money(spent),"Paid directly to each business"),
    body:os.length?group("In progress",open.map(row).join(""),open.length+"")+group("Completed",done.map(row).join("")):`<div class="pg-empty"><b>No orders yet</b><span>Explore businesses to start.</span></div>`})};

/* ---------- customer: You ---------- */
window.meView=meView=function(){
  return page({title:"You",back:false,tab:true,
    body:`<div class="pg-me">${av("Meera Nair",PARTY[5],64)}<div><b>Meera Nair</b><span>Personal account · Kochi</span></div></div>`+
      group("Account",[item({lead:ico("phone"),t:"Phone",s:"+91 98•••••432",vl:"Verified",tone:"good"}),item({lead:ico("pin"),t:"Delivery address",s:"14 Marine Drive, Kochi 682031"}),item({lead:ico("card"),t:"Saved payment",s:"UPI · meera@okbank"}),item({lead:ico("shield"),t:"Payments",s:"You pay each business directly. Pay only through links in the chat",vl:"Direct",tone:"good"})].join(""))+
      `<section class="pg-g"><div class="pg-gh"><h2>Personal vs business</h2></div><p class="pg-p">Personal accounts chat, shop, pay and sign. Only registered businesses can sell or send invoices, and every business shows its verification before you buy.</p></section>`,
    cta:`<button class="pg-btn ghost" data-act="startbiz">Register a business${ic("chevr","s")}</button>`})};

/* ---------- shared: business profile, shop, product ---------- */
screens.bizprofile=v=>{const b=BIZ[v.id],ok=verified(b),mine=isBiz()&&v.id==="st",susp=isSuspended(v.id);
  const checks=[["phone","Phone number","OTP on the registered mobile"],["gst","GSTIN",b.gstin||"No GSTIN on file"],["udyam","Udyam",b.udyam||"Not registered"],["kyc","Owner identity","Aadhaar e-KYC"],["bank","Bank account","In the business's name"]];
  return page({title:esc(b.name)+(ok?" "+vbadge(b):""),sub:`${esc(b.cat)} · ${esc(b.city)}`,
    hero:`<div class="pg-banner ${susp?"bad":ok?"ok":"bad"}">${ic(ok&&!susp?"shield":"alert","s")}<span><b>${susp?"Suspended by BOC":ok?"Verified business":"Not a verified business"}</b>${susp?"Orders and payments are paused.":ok?`On BOC since ${esc(b.since)}`:"Only the phone number is verified. Pay only through BOC."}</span></div>`+
      (b.rating?`<div class="pg-stats"><div><span class="num">${b.rating}★</span><small>${b.reviews} reviews</small></div><div><span class="num">${b.orders.toLocaleString("en-IN")}</span><small>orders</small></div><div><span>${esc((b.reply||"").replace("Usually replies ","").replace("within ",""))}</span><small>to reply</small></div></div>`:""),
    body:group("Verification",checks.map(([k,t,s])=>item({lead:ico(b.lv[k]?"check":"close",b.lv[k]?"good":"bad"),t,s:esc(s),vl:b.lv[k]?"Verified":"Not verified",tone:b.lv[k]?"good":"bad"})).join(""))+
      group("How they work",[["Hours",b.hours],["Delivery",b.ships],["Returns",b.returns],["Disputes",b.disputes]].filter(x=>x[1]).map(([t,s])=>item({t,s:esc(s)})).join("")),
    cta:mine?"":`<div class="pg-ctas"><button class="pg-btn ghost" data-act="shop" data-id="${v.id}">See catalog</button><button class="pg-btn" data-act="openbiz" data-id="${v.id}">Message${ic("chevr","s")}</button></div>`})};
act.openbiz=e=>{const k=e.dataset.id,c=S.chats.find(x=>x.custOnly?x.biz===k:k==="st"&&x.id==="c1");if(c)openChat(c.id);else toast("Chat starts when you send the first message (simulated)")};
screens.shop=v=>{const b=BIZ[v.id],ps=v.id==="st"?S.products.filter(p=>p.vis==="Everyone"):[];
  const svc=(SERVICES[v.id]||[]).map(s=>item({lead:ico("clock"),t:esc(s.name),s:s.dur,v:money(s.price)})).join("")+(RENTALS[v.id]||[]).map(s=>item({lead:ico("store"),t:esc(s.name),v:money(s.rate),vl:"a day"})).join("")+(SUBPLANS[v.id]||[]).map(s=>item({lead:ico("box"),t:esc(s.name),v:money(s.rate),vl:"a day"})).join("");
  return page({title:"Catalog",sub:esc(b.name),body:(ps.length?`<div class="pg-grid">${ps.map(p=>`<button class="pg-card" data-act="pdetail" data-id="${p.id}"><span class="pg-ph" style="background:${p.color}"><span>${p.code}</span></span><b>${esc(p.name)}</b><span class="num">${money(p.price)}</span></button>`).join("")}</div>`:"")+group("Offered",svc)+(!ps.length&&!svc?`<div class="pg-empty"><b>Catalog coming soon</b><span>Message the business to ask what they have.</span></div>`:"")})};
screens.pdetail=v=>{const p=P(v.id),buyer=!isBiz();
  return page({title:esc(p.name),sub:BIZ.st.name,hero:`<div class="pg-photo" style="background:${p.color}"><span>${p.code}</span><small>Photo shown as a colour block in this prototype</small></div>`+hero(buyer?"Price":"Retail price",money(p.price),buyer?"GST extra · you pay the business directly":`Wholesale ${money(p.whole)} · cost ${money(p.cost)}`),
    body:group("Details",[item({t:"Options",s:p.vars.map(esc).join(" · ")}),item({t:"Stock",s:`${p.stock} ${p.unit} available`,vl:p.stock<=p.reorder?"Low":"",tone:"bad"}),item({t:"About",s:esc(p.desc)}),item({t:"HSN",s:p.hsn})].join("")),
    cta:buyer?`<button class="pg-btn" data-act="cporder" data-id="${p.id}">Order · ${money(p.price)}${ic("chevr","s")}</button>`:""})};
/* ---------- round 6: assistant, auto-replies, quick replies, broadcasts, directory, verification ---------- */
const tgs=rows=>`<div class="pg-list pg-tg">${rows.join("")}</div>`;
const sec=(t,inner,aside="")=>`<section class="pg-g"><div class="pg-gh"><h2>${t}</h2>${aside?`<span>${aside}</span>`:""}</div>${inner}</section>`;
screens.assistant=()=>{const a=S.ai,modes=[["off","Off"],["suggest","Suggest only"],["auto","Reply for me"]];
  const say={auto:"Answers customers within the limits below and hands the chat to your team when it should.",suggest:"Drafts a reply in each chat. Nothing goes out until you tap Send.",off:"Your team answers every message."}[a.mode];
  return page({title:"AI assistant",sub:"Answers customers for Shree Textiles",
    hero:hero("Answered today",String(a.answered),`${a.handed} handed to your team · customers always see a reply is automated`),
    tabs:`<div class="pg-seg" role="radiogroup" aria-label="How it replies">${modes.map(([k,l])=>`<button role="radio" aria-checked="${a.mode===k}" class="${a.mode===k?"on":""}" data-act="aimode" data-m="${k}">${l}</button>`).join("")}</div><p class="pg-p" style="margin:8px 18px 0">${say}</p>`,
    body:sec("What it knows",tgs([tg("ai.know","catalog","Products and prices",S.products.filter(p=>p.vis!=="Hidden").length+" products, public prices only"),tg("ai.know","stock","Stock levels","In stock or out, never exact wholesale stock"),tg("ai.know","hours","Hours and location",BIZ.st.hours),tg("ai.know","policy","Delivery and returns","Shipping times, charges, 7-day returns"),tg("ai.know","faq","Your saved answers",S.quick.length+" quick replies")]))+
      sec("What it may do",tgs([tg("ai.perm","prices","Answer price and availability",""),tg("ai.perm","cards","Send product cards",""),tg("ai.perm","drafts","Start an order for the customer to confirm",""),tg("ai.perm","paylink","Send payment requests","Off: payment requests always come from a person")]))+
      group("Always hands to a person when",["Customer asks for a discount or bargains","Complaint, return or damaged item","Customer asks for a human","Order above "+money(a.limit),"It can't answer twice in a row"].map(t=>item({lead:ico("user"),t:esc(t)})).join("")),
    cta:`<button class="pg-btn" data-act="trycust">Try it as a customer${ic("chevr","s")}</button>`})};
screens.automations=()=>{const on=Object.values(S.auto).filter(v=>v===true).length;
  return page({title:"Auto-replies",sub:"Messages and reminders that send themselves",hero:hero("Switched on",`${on} <small>of 4</small>`,"Each one sends only when its trigger happens"),
    body:sec("Messages",tgs([tg("auto","greeting","Greeting","“"+S.greetingText+"”"),tg("auto","away","Away message","“"+S.awayText+"”")]))+
      sec("Reminders",tgs([tg("auto","remind","Payment reminders","3 days before an invoice is due, and on the day"),tg("auto","reorder","Low-stock suggestions","Adds a restock task to Pending at the reorder level")])),
    cta:`<button class="pg-btn" data-act="simnew">Simulate a new customer${ic("chevr","s")}</button>`})};
screens.quick=()=>page({title:"Quick replies",sub:"Type / in any chat to use one",hero:hero("Saved replies",String(S.quick.length),"Shared with your whole team"),
  body:group("Your replies",S.quick.map(q=>item({lead:`<span class="pg-ic mint" style="font-weight:600">/</span>`,t:esc(q.k),s:esc(q.t)})).join("")),
  cta:`<button class="pg-btn" data-act="qadd">Add a quick reply${ic("chevr","s")}</button>`});
act.qadd=()=>{const k="/reply"+(S.quick.length+1);S.quick.push({k,t:"Thanks for writing to Shree Textiles. We'll reply shortly."});toast(`Added ${k}. Edit the text in the real app.`);render()};
screens.broadcast=()=>{const b=S.bc||(S.bc={aud:"All customers",tpl:0});
  const tpls=["Our Diwali silk collection is here. Reply YES for the lookbook.","New stock: linen shirting in 6 colours, wholesale from ₹6,900 a roll.","This week only: 20% off Chanderi dupattas."];
  const auds={"All customers":214,"Wholesale buyers":38,"New customers":61};
  (S.labels||[]).filter(l=>!["BOC","Team","Paid","Supplier"].includes(l.name)).forEach(l=>{const n=S.chats.filter(c=>(c.labels||[]).includes(l.name)).length;if(n)auds["Label: "+l.name]=n});
  const n=auds[b.aud]||0,used=S.campaigns.reduce((a,c)=>a+c.sent,0),lim=limitFor("st","msgs");
  return page({title:"Broadcasts",sub:"Only to contacts who opted in",hero:hero("Messages this month",`${used.toLocaleString("en-IN")} <small>of ${lim.toLocaleString("en-IN")}</small>`,"Extra messages ₹0.20 each (example pricing)"),
    tabs:tabs("bc",[["new","New broadcast"],["res","Results",S.campaigns.length]],T("bc")||"new"),
    body:(T("bc")||"new")==="new"?
      sec("Send to",`<div class="frow" style="padding:0">${Object.keys(auds).map(a=>`<button class="fc ${b.aud===a?"on":""}" data-act="bcaud" data-a="${esc(a)}">${esc(a.replace("Label: ",""))} <span class="num">${auds[a]}</span></button>`).join("")}</div>`)+
      sec("Message",`<div class="pg-list">${tpls.map((t,i)=>`<button class="pg-i pg-pick ${b.tpl===i?"on":""}" data-act="bctpl" data-i="${i}" role="radio" aria-checked="${b.tpl===i}"><span class="pg-dot"></span><span class="pg-m"><small style="color:var(--ink);font-size:14px;-webkit-line-clamp:3">${esc(t)}</small></span></button>`).join("")}</div>`)
      :group("Sent",S.campaigns.slice().reverse().map(c=>item({lead:ico("mega"),t:esc(c.name),s:`${esc(c.aud)} · ${c.sent} sent · ${c.read} read · ${c.click} clicked`,v:String(c.orders),vl:c.done?"orders":"Sending",tone:c.done?"":"tint"})).join("")),
    cta:(T("bc")||"new")==="new"?`<button class="pg-btn" data-act="bcsend" data-n="${n}" data-t="${esc(tpls[b.tpl])}">Send to ${n} ${n===1?"person":"people"}${ic("chevr","s")}</button>`:""})};
screens.directory=()=>page({title:"Find businesses",sub:"Suppliers and buyers, verified by GSTIN",
  body:group("Near you",DIR.map((x,i)=>item({lead:av(x.n,PARTY[(i+3)%10],40),t:esc(x.n)+" "+ic("shield","s"),s:`${esc(x.cat)} · ${esc(x.city)}`,v:x.r+"★",act:"dirmsg",data:`data-i="${i}"`})).join(""))});
screens.verification=()=>{const b=BIZ.st,checks=[["phone","Phone number","OTP on the registered mobile"],["gst","GSTIN",b.gstin],["udyam","Udyam",b.udyam],["kyc","Owner identity","Aadhaar e-KYC"],["bank","Bank account",S.payout.bank+" · name matched"]];
  return page({title:"Verification",sub:"What buyers see before they pay you",hero:hero("Trust level","Trusted seller",`${b.orders.toLocaleString("en-IN")} orders · ${b.rating}★ from ${b.reviews} reviews`),
    body:group("Checks",checks.map(([k,t,s])=>item({lead:ico(b.lv[k]?"check":"close",b.lv[k]?"good":"bad"),t,s:esc(s||"Not on file"),vl:b.lv[k]?"Verified":"Missing",tone:b.lv[k]?"good":"bad"})).join(""))+group("Pickup address",item({lead:ico("pin"),t:"42 Town Hall Road",s:"Coimbatore 641001"})),
    cta:`<button class="pg-btn ghost" data-act="bizprofile" data-id="st">See what customers see</button>`})};
render();
})();