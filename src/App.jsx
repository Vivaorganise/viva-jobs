import React, { useState, useEffect, useRef } from "react";

const TEAM = ["Richie","Mingo","Harry","Chris","Nick"];
const DAY_START = 7;
const DAY_END = 18;
const DAY_MINS = (DAY_END - DAY_START) * 60;

const PC = {
  Richie:{bg:"#1a2a3a",border:"#2a5a8a",dot:"#4a9eff",text:"#4a9eff"},
  Mingo: {bg:"#2a1a1a",border:"#8a3a2a",dot:"#e05a2b",text:"#e05a2b"},
  Harry: {bg:"#1a2a1a",border:"#3a7a3a",dot:"#3ab56e",text:"#3ab56e"},
  Chris: {bg:"#2a2a1a",border:"#7a6a1a",dot:"#c8a020",text:"#c8a020"},
  Nick:  {bg:"#2a1a2a",border:"#6a3a7a",dot:"#9a60ba",text:"#9a60ba"},
};

const SC = {
  pending:            {bg:"#1a1a1a",border:"#333",   text:"#555",   label:"Pending"},
  travelling:         {bg:"#1e1600",border:"#4a3800",text:"#c89040",label:"Travelling"},
  arrived:            {bg:"#0f1a0f",border:"#2a4a2a",text:"#7aba50",label:"Arrived"},
  "in-progress":      {bg:"#1e1400",border:"#5a4000",text:"#e8a020",label:"In Progress"},
  "late-alert":       {bg:"#1e0800",border:"#6a2000",text:"#e05a2b",label:"Late"},
  "ready-to-invoice": {bg:"#0d1525",border:"#1a3a6a",text:"#4a9eff",label:"Invoice"},
  complete:           {bg:"#0d1a0d",border:"#1a4a1a",text:"#3ab56e",label:"Complete"},
};

const MATS = {
  "Toilet":[
    {id:"t1",name:"Fluidmaster Inlet Valve — Bottom Entry",type:"qty"},{id:"t2",name:"Fluidmaster Inlet Valve — Side Entry 15mm",type:"qty"},
    {id:"t3",name:"Caroma Outlet Valve Seal — Red",type:"qty"},{id:"t4",name:"Caroma Outlet Valve Seal — Grey",type:"qty"},
    {id:"t5",name:"Geberit Outlet Valve Seal",type:"qty"},{id:"t6",name:"Keeseal",type:"qty"},
    {id:"t7",name:"Pan Cone Seal — Double Skirt",type:"qty"},{id:"t8",name:"Pan Collar Rubber",type:"qty"},
    {id:"t9",name:"Pan Collar",type:"qty"},{id:"t10",name:"Polymer Sealant",type:"quarter"},
    {id:"t11",name:"Braided Flexible Supply Hose",type:"hose"},{id:"t12",name:"Toilet Seat — Caroma Tasman",type:"qty"},
    {id:"t13",name:"Toilet Seat — Posh Dominique Soft Close",type:"qty"},{id:"t14",name:"Sundries — Rags",type:"qty"},
  ],
  "Tap Service":[
    {id:"tp1",name:"Tap Washer Kit",type:"qty"},{id:"tp2",name:"Polymer Sealant",type:"quarter"},
    {id:"tp3",name:"Wall Top Taps Cross Handle — Jumper Valve",type:"qty"},{id:"tp4",name:"Wall Top Taps Cross Handle — Ceramic Disc",type:"qty"},
    {id:"tp5",name:"Thread Tape PTFE",type:"quarter"},{id:"tp6",name:"All Directional Shower Rose",type:"qty"},
    {id:"tp7",name:"Shower Hose — Metal",type:"qty"},
  ],
  "Flexi Hose / Health Check":[
    {id:"f1",name:"Braided Flexible Supply Hose",type:"hose"},{id:"f2",name:"Polymer Sealant",type:"quarter"},
    {id:"f3",name:"Thread Tape PTFE",type:"quarter"},{id:"f4",name:"Tap Washer Kit",type:"qty"},{id:"f5",name:"Sundries — Rags",type:"qty"},
  ],
  "Blocked Drain":[{id:"d1",name:"Drain Cleaner / Treatment",type:"qty"},{id:"d2",name:"Rubber Gloves",type:"qty"},{id:"d3",name:"Sundries — Rags",type:"qty"}],
  "Hot Water":[{id:"hw1",name:"Thread Tape PTFE",type:"quarter"},{id:"hw2",name:"Polymer Sealant",type:"quarter"},{id:"hw3",name:"Braided Flexible Supply Hose",type:"hose"},{id:"hw4",name:"Sundries — Rags",type:"qty"}],
};
const GM=[{id:"g1",name:"Polymer Sealant",type:"quarter"},{id:"g2",name:"Thread Tape PTFE",type:"quarter"},{id:"g3",name:"Braided Flexible Supply Hose",type:"hose"},{id:"g4",name:"Sundries",type:"qty"}];
const getM=jt=>MATS[jt]||GM;
const initM=jt=>{const s={};getM(jt).forEach(m=>{s[m.id]=m.type==="hose"?{used:false,length:"450"}:{used:false,qty:0};});return s;};
const mToTxt=(jt,ms)=>{const ql=["0","1/4","1/2","3/4","1"];return getM(jt).filter(m=>ms[m.id]?.used).map(m=>{const s=ms[m.id];return m.type==="qty"?`${m.name} x${s.qty}`:m.type==="quarter"?`${m.name} x${ql[s.qty]}`:`${m.name} ${s.length}mm`;}).join("\n");};

