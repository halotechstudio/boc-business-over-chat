/* Tiny test runner: open index.html?test=<suite> or admin.html?test=<suite>. Logs TESTS PASS n/n or TESTS FAIL name: msg. */
(function(){
  const T=[];
  window.test=(name,fn)=>T.push({name,fn});
  window.eq=(a,b,msg)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error((msg||"eq")+": got "+JSON.stringify(a)+", want "+JSON.stringify(b))};
  window.ok=(c,msg)=>{if(!c)throw new Error(msg||"not ok")};
  window.wait=ms=>new Promise(r=>setTimeout(r,ms));
  window.runTests=async()=>{let pass=0;const fails=[];
    for(const t of T){try{await t.fn();pass++}catch(e){fails.push(t.name+": "+e.message)}}
    const line=fails.length?"TESTS FAIL "+fails.join(" | "):"TESTS PASS "+pass+"/"+T.length;
    console.log(line);document.title=line;window.__testResult=line;return line};
  const q=new URLSearchParams(location.search).get("test");
  if(q){window.__testing=true;
    q.split(",").forEach(s=>{const sc=document.createElement("script");sc.src="tests/"+s+".test.js";sc.async=false;document.body.appendChild(sc)});
    const run=document.createElement("script");run.textContent="setTimeout(runTests,50)";run.async=false;
    window.addEventListener("load",()=>setTimeout(runTests,300));}
})();
