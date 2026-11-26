/* BOC · Ledger theme behaviour: app header on tab roots, the "Ask anything" AI bar with answers from
   the business's own data, and the income bar chart on the Business home. Loaded last. */
(function(){
"use strict";
/* ---------- answers from live data ---------- */
const docs=()=>Object.values(S.docs);
const QA=[
  {q:"How much do customers owe me?",a:()=>{const inv=docs().filter(d=>d.kind==="invoice"&&d.status!=="paid"),tot=inv.reduce((a,d)=>a+balance(d),0),top=inv.sort((x,y)=>balance(y)-balance(x))[0];
    return {big:money(tot),p:top?`${inv.length} unpaid ${inv.length===1?"invoice":"invoices"}. The largest is ${C(top.chat).name}, ${money(balance(top))} on ${code(top.id)}.`:"Nobody owes you anything right now.",go:top&&top.id}}},
  {q:"What's my gross margin?",a:()=>{const ps=S.products,rev=ps.reduce((a,p)=>a+p.price,0),cost=ps.reduce((a,p)=>a+p.cost,0),m=Math.round((rev-cost)/rev*100);
    const best=[...ps].sort((a,b)=>(b.price-b.cost)/b.price-(a.price-a.cost)/a.price)[0];return {big:m+"%",p:`Average across ${ps.length} products at retail prices. ${best.name} earns the most per rupee, ${Math.round((best.price-best.cost)/best.price*100)}%.`}}},
  {q:"Who should I follow up today?",a:()=>{const f=needsYou().filter(x=>x.t==="Follow up"||x.bad);return {big:String(f.length),p:f.length?f.map(x=>x.who+(x.bad?" (overdue payment)":"")).join(", ")+".":"No follow-ups due today."}}},
  {q:"What sold most this month?",a:()=>{const m={};docs().filter(d=>d.items).forEach(d=>d.items.forEach(i=>{const p=i.pid&&P(i.pid);if(p)m[p.name]=(m[p.name]||0)+i.qty*i.price}));const top=Object.entries(m).sort((a,b)=>b[1]-a[1])[0];
    return top?{big:money(top[1]),p:`${top[0]} leads sales on orders and invoices so far.`}:{big:"—",p:"No sales yet."}}},
  {q:"What's running out of stock?",a:()=>{const l=S.products.filter(p=>p.stock<=p.reorder);return {big:String(l.length),p:l.length?l.map(p=>`${p.name} (${p.stock} left)`).join(", ")+". Restock from Pending.":"Everything is above its reorder level."}}}
];
window.AIQA=QA;
const aibar=()=>`<div class="aibar" aria-label="Ask BOC"><div class="sug">${QA.slice(0,3).map((x,i)=>`<button data-act="aiask" data-i="${i}"><i></i>${esc(x.q)}</button>`).join("")}</div>
  <button class="bar" data-act="aiask" data-i="-1"><span class="go">${ic("spark","s")}</span><span>Ask anything or search</span><span class="k">${ic("search","s")}</span></button></div>`;
const _rs=renderSheet;
window.renderSheet=renderSheet=function(){const sh=S.sheet;
  if(sh.type!=="aiask")return _rs();
  const cur=sh.i>=0?QA[sh.i]:null,ans=cur&&cur.a();
  return sheetWrap("Ask BOC",`<div class="aiqs">${QA.map((x,i)=>`<button class="${sh.i===i?"on":""}" data-act="aiask" data-i="${i}"><i></i>${esc(x.q)}</button>`).join("")}</div>
    ${ans?`<div class="aians" role="status"><div class="who"><i>${ic("spark","s")}</i>BOC assistant · from your own data</div><div class="big2 num">${ans.big}</div><p>${esc(ans.p)}</p></div>`:`<p class="muted" style="margin:12px 2px 0">Pick a question. Answers come from your chats, invoices and stock, never from outside.</p>`}`,
    ans&&ans.go?`<button class="btn" data-act="dopen" data-id="${ans.go}">Open ${code(ans.go)}</button>`:"")};
act.aiask=e=>{const i=+e.dataset.i;S.sheet={type:"aiask",i};render()};

/* ---------- header on tab roots: wordmark, AI button, avatar ---------- */
const head=()=>`<div class="lx-top"><span class="wm"><i>B</i>BOC</span>${isBiz()?`<button class="ai" data-act="aiask" data-i="-1" aria-label="Ask BOC">${ic("spark","s")}</button>`:""}${av(isBiz()?"Shree Textiles":"Meera Nair",isBiz()?BIZ.st.color:PARTY[5],36)}</div>`;
const withHead=fn=>function(){let h=fn.apply(this,arguments);return h.replace(status(),status()+head())};
window.chatList=chatList=withHead(chatList);
window.pendingView=pendingView=withHead(pendingView);
window.moreView=moreView=withHead(moreView);
window.exploreView=exploreView=withHead(exploreView);
window.ordersView=ordersView=withHead(ordersView);
window.meView=meView=withHead(meView);

/* ---------- AI bar on owner Chats, Pending and Business home ---------- */
const withAi=fn=>function(){let h=fn.apply(this,arguments);if(!isBiz()||S.sheet)return h;
  return h.replace('<div class="body','<div class="has-ai body').replace(/(<nav class="nav")/,aibar()+"$1")};
window.chatList=chatList=withAi(chatList);
window.pendingView=pendingView=withAi(pendingView);

/* ---------- Business home: income chart, gauge ---------- */
function incomeChart(){const n=56,bars=[],pts=[];let seed=7;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
  for(let i=0;i<n;i++){const base=.35+.25*Math.sin(i/6)+.2*Math.sin(i/2.3);bars.push(Math.max(.12,Math.min(1,base+rnd()*.35)))}
  for(let i=0;i<n;i+=4){const avg=bars.slice(i,i+4).reduce((a,b)=>a+b,0)/Math.min(4,n-i);pts.push([(i+2)/n*100,100-avg*78])}
  const d=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
  const oct=S.months[4][1],sep=S.months[3][1],g=Math.round((oct-sep)/sep*100);
  return `<div class="lchart"><div class="lh"><b>Daily sales · last 8 weeks</b><span class="lg"><span><i style="background:#DCDDE1"></i>Sales</span><span><i style="background:#111214"></i>Trend</span></span></div>
  <div class="plot"><div class="bars">${bars.map((b,i)=>`<i class="${i>=24&&i<=31?"hi":""}" style="height:${Math.round(b*100)}%"></i>`).join("")}</div>
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="none" stroke="#111214" stroke-width="1.4" vector-effect="non-scaling-stroke"/></svg>
  <div class="tip"><b class="num">${money(S.months[4][1]/4.3)}</b><span class="gp">${g>=0?"+":""}${g}%</span><small>Best week, mid-October</small></div></div>
  <div class="ax"><span>Oct</span><span>Oct</span><span>Nov</span><span>Nov</span></div></div>`}
const _biz=bizView;
window.bizView=bizView=function(){let h=_biz();const hl=healthOf();
  h=h.replace(/(<div class="dash-total"[\s\S]*?<\/div><\/div>)/,"$1"+incomeChart()).replace('<div class="grade">',`<div class="grade" style="--p:${Math.round(hl.score*10)}%">`).replace(/<div class="grade"([^>]*)>([^<]*)<\/div>/,'<div class="grade"$1><span>$2</span></div>');
  h=h.replace(status(),status()+head()).replace(/<button class="fc" data-act="go" data-s="assistant">[\s\S]*?<\/button>/,"");
  return S.sheet?h:h.replace('<div class="body','<div class="has-ai body').replace(/(<nav class="nav")/,aibar()+"$1")};
render();
})();