const JOBS=[
  {id:"ev001",address:"704/1 Kingsmill St, Chermside",timeStart:"08:30",timeEnd:"10:30",assignee:"Mingo",ivNumber:"IV-43216",jobType:"Toilet",notes:"Toilet leaking when flushed.",status:"pending",departedAt:null,arrivedAt:null,commencedAt:null,completedAt:null,tenantNumber:null,tenantName:"James Hargreaves",tenantPhone:"0412 345 678",agentName:"Samantha Price",agentPhone:"07 3123 4567",workOrder:{agency:"Ray White Chermside",keyNumber:"841",spendLimit:"$250",instructions:"Toilet in main bathroom leaking at base. Investigate and repair. Check all fixtures. Do not exceed spend limit.",hasPhotos:false,url:null},story:"",actionLog:[],furtherAction:"",newArrivalTime:""},
  {id:"ev002",address:"19 Yates Ave, Ashgrove",timeStart:"11:30",timeEnd:"13:30",assignee:"Chris",ivNumber:"IV-43194",jobType:"Flexi Hose / Health Check",notes:"Bathroom flexi hose replacement and health check.",status:"pending",departedAt:null,arrivedAt:null,commencedAt:null,completedAt:null,tenantNumber:2,tenantName:"Lauren Potter",tenantPhone:"0413 268 174",agentName:"Kristy Van Den Elst",agentPhone:"07 3871 1420",workOrder:{agency:"Plum Property",keyNumber:"642",spendLimit:null,instructions:"Flexi hose under bathroom sink requires replacing. Health check all taps, fittings and pipes. Repair issues while there.",hasPhotos:true,url:"https://drive.google.com"},story:"",actionLog:[],furtherAction:"",newArrivalTime:""},
  {id:"ev003",address:"12 Latrobe Tce, Paddington",timeStart:"09:00",timeEnd:"11:00",assignee:"Richie",ivNumber:"IV-43201",jobType:"Hot Water",notes:"No hot water. Rheem 250L electric. 12 years old.",status:"travelling",departedAt:"08:48",arrivedAt:null,commencedAt:null,completedAt:null,tenantNumber:1,tenantName:"Sarah Mitchell",tenantPhone:"0421 987 654",agentName:"Tom Reeves",agentPhone:"07 3300 1122",workOrder:{agency:"LJ Hooker Paddington",keyNumber:null,spendLimit:"$500",instructions:"No hot water. Electric storage approx 12 years old. Investigate. Quote separately if replacement required.",hasPhotos:false,url:"https://drive.google.com"},story:"",actionLog:[{time:"08:48",actor:"Richie",action:"Departed for job"}],furtherAction:"",newArrivalTime:""},
  {id:"ev004",address:"8 Swann Rd, Taringa",timeStart:"07:30",timeEnd:"09:00",assignee:"Nick",ivNumber:"IV-43188",jobType:"Blocked Drain",notes:"Kitchen sink blocked.",status:"ready-to-invoice",departedAt:"07:22",arrivedAt:"07:38",commencedAt:"07:41",completedAt:"08:52",tenantNumber:null,tenantName:"Tom Bassett",tenantPhone:"0408 111 222",agentName:"Brooke Lawson",agentPhone:"07 3870 5500",workOrder:{agency:"Place Estate Agents",keyNumber:null,spendLimit:"$300",instructions:"Kitchen sink blocked. Clear and investigate cause.",hasPhotos:false,url:"https://drive.google.com"},story:"Called out to investigate a blocked kitchen sink drain. The inspection opening was rodded with the 100mm retriever head, engaging the obstruction at approximately 13.65 metres. Consecutive passes were made with the 100mm cutting head to restore the full diameter of the drain. Grease and food debris were retrieved. The drain was flushed and tested confirming a clear result.",actionLog:[{time:"07:22",actor:"Nick",action:"Departed"},{time:"07:38",actor:"Nick",action:"Arrived - 16 min travel"},{time:"07:41",actor:"Nick",action:"Commenced"},{time:"08:52",actor:"Nick",action:"Completed - Further action: None"}],furtherAction:"None",newArrivalTime:""},
  {id:"ev005",address:"3 Musgrave Rd, Red Hill",timeStart:"10:00",timeEnd:"12:00",assignee:"Harry",ivNumber:"IV-43220",jobType:"Tap Service",notes:"Dripping kitchen tap.",status:"in-progress",departedAt:"09:45",arrivedAt:"10:05",commencedAt:"10:12",completedAt:null,tenantNumber:null,tenantName:"Ben Frazer",tenantPhone:"0402 567 891",agentName:"Lisa Chan",agentPhone:"07 3366 1200",workOrder:{agency:"McGrath Estate Agents",keyNumber:"312",spendLimit:"$200",instructions:"Kitchen tap dripping. Service and replace washers.",hasPhotos:false,url:null},story:"",actionLog:[{time:"09:45",actor:"Harry",action:"Departed"},{time:"10:05",actor:"Harry",action:"Arrived"},{time:"10:12",actor:"Harry",action:"Commenced"}],furtherAction:"",newArrivalTime:""},
  {id:"ev006",address:"55 Boundary St, West End",timeStart:"13:00",timeEnd:"15:00",assignee:"Mingo",ivNumber:"IV-43225",jobType:"Blocked Drain",notes:"",status:"pending",departedAt:null,arrivedAt:null,commencedAt:null,completedAt:null,tenantNumber:1,tenantName:"Kate Morrison",tenantPhone:"0411 234 567",agentName:"Jess Wang",agentPhone:"07 3844 5500",workOrder:{agency:"Harcourts",keyNumber:null,spendLimit:"$300",instructions:"Bathroom drain blocked. Clear and report cause.",hasPhotos:false,url:null},story:"",actionLog:[],furtherAction:"",newArrivalTime:""},
];

