test("guide flows run without errors",()=>{
  ok(GUIDE.length>=12,"at least the 12 original flows");
  GUIDE.forEach((g,i)=>{try{g.run()}catch(e){throw new Error("flow "+i+" "+g.t+": "+e.message)}});
  setView("owner");
});
test("all screens render",()=>{
  Object.keys(screens).forEach(k=>{try{S.stack=[{name:"tab"},{name:k,id:{pdetail:"p1",contact:"c1"}[k]||"st"}];render()}catch(e){throw new Error("screen "+k+": "+e.message)}});
  S.stack=[{name:"tab"}];render();
});
