/* BOC reviews and ratings.
   Only buyers with a completed order, booking or paid invoice can review. Every new review goes to the
   BOC admin console first: BOC publishes it, or contacts the seller to put things right, or rejects it
   when it breaks the rules. Published reviews and the business's star rating show on profiles,
   products and Explore. Loaded after chatkit.js. */
(function(){
"use strict";
const RV=()=>(ADM().reviews||[]);
window.reviewsFor=(k,pid)=>RV().filter(r=>r.biz===k&&r.status==="published"&&(pid==null||r.pid===pid));
/* keep each business's rating in step with newly published reviews */
Object.values(BIZ).forEach(b=>{if(b._r0==null){b._r0=b.rating;b._n0=b.reviews||0}});
function syncRatings(){Object.entries(BIZ).forEach(([k,b])=>{const fresh=RV().filter(r=>r.biz===k&&r.status==="published"&&r.fresh);
  if(!fresh.length){b.rating=b._r0;b.reviews=b._n0;return}const sum=(b._r0||0)*b._n0+fresh.reduce((a,r)=>a+r.stars,0),n=b._n0+fresh.length;b.rating=Math.round(sum/n*10)/10;b.reviews=n})}
/* which completed purchases does the viewer have with this business? */
function purchases(k){return Object.values(S.docs).filter(d=>{const c=C(d.chat);if(!c||!c.custOnly&&!(k==="st"&&c.id==="c1"))return false;if((c.biz||"st")!==k)return false;
  return (d.kind==="order"&&["completed","delivered"].includes(d.status))||(d.kind==="bkg"&&d.status==="done")||(d.kind==="rnt"&&d.status==="returned")||(d.kind==="paylink"&&d.status==="paid")})}
window.canReview=k=>purchases(k).length>0;
const mineFor=k=>RV().filter(r=>r.biz===k&&r.author==="Meera Nair"&&r.fresh);
const stars=(n,cls="")=>`<span class="rv-stars ${cls}" aria-label="${n} out of 5">${[1,2,3,4,5].map(i=>`<i class="${i<=n?"on":""}">${ic("star","s")}</i>`).join("")}</span>`;
function summary(k){const b=BIZ[k],list=reviewsFor(k);if(!b.rating)return"";const dist=[5,4,3,2,1].map(s=>[s,list.filter(r=>r.stars===s).length]);const max=Math.max(1,...dist.map(d=>d[1]));
  return `<div class="rv-sum"><div class="rv-big"><b class="num">${b.rating}</b>${stars(Math.round(b.rating))}<small>${b.reviews} ratings</small></div><div class="rv-dist">${dist.map(([s,n])=>`<div><span>${s}</span><i><b style="width:${Math.round(n/max*100)}%"></b></i></div>`).join("")}</div></div>`}
const card=r=>`<div class="rv-card"><div class="rv-h">${av(r.author,"#566366",32)}<span><b>${esc(r.author)}</b><small>${ic("check","s")} Verified purchase · ${esc(r.order)} · ${esc(r.at)}</small></span>${stars(r.stars,"sm")}</div><p>${esc(r.text)}</p>${r.pid&&P(r.pid)?`<small class="rv-p">About ${esc(P(r.pid).name)}</small>`:""}${r.reply?`<div class="rv-reply"><b>Reply from the business</b>${esc(r.reply)}</div>`:""}</div>`;
function block(k,pid){const list=reviewsFor(k,pid),buyer=!isBiz(),mine=mineFor(k).filter(r=>r.status!=="published"&&r.status!=="rejected");
  const action=!buyer?"":mine.length?`<div class="rv-note">${ic("clock","s")}<span>Your review is with BOC for a quick check. It appears here once approved.</span></div>`:canReview(k)?`<button class="pg-btn" data-act="rvwrite" data-b="${k}" ${pid?`data-p="${pid}"`:""}>Write a review${ic("chevr","s")}</button>`:`<div class="rv-note">${ic("shield","s")}<span>Only customers who bought from ${esc(BIZ[k].name)} can review it. That keeps ratings honest.</span></div>`;
  return `<section class="pg-g"><div class="pg-gh"><h2>${pid?"Product reviews":"Ratings and reviews"}</h2><span>${list.length}</span></div>${pid?"":summary(k)}<div class="rv-list">${list.map(card).join("")||`<div class="pg-empty"><b>No reviews yet</b><span>Reviews come only from verified buyers.</span></div>`}</div>${action}</section>`}

/* profile and product pages */
const _bp=screens.bizprofile;
screens.bizprofile=v=>_bp(v).replace('<section class="pg-g"><div class="pg-gh"><h2>Verification</h2>',block(v.id)+'<section class="pg-g"><div class="pg-gh"><h2>Verification</h2>');
const _pd=screens.pdetail;
screens.pdetail=v=>_pd(v).replace('<section class="pg-g"><div class="pg-gh"><h2>Details</h2>',block("st",v.id)+'<section class="pg-g"><div class="pg-gh"><h2>Details</h2>');

/* review sheet */
const _rs=renderSheet;
window.renderSheet=renderSheet=function(){const sh=S.sheet;if(sh.type!=="rvwrite")return _rs();
  const ps=purchases(sh.biz),o=ps[ps.length-1],items=o&&o.items?o.items.filter(i=>i.pid).map(i=>P(i.pid)):[];
  return sheetWrap("Review "+esc(BIZ[sh.biz].name),`<div class="rv-pick" role="radiogroup" aria-label="Your rating">${[1,2,3,4,5].map(n=>`<button role="radio" aria-checked="${sh.stars===n}" class="${n<=(sh.stars||0)?"on":""}" data-act="rvstar" data-n="${n}" aria-label="${n} stars">${ic("star")}</button>`).join("")}</div>
    <p class="muted" style="text-align:center;margin:4px 0 12px">${["Tap to rate","Very poor","Poor","Okay","Good","Excellent"][sh.stars||0]} · for ${o?code(o.id):"your purchase"}</p>
    ${items.length?`<div class="lab">About a product (optional)</div><div class="wchips">${[["","The business"],...items.map(p=>[p.id,p.name])].map(([id,l])=>`<button class="fc ${(sh.pid||"")===id?"on":""}" data-act="sset" data-k="pid" data-v="${id}">${esc(l)}</button>`).join("")}</div>`:""}
    <div class="field"><label for="rvtext">What was it like?</label><textarea id="rvtext" placeholder="Quality, delivery, how they handled your order">${esc(sh.text||"")}</textarea></div>${sh.err?`<p class="ck-err">${esc(sh.err)}</p>`:""}
    <p class="muted" style="font-size:12.5px;margin:8px 2px 0">BOC checks every review before it's published. If something went wrong, we contact the business to put it right first.</p>`,`<button class="btn" data-act="rvsubmit">Send review</button>`)};
window.submitReview=function({biz,stars,text,pid,order}){if(!stars)return{error:"Pick a star rating."};if(!text||text.trim().length<10)return{error:"Write at least a few words (10 characters)."};
  if(!canReview(biz))return{error:"Only customers who bought from this business can review it."};
  const r={id:"RV-0"+(400+Math.floor(Math.random()*500)),biz,pid:pid||null,author:"Meera Nair",order,stars,text:text.trim(),status:"pending",at:"Today",fresh:true};
  BOCStore.patch("admin",a=>{a=a||structuredClone(SEED.admin);a.reviews=a.reviews||[];a.reviews.unshift(r);return a});return{review:r}};
Object.assign(act,{
  rvwrite:e=>{S.sheet={type:"rvwrite",biz:e.dataset.b,pid:e.dataset.p||"",stars:0};render()},
  rvstar:e=>{const t=document.getElementById("rvtext");if(t)S.sheet.text=t.value;S.sheet.stars=+e.dataset.n;render()},
  rvsubmit:()=>{const sh=S.sheet,t=(document.getElementById("rvtext")||{}).value||"",ps=purchases(sh.biz),o=ps[ps.length-1];
    const r=submitReview({biz:sh.biz,stars:sh.stars,text:t,pid:sh.pid,order:o?code(o.id):""});if(r.error){sh.err=r.error;sh.text=t;render();return}
    S.sheet=null;toast("Thanks! BOC checks reviews first, usually within a day.");render()}
});
/* after a star rating on a delivered order, offer the full review */
const _rate=act.rate;
act.rate=e=>{_rate(e);const d=D(e.dataset.id),c=d&&C(d.chat);if(!c||isBiz())return;const k=c.biz||"st";if(mineFor(k).length)return;S.sheet={type:"rvwrite",biz:k,stars:+e.dataset.n,pid:""};render()};

/* seller side: reviews BOC sent back to put right */
const _pv=pendingView;
window.pendingView=pendingView=function(){let h=_pv();const fix=RV().filter(r=>r.biz==="st"&&r.status==="seller");if(!fix.length)return h;
  const g=`<div class="secttl"><h3>Customer reviews to put right</h3><span class="num">${fix.length}</span></div><div class="glist">${fix.map(r=>`<div class="needs-i" style="align-items:flex-start"><span class="ni bad">${ic("star","s")}</span><span class="nt"><b>${esc(r.author)} · ${r.stars}★</b><small style="white-space:normal">“${esc(r.text)}” BOC asked you to resolve this before it's published.</small></span><button class="btn sm ghost" data-act="rvfix" data-id="${r.id}">Resolved</button></div>`).join("")}</div>`;
  return h.replace(/(<div class="stat2"[\s\S]*?<\/div><\/div><\/div>)/,"$1"+g)};
act.rvfix=e=>{BOCStore.patch("admin",a=>{const r=a.reviews.find(x=>x.id===e.dataset.id);r.status="seller-replied";r.reply="Sorry about this. We sent the missing item and a replacement box at no cost.";return a});toast("Sent to BOC. They'll publish the review with your reply.");render()};

const _render=render;
window.render=render=function(){syncRatings();_render()};
render();
})();