const IP=`You are a plumbing documentation assistant for Viva Plumbing, Brisbane. Convert rough plumber notes into a clean invoice description then review it. Rules: Open with "Called out to investigate...". Structure: findings > works > outcome > recommendations. Past tense for completed work. No first-person, no dot points, no pipe sizes. "Braided supply hose"->"premium PEX core braided supply hoses". "corroded" not "rusty". "Rodded" not "sent" for eel. Cables=4.55m each. Fixture location required for shower/toilet/basin/vanity/bath - flag if missing. Compare draft to agency instructions and flag gaps. Output only valid JSON: {"draft":"text","flags":["flag1"]}`;

function tn(){const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");}
function pt(t){const[h,m]=t.split(":").map(Number);return h*60+m;}
function td(a,b){const d=pt(b)-pt(a);if(d<=0)return null;return d>=60?Math.floor(d/60)+"h "+d%60+"m":d+" min";}
function sn(t,b){try{if(typeof window!=="undefined"&&"Notification"in window&&window.Notification.permission==="granted")new window.Notification(t,{body:b});}catch(e){}}
function rn(){try{if(typeof window!=="undefined"&&"Notification"in window&&window.Notification.permission==="default")window.Notification.requestPermission();}catch(e){}}
function t2p(ts){return Math.max(0,Math.min(100,(pt(ts)-DAY_START*60)/DAY_MINS*100));}
function dur(s,e){return Math.max(2,(pt(e)-pt(s))/DAY_MINS*100);}

function Dot({c,glow}){return <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:c,marginRight:6,flexShrink:0,boxShadow:glow||"none"}}/>;}

function Board({jobs,onSelect}){
  const hrs=Array.from({length:DAY_END-DAY_START+1},(_,i)=>DAY_START+i);
  const now=tn();const np=t2p(now);const sn2=pt(now)>=DAY_START*60&&pt(now)<=DAY_END*60;
  return(
    <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",overflow:"hidden",fontFamily:"'DM Mono',monospace"}}>
      {/* Time header */}
      <div style={{display:"flex",borderBottom:"1px solid #1a1a1a",background:"#060606"}}>
        <div style={{width:110,flexShrink:0,padding:"10px 12px",fontSize:10,color:"#222",letterSpacing:"0.1em",textTransform:"uppercase",borderRight:"1px solid #141414"}}>Plumber</div>
        <div style={{flex:1,position:"relative",height:34}}>
          {hrs.map(h=><div key={h} style={{position:"absolute",left:`${(h-DAY_START)/(DAY_END-DAY_START)*100}%`,top:0,height:"100%",borderLeft:"1px solid #141414",display:"flex",alignItems:"center",paddingLeft:3}}><span style={{fontSize:9,color:"#2a2a2a"}}>{h>12?`${h-12}pm`:h===12?"12pm":`${h}am`}</span></div>)}
          {sn2&&<div style={{position:"absolute",left:`${np}%`,top:0,bottom:0,width:1,background:"#e05a2b",zIndex:5}}><div style={{position:"absolute",top:4,left:2,fontSize:8,color:"#e05a2b",whiteSpace:"nowrap"}}>{now}</div></div>}
        </div>
      </div>
      {/* Rows */}
      {TEAM.map((pl,pi)=>{
        const pj=jobs.filter(j=>j.assignee===pl);const c=PC[pl];
        return(
          <div key={pl} style={{display:"flex",borderBottom:"1px solid #111",minHeight:60,background:pi%2===0?"#0a0a0a":"#080808"}}>
            <div style={{width:110,flexShrink:0,padding:"0 12px",display:"flex",flexDirection:"column",justifyContent:"center",borderRight:"1px solid #141414",background:"#060606"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <Dot c={c.dot} glow={pj.some(j=>["in-progress","travelling"].includes(j.status))?`0 0 6px ${c.dot}`:null}/>
                <span style={{fontSize:12,color:c.text,fontWeight:500}}>{pl}</span>
              </div>
              <div style={{fontSize:9,color:"#222",marginTop:2}}>{pj.length} job{pj.length!==1?"s":""}</div>
            </div>
            <div style={{flex:1,position:"relative",padding:"6px 0"}}>
              {hrs.map(h=><div key={h} style={{position:"absolute",left:`${(h-DAY_START)/(DAY_END-DAY_START)*100}%`,top:0,bottom:0,borderLeft:"1px solid #0f0f0f",pointerEvents:"none"}}/>)}
              {sn2&&<div style={{position:"absolute",left:`${np}%`,top:0,bottom:0,width:1,background:"#e05a2b22",zIndex:3,pointerEvents:"none"}}/>}
              {pj.map(job=>{
                const l=t2p(job.timeStart);const w=dur(job.timeStart,job.timeEnd);const s=SC[job.status]||SC.pending;const act=["travelling","arrived","in-progress"].includes(job.status);
                return(
                  <div key={job.id} onClick={()=>onSelect(job)}
                    style={{position:"absolute",left:`${l}%`,width:`${w}%`,top:4,bottom:4,background:s.bg,border:`1px solid ${s.border}`,borderLeft:`3px solid ${s.border}`,borderRadius:2,cursor:"pointer",overflow:"hidden",zIndex:2,boxShadow:act?`0 0 10px ${s.border}55`:"none",transition:"box-shadow 0.2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.zIndex=10;e.currentTarget.style.filter="brightness(1.3)";}}
                    onMouseLeave={e=>{e.currentTarget.style.zIndex=2;e.currentTarget.style.filter="brightness(1)";}}>
                    <div style={{padding:"3px 7px",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                      <div style={{fontSize:10,color:s.text,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.3}}>{job.timeStart} {job.address.split(",")[0]}</div>
                      <div style={{fontSize:9,color:`${s.text}88`,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:1}}>{job.jobType} · {s.label}{job.workOrder?.keyNumber?` · K${job.workOrder.keyNumber}`:""}</div>
                    </div>
                  </div>
                );
              })}
              {pj.length===0&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",paddingLeft:12}}><span style={{fontSize:10,color:"#1a1a1a"}}>No jobs today</span></div>}
            </div>
          </div>
        );
      })}
      {/* Legend */}
      <div style={{padding:"8px 16px",borderTop:"1px solid #111",display:"flex",gap:14,flexWrap:"wrap",background:"#060606"}}>
        {Object.entries(SC).map(([k,v])=><div key={k} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,background:v.bg,border:`1px solid ${v.border}`,borderRadius:1}}/><span style={{fontSize:9,color:"#2a2a2a"}}>{v.label}</span></div>)}
      </div>
    </div>
  );
}

function MyJobs({jobs,plumber,onSelect}){
  const mj=jobs.filter(j=>j.assignee===plumber).sort((a,b)=>pt(a.timeStart)-pt(b.timeStart));
  const c=PC[plumber]||PC.Richie;
  return(
    <div style={{padding:"14px 16px",fontFamily:"'DM Mono',monospace"}}>
      <div style={{fontSize:11,color:c.text,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:8}}><Dot c={c.dot}/>{plumber} — {mj.length} job{mj.length!==1?"s":""} today</div>
      {mj.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#1e1e1e",fontSize:12}}>No jobs today</div>}
      {mj.map(job=>{
        const s=SC[job.status]||SC.pending;const act=["travelling","arrived","in-progress"].includes(job.status);
        return(
          <div key={job.id} onClick={()=>onSelect(job)} style={{background:s.bg,border:`1px solid ${s.border}`,borderLeft:`4px solid ${s.border}`,padding:"14px 16px",marginBottom:10,cursor:"pointer",boxShadow:act?`0 0 14px ${s.border}44`:"none",transition:"all 0.15s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:12,color:s.text,fontWeight:500}}>{job.timeStart} – {job.timeEnd}</span>
              <span style={{fontSize:9,color:s.text,letterSpacing:"0.12em",textTransform:"uppercase",background:`${s.border}44`,padding:"2px 8px"}}>{s.label}</span>
            </div>
            <div style={{fontSize:15,color:"#ccc",fontWeight:500,marginBottom:5,lineHeight:1.3}}>{job.address}</div>
            <div style={{fontSize:11,color:"#3a3a3a",display:"flex",gap:10,flexWrap:"wrap",marginBottom:job.tenantName?5:0}}>
              <span>{job.jobType}</span><span style={{color:"#222"}}>·</span><span>{job.ivNumber}</span>
              {job.workOrder?.keyNumber&&<span style={{color:"#6a5a20"}}>Key #{job.workOrder.keyNumber}</span>}
              {job.workOrder?.spendLimit&&<span style={{color:"#6a2a10"}}>{job.workOrder.spendLimit}</span>}
            </div>
            {job.tenantName&&<div style={{fontSize:11,color:"#3a3a3a"}}>Tenant{job.tenantNumber?` #${job.tenantNumber}`:""}: {job.tenantName} — {job.tenantPhone}</div>}
          </div>
        );
      })}
    </div>
  );
}

function Drawer({job,allJobs,onClose,onUpdate}){
  const nj=allJobs.filter(j=>j.assignee===job.assignee&&j.id!==job.id&&["pending","travelling"].includes(j.status)).sort((a,b)=>pt(a.timeStart)-pt(b.timeStart))[0]||null;
  const [notes,setNotes]=useState(job.notes);
  const [story,setStory]=useState(job.story);
  const [edited,setEdited]=useState(false);
  const [flags,setFlags]=useState([]);
  const [gen,setGen]=useState(false);
  const [showComp,setShowComp]=useState(false);
  const [fa,setFa]=useState(job.furtherAction||"");
  const [copied,setCopied]=useState(false);
  const [showDir,setShowDir]=useState(false);
  const [dirRead,setDirRead]=useState(false);
  const [showNext,setShowNext]=useState(false);
  const [ms,setMs]=useState(()=>initM(job.jobType));
  const [cust,setCust]=useState([]);
  const [showWO,setShowWO]=useState(false);
  const s=SC[job.status]||SC.pending;const c=PC[job.assignee]||PC.Richie;
  const al=(action)=>[...(job.actionLog||[]),{time:tn(),actor:job.assignee,action}];
  const upd=(id,u)=>{onUpdate(id,u);};
  const handleStart=()=>upd(job.id,{status:"travelling",departedAt:tn(),actionLog:al("Departed for job")});
  const handleArr=()=>{const t=job.departedAt?td(job.departedAt,tn()):null;upd(job.id,{status:"arrived",arrivedAt:tn(),actionLog:al(`Arrived on site${t?" - travel "+t:""}`)});setShowDir(true);};
  const handleComm=()=>{upd(job.id,{status:"in-progress",commencedAt:tn(),actionLog:al("Work commenced")});setShowDir(false);};
  const handleComp=()=>{if(!fa)return;const wt=job.commencedAt?td(job.commencedAt,tn()):null;upd(job.id,{status:"ready-to-invoice",completedAt:tn(),story,notes,furtherAction:fa,actionLog:al(`Completed${wt?" - on tools "+wt:""} - ${fa}`)});setShowComp(false);if(nj)setShowNext(true);else onClose();};
  const handleNT=()=>{onUpdate(nj.id,{status:"travelling",departedAt:tn(),actionLog:[...(nj.actionLog||[]),{time:tn(),actor:nj.assignee,action:"Departed for job"}]});onClose();};
  const updM=(id,v)=>{if(id==="__c"){setCust(p=>[...p,v]);return;}setMs(p=>({...p,[id]:v}));};
  const genStory=async()=>{
    if(!notes.trim())return;setGen(true);setFlags([]);
    const mt=mToTxt(job.jobType,ms);const ct=cust.length?"\nOther: "+cust.join(", "):"";
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:IP,messages:[{role:"user",content:`Job: ${job.jobType}\nAddress: ${job.address}\nAgency instructions: ${job.workOrder?.instructions||"None"}\nMaterials:\n${mt}${ct}\nNotes: ${notes}\n\nGenerate JSON.`}]})});
      const d=await r.json();const raw=d.content?.map(b=>b.text||"").join("\n")||"";
      try{const p=JSON.parse(raw.replace(/```json|```/g,"").trim());setStory(p.draft||raw);setFlags(p.flags||[]);}catch{setStory(raw);}
      setEdited(false);
    }catch{setStory("Failed - try again.");}
    setGen(false);
  };
  const ti=[];
  if(job.departedAt)ti.push({l:"Departed",v:job.departedAt});
  if(job.arrivedAt)ti.push({l:"Arrived",v:job.arrivedAt,s:job.departedAt?td(job.departedAt,job.arrivedAt):null});
  if(job.commencedAt)ti.push({l:"Commenced",v:job.commencedAt});
  if(job.completedAt)ti.push({l:"Completed",v:job.completedAt,s:job.commencedAt?td(job.commencedAt,job.completedAt):null});
  const showM=["in-progress","ready-to-invoice","complete"].includes(job.status);
  const ql=["0","1/4","1/2","3/4","1"];
  const btn=(bg,col,txt,onClick,disabled)=><button onClick={onClick} disabled={disabled} style={{flex:1,background:disabled?"#1a1a1a":bg,border:"none",color:disabled?"#2a2a2a":col,padding:"12px 0",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:disabled?"not-allowed":"pointer",fontWeight:600}}>{txt}</button>;

  return(
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex"}}>
      <div onClick={onClose} style={{flex:1,background:"rgba(0,0,0,0.65)"}}/>
      <div style={{width:"min(500px,100vw)",background:"#0d0d0d",borderLeft:"1px solid #222",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'DM Mono',monospace"}}>
        {/* Header */}
        <div style={{padding:"18px 20px",borderBottom:"1px solid #1e1e1e",background:"#080808",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,color:"#ddd",fontWeight:500,lineHeight:1.3,marginBottom:6}}>{job.address}</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",fontSize:11,marginBottom:3}}>
                <span style={{color:"#444"}}>{job.timeStart}–{job.timeEnd}</span>
                <span style={{color:"#222"}}>·</span>
                <span style={{color:s.text,fontWeight:500}}>{s.label}</span>
                <span style={{color:"#222"}}>·</span>
                <span style={{color:c.text}}>{job.assignee}</span>
                {job.workOrder?.keyNumber&&<span style={{color:"#7a6a20"}}>Key #{job.workOrder.keyNumber}</span>}
              </div>
              <div style={{fontSize:11,color:"#2a2a2a"}}>{job.jobType} · {job.ivNumber}</div>
            </div>
            <button onClick={onClose} style={{background:"none",border:"1px solid #222",color:"#444",fontSize:14,cursor:"pointer",padding:"4px 10px",flexShrink:0}}>✕</button>
          </div>
        </div>
        {/* Body */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
          {/* Time strip */}
          {ti.length>0&&<div style={{display:"flex",gap:0,flexWrap:"wrap",marginBottom:14,padding:"10px 14px",background:"#080808",border:"1px solid #141414"}}>{ti.map((t,i)=><div key={i} style={{marginRight:18,marginBottom:4}}><div style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"#222"}}>{t.l}</div><div style={{fontSize:12,color:"#555",marginTop:2}}>{t.v}{t.s&&<span style={{fontSize:10,color:"#2a2a2a"}}> ({t.s})</span>}</div></div>)}</div>}
          {/* Contacts */}
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            {job.tenantName&&<a href={`tel:${job.tenantPhone?.replace(/\s/g,"")}`} style={{fontSize:11,color:"#555",textDecoration:"none",background:"#0a0a0a",border:"1px solid #1e1e1e",padding:"6px 10px",display:"inline-block"}}>Tel {job.tenantName}{job.tenantNumber?` #${job.tenantNumber}`:""} {job.tenantPhone}</a>}
            {job.agentName&&<a href={`tel:${job.agentPhone?.replace(/\s/g,"")}`} style={{fontSize:11,color:"#3a5a3a",textDecoration:"none",background:"#0a0a0a",border:"1px solid #161e16",padding:"6px 10px",display:"inline-block"}}>Agent {job.agentName} {job.agentPhone}</a>}
          </div>
          {/* Work order */}
          {job.workOrder&&<>
            <button onClick={()=>setShowWO(!showWO)} style={{background:"transparent",border:`1px solid ${showWO?"#2a3a4a":"#1a1a1a"}`,color:showWO?"#4a9eff":"#2a2a2a",padding:"7px 14px",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer",display:"flex",alignItems:"center",gap:8,marginBottom:8,width:"100%"}}>
              {showWO?"▲":"▼"} Work Order — {job.workOrder.agency}{job.workOrder.spendLimit&&<span style={{color:"#e05a2b"}}>{job.workOrder.spendLimit}</span>}{job.workOrder.hasPhotos&&<span>Photos</span>}
              {job.workOrder.url&&<a href={job.workOrder.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{marginLeft:"auto",fontSize:9,color:"#4a9eff",border:"1px solid #1a2a4a",padding:"2px 8px",textDecoration:"none",background:"#0d1525"}}>PDF</a>}
            </button>
            {showWO&&<div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderLeft:"3px solid #2a3a4a",padding:"12px 14px",marginBottom:12}}>
              <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:10,fontSize:11}}>
                {job.workOrder.keyNumber&&<div><div style={{fontSize:9,textTransform:"uppercase",color:"#222",marginBottom:2}}>Key</div><span style={{color:"#e8a020"}}>#{job.workOrder.keyNumber}</span></div>}
                {job.workOrder.spendLimit&&<div><div style={{fontSize:9,textTransform:"uppercase",color:"#222",marginBottom:2}}>Spend Limit</div><span style={{color:"#e05a2b"}}>{job.workOrder.spendLimit}</span></div>}
              </div>
              <div style={{fontSize:12,color:"#555",lineHeight:1.7}}>{job.workOrder.instructions}</div>
            </div>}
          </>}
          {/* Directive gate */}
          {showDir&&<div style={{background:"#0d1a0d",border:"1px solid #2a4a2a",padding:16,marginBottom:12}}>
            <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"#4a8a4a",marginBottom:10}}>Work Directives — Read Before Commencing</div>
            {job.workOrder?.keyNumber&&<div style={{fontSize:12,marginBottom:6}}>Key: <span style={{color:"#e8a020"}}>#{job.workOrder.keyNumber}</span></div>}
            {job.workOrder?.spendLimit&&<div style={{fontSize:12,marginBottom:8}}>Spend limit: <span style={{color:"#e05a2b",fontWeight:600}}>{job.workOrder.spendLimit}</span></div>}
            <div style={{fontSize:12,color:"#5a8a5a",lineHeight:1.8,background:"#080808",border:"1px solid #1a2a1a",padding:"10px 12px",marginBottom:12}}>{job.workOrder?.instructions||job.notes}</div>
            <div onClick={()=>setDirRead(!dirRead)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:14,userSelect:"none"}}>
              <div style={{width:18,height:18,border:`2px solid ${dirRead?"#3ab56e":"#2a3a2a"}`,background:dirRead?"#3ab56e":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {dirRead&&<span style={{color:"#000",fontSize:11,fontWeight:700}}>✓</span>}
              </div>
              <span style={{fontSize:11,color:dirRead?"#3ab56e":"#3a5a3a"}}>I have read and understood the work directives</span>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowDir(false)} style={{background:"transparent",border:"1px solid #1e1e1e",color:"#333",padding:"9px 14px",fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Back</button>
              <button onClick={handleComm} disabled={!dirRead} style={{flex:1,background:dirRead?"#3ab56e":"#1a1a1a",border:"none",color:dirRead?"#000":"#2a2a2a",padding:"9px 0",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:dirRead?"pointer":"not-allowed",fontWeight:600}}>Commence Job</button>
            </div>
          </div>}
          {/* Materials */}
          {showM&&!showDir&&<div style={{marginBottom:14}}>
            <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#2a2a2a",marginBottom:8}}>Materials Used</div>
            <div style={{background:"#080808",border:"1px solid #141414"}}>
              {getM(job.jobType).map((m,i,arr)=>{
                const sv=ms[m.id]||{used:false,qty:0,length:"450"};
                const tog=()=>{if(m.type==="hose")updM(m.id,{used:!sv.used,length:sv.length||"450"});else updM(m.id,{used:!sv.used,qty:sv.used?0:1});};
                return<div key={m.id} style={{borderBottom:i<arr.length-1?"1px solid #0f0f0f":"none",padding:"9px 12px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",background:sv.used?"#0d1a0d":"transparent"}}>
                  <div onClick={tog} style={{width:15,height:15,border:`1px solid ${sv.used?"#3ab56e":"#222"}`,background:sv.used?"#3ab56e":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                    {sv.used&&<span style={{color:"#000",fontSize:9,fontWeight:700}}>✓</span>}
                  </div>
                  <div onClick={tog} style={{flex:1,fontSize:12,color:sv.used?"#7aba5a":"#333",cursor:"pointer",lineHeight:1.3}}>{m.name}</div>
                  {sv.used&&m.type==="qty"&&<div style={{display:"flex",alignItems:"center",border:"1px solid #2a3a2a"}}>
                    <button onClick={()=>{const q=Math.max(0,(ms[m.id]?.qty||0)-1);updM(m.id,{...ms[m.id],qty:q,used:q>0});}} style={{background:"#111",border:"none",color:"#5a8a5a",width:26,height:26,fontSize:14,cursor:"pointer"}}>−</button>
                    <span style={{color:"#7aba5a",fontSize:12,minWidth:22,textAlign:"center"}}>{sv.qty}</span>
                    <button onClick={()=>updM(m.id,{...ms[m.id],qty:(ms[m.id]?.qty||0)+1,used:true})} style={{background:"#111",border:"none",color:"#5a8a5a",width:26,height:26,fontSize:14,cursor:"pointer"}}>+</button>
                  </div>}
                  {sv.used&&m.type==="quarter"&&<div style={{display:"flex",gap:3}}>{ql.map((l,idx)=><button key={idx} onClick={()=>updM(m.id,{...ms[m.id],qty:idx,used:idx>0})} style={{background:sv.qty===idx?"#3ab56e":"#111",border:`1px solid ${sv.qty===idx?"#3ab56e":"#1e1e1e"}`,color:sv.qty===idx?"#000":"#333",padding:"2px 6px",fontSize:10,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{l}</button>)}</div>}
                  {sv.used&&m.type==="hose"&&<div style={{display:"flex",gap:3}}>{["300","450","600"].map(ln=><button key={ln} onClick={()=>updM(m.id,{...ms[m.id],length:ln,used:true})} style={{background:sv.length===ln?"#3ab56e":"#111",border:`1px solid ${sv.length===ln?"#3ab56e":"#1e1e1e"}`,color:sv.length===ln?"#000":"#333",padding:"2px 7px",fontSize:10,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{ln}</button>)}</div>}
                </div>;
              })}
              <div style={{padding:"8px 12px",borderTop:"1px solid #0f0f0f"}}><input placeholder="Other item..." style={{width:"100%",background:"transparent",border:"none",borderBottom:"1px solid #1a1a1a",color:"#444",fontSize:12,fontFamily:"'DM Mono',monospace",padding:"3px 0",outline:"none",boxSizing:"border-box"}} onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){updM("__c",e.target.value.trim());e.target.value=="";}}} /></div>
            </div>
          </div>}
          {/* Notes */}
          {showM&&!showDir&&<div style={{marginBottom:12}}>
            <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#2a2a2a",marginBottom:6}}>Job Notes</div>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} style={{width:"100%",minHeight:80,background:"#080808",border:"1px solid #141414",color:"#777",fontFamily:"'DM Mono',monospace",fontSize:12,lineHeight:1.6,padding:"9px 11px",resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
            <button onClick={genStory} disabled={gen} style={{marginTop:7,background:"transparent",border:"1px solid #1a1a1a",color:gen?"#222":"#444",padding:"7px 14px",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:gen?"not-allowed":"pointer"}}>{gen?"Generating...":"Generate Invoice Story"}</button>
          </div>}
          {/* Story */}
          {story&&<div style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#2a2a2a"}}>Invoice Draft {edited&&<span style={{color:"#e8a020",fontSize:9}}>edited</span>}</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={genStory} style={{background:"none",border:"none",color:"#2a2a2a",fontSize:10,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Regen</button>
                <button onClick={()=>{navigator.clipboard.writeText(story);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:"none",border:"1px solid #1a1a1a",color:copied?"#3ab56e":"#2a2a2a",padding:"3px 10px",fontSize:10,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{copied?"Copied":"Copy"}</button>
              </div>
            </div>
            <textarea value={story} onChange={e=>{setStory(e.target.value);setEdited(true);}} style={{width:"100%",minHeight:130,background:"#080808",border:"1px solid #0d1e0d",color:"#777",fontFamily:"'DM Mono',monospace",fontSize:12,lineHeight:1.75,padding:"10px 12px",resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
            {flags.length>0&&<div style={{marginTop:8,background:"#180f00",border:"1px solid #3a2800",padding:"10px 14px"}}>
              <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"#7a5a10",marginBottom:7}}>Review Before Sending</div>
              {flags.map((f,i)=><div key={i} style={{fontSize:12,color:"#9a6820",lineHeight:1.6,marginBottom:i<flags.length-1?5:0}}>— {f}</div>)}
            </div>}
          </div>}
          {/* Further action */}
          {showComp&&<div style={{marginBottom:14}}>
            <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#2a2a2a",marginBottom:8}}>Further Action Required?</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {["None","Quote Required","Follow-up","Return Visit","Referral"].map(opt=><button key={opt} onClick={()=>setFa(opt)} style={{background:fa===opt?"#e05a2b":"#111",border:`1px solid ${fa===opt?"#e05a2b":"#1e1e1e"}`,color:fa===opt?"#fff":"#333",padding:"6px 12px",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{opt}</button>)}
            </div>
          </div>}
          {/* Next job prompt */}
          {showNext&&nj&&<div style={{background:"#0d1525",border:"1px solid #1a2a4a",padding:14,marginBottom:14}}>
            <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"#4a9eff",marginBottom:6}}>Next Job</div>
            <div style={{fontSize:13,color:"#ccc",marginBottom:3}}>{nj.address}</div>
            <div style={{fontSize:11,color:"#3a5a7a",marginBottom:12}}>{nj.timeStart}–{nj.timeEnd} · {nj.jobType}</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={handleNT} style={{flex:1,background:"#4a9eff",border:"none",color:"#000",padding:"9px 0",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer",fontWeight:600}}>Start Travel Now</button>
              <button onClick={()=>{setShowNext(false);onClose();}} style={{background:"transparent",border:"1px solid #1a2a4a",color:"#3a5a7a",padding:"9px 14px",fontSize:10,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Later</button>
            </div>
          </div>}
          {/* Log */}
          {job.actionLog?.length>0&&<div style={{borderTop:"1px solid #111",paddingTop:12,marginTop:8}}>
            <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"#1e1e1e",marginBottom:8}}>Action Log</div>
            {job.actionLog.map((e,i)=><div key={i} style={{fontSize:11,color:"#2a2a2a",marginBottom:4,display:"flex",gap:10}}><span style={{color:"#1e1e1e",flexShrink:0}}>{e.time}</span><span style={{color:"#222",flexShrink:0}}>{e.actor}</span><span style={{color:"#2a2a2a"}}>{e.action}</span></div>)}
          </div>}
        </div>
        {/* Action bar */}
        {!showDir&&!showNext&&<div style={{borderTop:"1px solid #1a1a1a",padding:"12px 20px",background:"#080808",flexShrink:0,display:"flex",gap:10,flexWrap:"wrap"}}>
          {job.status==="pending"&&btn("#c89040","#000","Start Job",handleStart,false)}
          {job.status==="travelling"&&btn("#7aba50","#000","Arrived on Site",handleArr,false)}
          {job.status==="arrived"&&!showDir&&btn("#3ab56e","#000","Read Directives & Commence",()=>setShowDir(true),false)}
          {job.status==="in-progress"&&!showComp&&btn("#3ab56e","#000","Complete Job",()=>setShowComp(true),false)}
          {showComp&&btn("#3ab56e","#000","Confirm Complete",handleComp,!fa)}
          {job.status==="ready-to-invoice"&&<div style={{flex:1,textAlign:"center",fontSize:11,color:"#4a9eff",letterSpacing:"0.1em",textTransform:"uppercase",padding:"12px 0"}}>Flagged for invoicing</div>}
        </div>}
      </div>
    </div>
  );
}

export default function App(){
  const [jobs,setJobs]=useState(JOBS);
  const [view,setView]=useState("board");
  const [myP,setMyP]=useState("Richie");
  const [sel,setSel]=useState(null);
  const [now,setNow]=useState(tn());
  const checked=useRef(new Set());
  useEffect(()=>{
    rn();
    const t=setInterval(()=>{
      const n=tn();setNow(n);const nm=pt(n);
      setJobs(prev=>prev.map(j=>{if(j.status!=="pending"||checked.current.has(j.id))return j;if(nm>=pt(j.timeEnd)-30){checked.current.add(j.id);sn("Viva Jobs - Action Required",`${j.assignee} job at ${j.address}`);return{...j,status:"late-alert"};}return j;}));
    },15000);
    return()=>clearInterval(t);
  },[]);
  const updJob=(id,u)=>{setJobs(p=>p.map(j=>j.id===id?{...j,...u}:j));setSel(p=>p?.id===id?{...p,...u}:p);};
  const cnt={act:jobs.filter(j=>["travelling","arrived","in-progress"].includes(j.status)).length,late:jobs.filter(j=>j.status==="late-alert").length,inv:jobs.filter(j=>j.status==="ready-to-invoice").length};
  return(
    <div style={{minHeight:"100vh",background:"#080808",fontFamily:"'DM Mono',monospace",color:"#ccc"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#080808}::-webkit-scrollbar-thumb{background:#1e1e1e}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      {sel&&<Drawer job={sel} allJobs={jobs} onClose={()=>setSel(null)} onUpdate={updJob}/>}
      {/* Header */}
      <div style={{borderBottom:"1px solid #141414",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#080808",zIndex:50}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}>
          <span style={{fontSize:15,color:"#e05a2b",letterSpacing:"0.15em",fontWeight:500}}>VIVA</span>
          <span style={{fontSize:11,color:"#1e1e1e",letterSpacing:"0.25em"}}>JOBS</span>
        </div>
        <div style={{display:"flex",gap:14,fontSize:11,alignItems:"center"}}>
          <span style={{color:"#2a2a2a"}}>{now}</span>
          {cnt.late>0&&<span style={{color:"#e05a2b",animation:"pulse 1.5s infinite"}}>! {cnt.late} late</span>}
          {cnt.act>0&&<span style={{color:"#c89040"}}>{cnt.act} active</span>}
          {cnt.inv>0&&<span style={{color:"#4a9eff"}}>{cnt.inv} to invoice</span>}
        </div>
      </div>
      {/* Nav */}
      <div style={{borderBottom:"1px solid #111",padding:"0 24px",display:"flex",alignItems:"center",background:"#060606"}}>
        <button onClick={()=>setView("board")} style={{background:"transparent",border:"none",borderBottom:`2px solid ${view==="board"?"#e05a2b":"transparent"}`,color:view==="board"?"#ccc":"#2a2a2a",padding:"12px 16px",fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Schedule Board</button>
        <button onClick={()=>setView("myjobs")} style={{background:"transparent",border:"none",borderBottom:`2px solid ${view==="myjobs"?"#e05a2b":"transparent"}`,color:view==="myjobs"?"#ccc":"#2a2a2a",padding:"12px 16px",fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>My Jobs</button>
        {view==="myjobs"&&<div style={{marginLeft:"auto",display:"flex",gap:5}}>{TEAM.map(p=>{const c=PC[p];return<button key={p} onClick={()=>setMyP(p)} style={{background:myP===p?c.bg:"transparent",border:`1px solid ${myP===p?c.border:"#141414"}`,color:myP===p?c.text:"#2a2a2a",padding:"5px 12px",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>{p}</button>;})}
        </div>}
      </div>
      {view==="board"&&<div style={{padding:"16px 24px"}}><Board jobs={jobs} onSelect={setSel}/></div>}
      {view==="myjobs"&&<MyJobs jobs={jobs} plumber={myP} onSelect={setSel}/>}
      <div style={{padding:"12px 24px",borderTop:"1px solid #0a0a0a",display:"flex",gap:14,alignItems:"center"}}>
        <button onClick={()=>setJobs(p=>p.map(j=>j.id==="ev002"?{...j,status:"late-alert"}:j))} style={{background:"none",border:"1px solid #111",color:"#141414",padding:"4px 12px",fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Demo: Late Alert</button>
        <span style={{fontSize:9,color:"#111",letterSpacing:"0.1em"}}>STAGE 1 MOCK DATA</span>
      </div>
    </div>
  );
}
