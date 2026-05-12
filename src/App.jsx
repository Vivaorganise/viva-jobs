import React, { useState, useEffect, useRef } from "react";

const TEAM = ["Richie","Mingo","Harry","Chris","Nick"];
const DAY_START = 7;
const DAY_END = 18;
const DAY_MINS = (DAY_END - DAY_START) * 60;

const PC = {
  Richie: {light:"#e8f0ff",border:"#4a7acc",dot:"#2a5aaa",text:"#1a3a7a"},
  Mingo:  {light:"#fff0ea",border:"#e07040",dot:"#c05020",text:"#8a2a00"},
  Harry:  {light:"#eafff0",border:"#40b060",dot:"#208040",text:"#0a5020"},
  Chris:  {light:"#fffde8",border:"#c8a820",dot:"#a07800",text:"#604800"},
  Nick:   {light:"#f5eaff",border:"#9060c0",dot:"#6030a0",text:"#3a0a70"},
};

// Job type colours matching Google Calendar style
const JT_COLORS = {
  "Toilet":                  {bg:"#d2e3fc",border:"#4a7acc",text:"#1a3a7a"},
  "Tap Service":             {bg:"#d2e3fc",border:"#4a7acc",text:"#1a3a7a"},
  "Flexi Hose / Health Check":{bg:"#ceead6",border:"#40a060",text:"#0a5020"},
  "Blocked Drain":           {bg:"#fce8b2",border:"#c09020",text:"#604800"},
  "Hot Water":               {bg:"#fce8b2",border:"#c09020",text:"#604800"},
  "Quote Only":              {bg:"#fde7f3",border:"#c060a0",text:"#7a0050"},
  "Quoted Work":             {bg:"#e6f4ea",border:"#30a050",text:"#0a4020"},
  "Urgent":                  {bg:"#ffd7d7",border:"#cc3030",text:"#8a0000"},
  "Return Visit":            {bg:"#e8eaed",border:"#7a7a7a",text:"#2a2a2a"},
  "Do and Charge":           {bg:"#d2e3fc",border:"#4a7acc",text:"#1a3a7a"},
};

const STATUS_COLORS = {
  pending:            {bg:"#f5f5f5",border:"#d0d0d0",text:"#666",    label:"Pending"},
  travelling:         {bg:"#fff8e1",border:"#f9a825",text:"#e65100", label:"Travelling"},
  arrived:            {bg:"#e8f5e9",border:"#66bb6a",text:"#1b5e20", label:"Arrived"},
  "in-progress":      {bg:"#fff3e0",border:"#ffa726",text:"#bf360c", label:"In Progress"},
  "late-alert":       {bg:"#ffebee",border:"#ef5350",text:"#b71c1c", label:"Action Required"},
  "ready-to-invoice": {bg:"#e3f2fd",border:"#42a5f5",text:"#0d47a1", label:"Ready to Invoice"},
  complete:           {bg:"#e8f5e9",border:"#66bb6a",text:"#1b5e20", label:"Complete"},
};

const AREAS = ["Inner North","Inner South","Inner West","South West","North","East","Other"];

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
    {id:"tp5",name:"Thread Tape PTFE",type:"quarter"},{id:"tp6",name:"All Directional Shower Rose",type:"qty"},{id:"tp7",name:"Shower Hose — Metal",type:"qty"},
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

// Scheduled jobs (today)
const SCHED_JOBS=[
  {id:"ev001",address:"704/1 Kingsmill St, Chermside",timeStart:"08:30",timeEnd:"10:30",assignee:"Mingo",ivNumber:"IV-43216",jobType:"Toilet",notes:"Toilet leaking when flushed.",status:"pending",departedAt:null,arrivedAt:null,commencedAt:null,completedAt:null,tenantNumber:null,tenantName:"James Hargreaves",tenantPhone:"0412 345 678",agentName:"Samantha Price",agentPhone:"07 3123 4567",area:"North",workOrder:{agency:"Ray White Chermside",keyNumber:"841",spendLimit:"$250",instructions:"Toilet in main bathroom leaking at base. Investigate and repair. Check all fixtures. Do not exceed spend limit.",hasPhotos:false,url:null},story:"",actionLog:[],furtherAction:"",newArrivalTime:""},
  {id:"ev002",address:"19 Yates Ave, Ashgrove",timeStart:"11:30",timeEnd:"13:30",assignee:"Chris",ivNumber:"IV-43194",jobType:"Flexi Hose / Health Check",notes:"Bathroom flexi hose replacement and health check.",status:"pending",departedAt:null,arrivedAt:null,commencedAt:null,completedAt:null,tenantNumber:2,tenantName:"Lauren Potter",tenantPhone:"0413 268 174",agentName:"Kristy Van Den Elst",agentPhone:"07 3871 1420",area:"Inner West",workOrder:{agency:"Plum Property",keyNumber:"642",spendLimit:null,instructions:"Flexi hose under bathroom sink requires replacing. Health check all taps, fittings and pipes.",hasPhotos:true,url:"https://drive.google.com"},story:"",actionLog:[],furtherAction:"",newArrivalTime:""},
  {id:"ev003",address:"12 Latrobe Tce, Paddington",timeStart:"09:00",timeEnd:"11:00",assignee:"Richie",ivNumber:"IV-43201",jobType:"Hot Water",notes:"No hot water. Rheem 250L electric. 12 years old.",status:"travelling",departedAt:"08:48",arrivedAt:null,commencedAt:null,completedAt:null,tenantNumber:1,tenantName:"Sarah Mitchell",tenantPhone:"0421 987 654",agentName:"Tom Reeves",agentPhone:"07 3300 1122",area:"Inner West",workOrder:{agency:"LJ Hooker Paddington",keyNumber:null,spendLimit:"$500",instructions:"No hot water. Electric storage approx 12 years old. Investigate. Quote separately if replacement required.",hasPhotos:false,url:"https://drive.google.com"},story:"",actionLog:[{time:"08:48",actor:"Richie",action:"Departed for job"}],furtherAction:"",newArrivalTime:""},
  {id:"ev004",address:"8 Swann Rd, Taringa",timeStart:"07:30",timeEnd:"09:00",assignee:"Nick",ivNumber:"IV-43188",jobType:"Blocked Drain",notes:"Kitchen sink blocked.",status:"ready-to-invoice",departedAt:"07:22",arrivedAt:"07:38",commencedAt:"07:41",completedAt:"08:52",tenantNumber:null,tenantName:"Tom Bassett",tenantPhone:"0408 111 222",agentName:"Brooke Lawson",agentPhone:"07 3870 5500",area:"Inner West",workOrder:{agency:"Place Estate Agents",keyNumber:null,spendLimit:"$300",instructions:"Kitchen sink blocked. Clear and investigate cause.",hasPhotos:false,url:"https://drive.google.com"},story:"Called out to investigate a blocked kitchen sink drain. The inspection opening was rodded with the 100mm retriever head, engaging the obstruction at approximately 13.65 metres. Consecutive passes were made with the 100mm cutting head to restore the full diameter of the drain. Grease and food debris were retrieved. The drain was flushed and tested confirming a clear result.",actionLog:[{time:"07:22",actor:"Nick",action:"Departed"},{time:"07:38",actor:"Nick",action:"Arrived — 16 min travel"},{time:"07:41",actor:"Nick",action:"Commenced"},{time:"08:52",actor:"Nick",action:"Completed — Further action: None"}],furtherAction:"None",newArrivalTime:""},
  {id:"ev005",address:"3 Musgrave Rd, Red Hill",timeStart:"10:00",timeEnd:"12:00",assignee:"Harry",ivNumber:"IV-43220",jobType:"Tap Service",notes:"Dripping kitchen tap.",status:"in-progress",departedAt:"09:45",arrivedAt:"10:05",commencedAt:"10:12",completedAt:null,tenantNumber:null,tenantName:"Ben Frazer",tenantPhone:"0402 567 891",agentName:"Lisa Chan",agentPhone:"07 3366 1200",area:"Inner North",workOrder:{agency:"McGrath Estate Agents",keyNumber:"312",spendLimit:"$200",instructions:"Kitchen tap dripping. Service and replace washers.",hasPhotos:false,url:null},story:"",actionLog:[{time:"09:45",actor:"Harry",action:"Departed"},{time:"10:05",actor:"Harry",action:"Arrived"},{time:"10:12",actor:"Harry",action:"Commenced"}],furtherAction:"",newArrivalTime:""},
  {id:"ev006",address:"55 Boundary St, West End",timeStart:"13:00",timeEnd:"15:00",assignee:"Mingo",ivNumber:"IV-43225",jobType:"Blocked Drain",notes:"",status:"pending",departedAt:null,arrivedAt:null,commencedAt:null,completedAt:null,tenantNumber:1,tenantName:"Kate Morrison",tenantPhone:"0411 234 567",agentName:"Jess Wang",agentPhone:"07 3844 5500",area:"Inner South",workOrder:{agency:"Harcourts",keyNumber:null,spendLimit:"$300",instructions:"Bathroom drain blocked. Clear and report cause.",hasPhotos:false,url:null},story:"",actionLog:[],furtherAction:"",newArrivalTime:""},
];

// Unscheduled job pool
const POOL_JOBS=[
  {id:"p001",address:"2/17 Alexandra Ave, Taringa",jobType:"Quoted Work",area:"Inner West",agentName:"Place Estate Agents",agentPhone:"07 3870 5500",ivNumber:"IV-43150",notes:"Quoted work approved. Replace bathroom tapware.",tenantName:"R. Hutchins",tenantPhone:"0401 111 222",priority:"normal"},
  {id:"p002",address:"20 Lucinda St, Taringa",jobType:"Do and Charge",area:"Inner West",agentName:"Place Estate Agents",agentPhone:"07 3870 5500",ivNumber:"IV-43155",notes:"Leaking kitchen sink tap. Do and charge.",tenantName:"S. Park",tenantPhone:"0402 333 444",priority:"normal"},
  {id:"p003",address:"3/23 Waverley Rd, Taringa",jobType:"Quote Only",area:"Inner West",agentName:"LJ Hooker",agentPhone:"07 3300 1122",ivNumber:"IV-43158",notes:"Quote only — hot water unit failing.",tenantName:"M. Brennan",tenantPhone:"0403 555 666",priority:"normal"},
  {id:"p004",address:"46 Goldsbrough Rd, Taringa",jobType:"Quoted Work",area:"Inner West",agentName:"Ray White",agentPhone:"07 3123 4567",ivNumber:"IV-43162",notes:"Approved quote — replace toilet suite.",tenantName:"J. Collins",tenantPhone:"0404 777 888",priority:"normal"},
  {id:"p005",address:"101 Lambert Rd, Indooroopilly",jobType:"Do and Charge",area:"Inner West",agentName:"McGrath",agentPhone:"07 3366 1200",ivNumber:"IV-43170",notes:"Blocked drain — kitchen.",tenantName:"A. White",tenantPhone:"0405 999 000",priority:"normal"},
  {id:"p006",address:"144 Jesmond Rd, Indooroopilly",jobType:"Quoted Work",area:"Inner West",agentName:"Plum Property",agentPhone:"07 3871 1420",ivNumber:"IV-43172",notes:"Approved — replace flexi hoses throughout.",tenantName:"C. Brown",tenantPhone:"0406 111 333",priority:"normal"},
  {id:"p007",address:"23 Walker Pl, Pullenvale",jobType:"Quoted Work",area:"South West",agentName:"Harcourts",agentPhone:"07 3844 5500",ivNumber:"IV-43180",notes:"Approved quote — bathroom renovation plumbing.",tenantName:"D. Smith",tenantPhone:"0407 222 444",priority:"normal"},
  {id:"p008",address:"43 Tangmere St, Chapel Hill",jobType:"Quote Only",area:"South West",agentName:"Ray White",agentPhone:"07 3123 4567",ivNumber:"IV-43182",notes:"Quote only — leaking shower.",tenantName:"F. Jones",tenantPhone:"0408 333 555",priority:"normal"},
  {id:"p009",address:"4/67 Sisley St, St Lucia",jobType:"Do and Charge",area:"Inner West",agentName:"Place Estate Agents",agentPhone:"07 3870 5500",ivNumber:"IV-43190",notes:"No hot water. Unit old.",tenantName:"G. Taylor",tenantPhone:"0409 444 666",priority:"urgent"},
  {id:"p010",address:"6/93 Macquarie St, St Lucia",jobType:"Quote Only",area:"Inner West",agentName:"McGrath",agentPhone:"07 3366 1200",ivNumber:"IV-43192",notes:"Quote only — bathroom renovation.",tenantName:"H. Martin",tenantPhone:"0410 555 777",priority:"normal"},
  {id:"p011",address:"1/56 Ryans Rd, St Lucia",jobType:"Quoted Work",area:"Inner West",agentName:"LJ Hooker",agentPhone:"07 3300 1122",ivNumber:"IV-43195",notes:"Approved — replace kitchen tapware.",tenantName:"I. Wilson",tenantPhone:"0411 666 888",priority:"normal"},
  {id:"p012",address:"42/7 Landsborough Tce, Toowong",jobType:"Do and Charge",area:"Inner West",agentName:"Ray White",agentPhone:"07 3123 4567",ivNumber:"IV-43200",notes:"Duplicate job — check with agent before attending.",tenantName:"J. Anderson",tenantPhone:"0412 777 999",priority:"normal"},
  {id:"p013",address:"15 Earle Lane, Toowong",jobType:"Do and Charge",area:"Inner West",agentName:"Place Estate Agents",agentPhone:"07 3870 5500",ivNumber:"IV-43205",notes:"Blocked toilet.",tenantName:"K. Thomas",tenantPhone:"0413 888 000",priority:"urgent"},
  {id:"p014",address:"3/15 Avocet St, Kenmore",jobType:"Quoted Work",area:"South West",agentName:"Harcourts",agentPhone:"07 3844 5500",ivNumber:"IV-43210",notes:"Approved — tap replacement throughout.",tenantName:"L. Jackson",tenantPhone:"0414 999 111",priority:"normal"},
  {id:"p015",address:"26 Lomandra Pl, Chapel Hill",jobType:"Do and Charge",area:"South West",agentName:"McGrath",agentPhone:"07 3366 1200",ivNumber:"IV-43215",notes:"Duplicate — confirm before attending.",tenantName:"M. Harris",tenantPhone:"0415 000 222",priority:"normal"},
];

const IP=`You are a plumbing documentation assistant for Viva Plumbing, Brisbane. Convert rough plumber notes into a clean invoice description then review it. Rules: Open with "Called out to investigate...". Structure: findings > works > outcome > recommendations. Past tense for completed work. No first-person, no dot points, no pipe sizes. "Braided supply hose"->"premium PEX core braided supply hoses". "corroded" not "rusty". "Rodded" not "sent" for eel. Cables=4.55m each. Fixture location required for shower/toilet/basin/vanity/bath - flag if missing. Compare draft to agency instructions and flag gaps. Output only valid JSON: {"draft":"text","flags":["flag1"]}`;

function tn(){const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");}
function pt(t){const[h,m]=t.split(":").map(Number);return h*60+m;}
function td(a,b){const d=pt(b)-pt(a);if(d<=0)return null;return d>=60?Math.floor(d/60)+"h "+d%60+"m":d+" min";}
function sno(t,b){try{if(typeof window!=="undefined"&&"Notification"in window&&window.Notification.permission==="granted")new window.Notification(t,{body:b});}catch(e){}}
function rno(){try{if(typeof window!=="undefined"&&"Notification"in window&&window.Notification.permission==="default")window.Notification.requestPermission();}catch(e){}}
function t2p(ts){return Math.max(0,Math.min(100,(pt(ts)-DAY_START*60)/DAY_MINS*100));}
function dur(s,e){return Math.max(2,(pt(e)-pt(s))/DAY_MINS*100);}
function jc(jt){return JT_COLORS[jt]||{bg:"#e8eaed",border:"#9aa0a6",text:"#3c4043"};}

const F="'Segoe UI',system-ui,sans-serif";
const mono="'DM Mono',monospace";

// ── Schedule Board ────────────────────────────────────────────────────────
function Board({jobs,onSelect}){
  const hrs=Array.from({length:DAY_END-DAY_START+1},(_,i)=>DAY_START+i);
  const now=tn();const np=t2p(now);const showNow=pt(now)>=DAY_START*60&&pt(now)<=DAY_END*60;
  return(
    <div style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.12)",fontFamily:F}}>
      {/* Header */}
      <div style={{display:"flex",borderBottom:"1px solid #e8eaed",background:"#f8f9fa"}}>
        <div style={{width:120,flexShrink:0,padding:"10px 14px",fontSize:11,color:"#80868b",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",borderRight:"1px solid #e8eaed"}}>Plumber</div>
        <div style={{flex:1,position:"relative",height:36}}>
          {hrs.map(h=>(
            <div key={h} style={{position:"absolute",left:`${(h-DAY_START)/(DAY_END-DAY_START)*100}%`,top:0,height:"100%",borderLeft:"1px solid #e8eaed",display:"flex",alignItems:"center",paddingLeft:4}}>
              <span style={{fontSize:10,color:"#9aa0a6",fontWeight:500}}>{h>12?`${h-12}pm`:h===12?"12pm":`${h}am`}</span>
            </div>
          ))}
          {showNow&&<div style={{position:"absolute",left:`${np}%`,top:0,bottom:0,width:2,background:"#ea4335",zIndex:5}}><div style={{position:"absolute",top:2,left:3,fontSize:9,color:"#ea4335",fontWeight:600,whiteSpace:"nowrap"}}>{now}</div></div>}
        </div>
      </div>
      {/* Rows */}
      {TEAM.map((pl,pi)=>{
        const pj=jobs.filter(j=>j.assignee===pl);const c=PC[pl];
        const hasActive=pj.some(j=>["in-progress","travelling"].includes(j.status));
        return(
          <div key={pl} style={{display:"flex",borderBottom:pi<TEAM.length-1?"1px solid #f1f3f4":"none",minHeight:64,background:pi%2===0?"#fff":"#fafafa"}}>
            <div style={{width:120,flexShrink:0,padding:"0 14px",display:"flex",flexDirection:"column",justifyContent:"center",borderRight:"1px solid #e8eaed",background:pi%2===0?"#fff":"#fafafa"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:c.dot,flexShrink:0,boxShadow:hasActive?`0 0 0 3px ${c.dot}33`:""}}/>
                <span style={{fontSize:13,color:c.text,fontWeight:600}}>{pl}</span>
              </div>
              <div style={{fontSize:10,color:"#9aa0a6",marginTop:2,paddingLeft:17}}>{pj.length} job{pj.length!==1?"s":""}</div>
            </div>
            <div style={{flex:1,position:"relative",padding:"6px 0"}}>
              {hrs.map(h=><div key={h} style={{position:"absolute",left:`${(h-DAY_START)/(DAY_END-DAY_START)*100}%`,top:0,bottom:0,borderLeft:"1px solid #f1f3f4",pointerEvents:"none"}}/>)}
              {showNow&&<div style={{position:"absolute",left:`${np}%`,top:0,bottom:0,width:2,background:"#ea433522",zIndex:3,pointerEvents:"none"}}/>}
              {pj.map(job=>{
                const l=t2p(job.timeStart);const w=dur(job.timeStart,job.timeEnd);
                const jcolor=jc(job.jobType);const sc=STATUS_COLORS[job.status]||STATUS_COLORS.pending;
                const act=["travelling","arrived","in-progress"].includes(job.status);
                const isLate=job.status==="late-alert";
                return(
                  <div key={job.id} onClick={()=>onSelect(job)}
                    title={`${job.address} — ${job.jobType} — ${sc.label}`}
                    style={{position:"absolute",left:`${l}%`,width:`${w}%`,top:5,bottom:5,
                      background:isLate?"#ffebee":act?sc.bg:jcolor.bg,
                      border:`1px solid ${isLate?"#ef5350":act?sc.border:jcolor.border}`,
                      borderLeft:`3px solid ${isLate?"#ef5350":act?sc.border:jcolor.border}`,
                      borderRadius:4,cursor:"pointer",overflow:"hidden",zIndex:2,
                      boxShadow:act?"0 1px 4px rgba(0,0,0,0.2)":"0 1px 2px rgba(0,0,0,0.08)",
                      transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.25)";e.currentTarget.style.zIndex=10;}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow=act?"0 1px 4px rgba(0,0,0,0.2)":"0 1px 2px rgba(0,0,0,0.08)";e.currentTarget.style.zIndex=2;}}>
                    <div style={{padding:"3px 7px",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                      <div style={{fontSize:11,color:isLate?"#b71c1c":act?sc.text:jcolor.text,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.3}}>
                        {job.timeStart} {job.address.split(",")[0]}
                      </div>
                      <div style={{fontSize:10,color:isLate?"#ef5350":act?sc.text:jcolor.text,opacity:0.8,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:1}}>
                        {job.jobType}{job.workOrder?.keyNumber?` · Key ${job.workOrder.keyNumber}`:""} {isLate?"⚠":act?"●":""}
                      </div>
                    </div>
                  </div>
                );
              })}
              {pj.length===0&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",paddingLeft:14}}><span style={{fontSize:11,color:"#dadce0",fontStyle:"italic"}}>No jobs today</span></div>}
            </div>
          </div>
        );
      })}
      {/* Legend */}
      <div style={{padding:"10px 16px",borderTop:"1px solid #e8eaed",display:"flex",gap:14,flexWrap:"wrap",background:"#f8f9fa",alignItems:"center"}}>
        <span style={{fontSize:10,color:"#80868b",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Status:</span>
        {Object.entries(STATUS_COLORS).slice(0,5).map(([k,v])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:10,height:10,background:v.bg,border:`2px solid ${v.border}`,borderRadius:2}}/>
            <span style={{fontSize:10,color:"#5f6368"}}>{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Job Pool ──────────────────────────────────────────────────────────────
function JobPool({poolJobs,onSchedule}){
  const [areaFilter,setArea]=useState("All");
  const [typeFilter,setType]=useState("All");
  const [search,setSearch]=useState("");
  const areas=["All",...AREAS.filter(a=>poolJobs.some(j=>j.area===a))];
  const types=["All",...[...new Set(poolJobs.map(j=>j.jobType))]];
  const filtered=poolJobs.filter(j=>{
    const byA=areaFilter==="All"||j.area===areaFilter;
    const byT=typeFilter==="All"||j.jobType===typeFilter;
    const byS=!search||j.address.toLowerCase().includes(search.toLowerCase())||j.agentName.toLowerCase().includes(search.toLowerCase());
    return byA&&byT&&byS;
  });
  // Group by area
  const grouped={};filtered.forEach(j=>{if(!grouped[j.area])grouped[j.area]=[];grouped[j.area].push(j);});
  return(
    <div style={{fontFamily:F}}>
      {/* Filters */}
      <div style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:8,padding:"14px 16px",marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search address or agent..."
            style={{flex:1,minWidth:180,border:"1px solid #e0e0e0",borderRadius:6,padding:"7px 12px",fontSize:13,color:"#3c4043",fontFamily:F,outline:"none",background:"#f8f9fa"}}/>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {areas.map(a=><button key={a} onClick={()=>setArea(a)} style={{background:areaFilter===a?"#1a73e8":"#f1f3f4",color:areaFilter===a?"#fff":"#5f6368",border:"none",borderRadius:16,padding:"5px 14px",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:F}}>{a}</button>)}
          </div>
          <select value={typeFilter} onChange={e=>setType(e.target.value)} style={{border:"1px solid #e0e0e0",borderRadius:6,padding:"7px 10px",fontSize:12,color:"#3c4043",fontFamily:F,background:"#f8f9fa",outline:"none"}}>
            {types.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{marginTop:10,fontSize:12,color:"#80868b"}}>{filtered.length} jobs in pool{areaFilter!=="All"?` — ${areaFilter}`:""}</div>
      </div>
      {/* Groups */}
      {Object.entries(grouped).map(([area,aJobs])=>(
        <div key={area} style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:"#5f6368",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8,paddingLeft:2}}>{area} — {aJobs.length} jobs</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:10}}>
            {aJobs.map(job=>{
              const c=jc(job.jobType);const urgent=job.priority==="urgent";
              return(
                <div key={job.id} style={{background:urgent?"#fff8f8":c.bg,border:`1px solid ${urgent?"#ef5350":c.border}`,borderRadius:8,padding:"12px 14px",cursor:"pointer",boxShadow:"0 1px 2px rgba(0,0,0,0.08)",transition:"all 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.15)"}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 2px rgba(0,0,0,0.08)"}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6,gap:8}}>
                    <div style={{fontSize:13,fontWeight:600,color:urgent?"#b71c1c":c.text,lineHeight:1.3,flex:1}}>{urgent?"⚠ ":""}{job.address}</div>
                    <div style={{fontSize:10,fontWeight:600,color:c.text,background:"rgba(255,255,255,0.7)",border:`1px solid ${c.border}`,borderRadius:12,padding:"2px 8px",whiteSpace:"nowrap",flexShrink:0}}>{job.jobType}</div>
                  </div>
                  <div style={{fontSize:11,color:"#5f6368",marginBottom:4}}>{job.agentName} · {job.ivNumber}</div>
                  {job.notes&&<div style={{fontSize:11,color:"#80868b",marginBottom:8,lineHeight:1.4}}>{job.notes}</div>}
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <a href={`tel:${job.tenantPhone?.replace(/\s/g,"")}`} onClick={e=>e.stopPropagation()} style={{fontSize:11,color:"#1a73e8",textDecoration:"none"}}>{job.tenantName} {job.tenantPhone}</a>
                    <button onClick={e=>{e.stopPropagation();onSchedule(job);}}
                      style={{marginLeft:"auto",background:"#1a73e8",color:"#fff",border:"none",borderRadius:16,padding:"4px 14px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F}}>Schedule</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {filtered.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#9aa0a6",fontSize:14}}>No jobs match this filter</div>}
    </div>
  );
}

// ── My Jobs view ──────────────────────────────────────────────────────────
function MyJobs({jobs,plumber,onSelect}){
  const mj=jobs.filter(j=>j.assignee===plumber).sort((a,b)=>pt(a.timeStart)-pt(b.timeStart));
  const c=PC[plumber]||PC.Richie;
  return(
    <div style={{padding:"16px",fontFamily:F}}>
      <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:10,height:10,borderRadius:"50%",background:c.dot}}/>{plumber} — {mj.length} job{mj.length!==1?"s":""} today
      </div>
      {mj.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#9aa0a6",fontSize:14}}>No jobs scheduled today</div>}
      {mj.map(job=>{
        const s=STATUS_COLORS[job.status]||STATUS_COLORS.pending;const jcolor=jc(job.jobType);
        const act=["travelling","arrived","in-progress"].includes(job.status);
        return(
          <div key={job.id} onClick={()=>onSelect(job)}
            style={{background:act?s.bg:jcolor.bg,border:`1px solid ${act?s.border:jcolor.border}`,borderLeft:`4px solid ${act?s.border:jcolor.border}`,borderRadius:8,padding:"14px 16px",marginBottom:10,cursor:"pointer",boxShadow:act?"0 2px 8px rgba(0,0,0,0.15)":"0 1px 2px rgba(0,0,0,0.08)",transition:"all 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.2)"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow=act?"0 2px 8px rgba(0,0,0,0.15)":"0 1px 2px rgba(0,0,0,0.08)"}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:13,color:act?s.text:jcolor.text,fontWeight:700}}>{job.timeStart} – {job.timeEnd}</span>
              <span style={{fontSize:10,color:act?s.text:jcolor.text,fontWeight:600,background:"rgba(255,255,255,0.7)",border:`1px solid ${act?s.border:jcolor.border}`,borderRadius:12,padding:"2px 10px"}}>{s.label}</span>
            </div>
            <div style={{fontSize:15,color:"#202124",fontWeight:600,marginBottom:5,lineHeight:1.3}}>{job.address}</div>
            <div style={{fontSize:12,color:"#5f6368",marginBottom:job.tenantName?5:0,display:"flex",gap:10,flexWrap:"wrap"}}>
              <span>{job.jobType}</span><span>·</span><span>{job.ivNumber}</span>
              {job.workOrder?.keyNumber&&<span style={{color:"#e65100",fontWeight:600}}>Key #{job.workOrder.keyNumber}</span>}
              {job.workOrder?.spendLimit&&<span style={{color:"#c62828",fontWeight:600}}>{job.workOrder.spendLimit}</span>}
            </div>
            {job.tenantName&&<div style={{fontSize:12,color:"#5f6368"}}>Tenant{job.tenantNumber?` #${job.tenantNumber}`:""}: <span style={{color:"#1a73e8"}}>{job.tenantName} — {job.tenantPhone}</span></div>}
          </div>
        );
      })}
    </div>
  );
}

// ── Schedule Modal (for pool jobs) ────────────────────────────────────────
function ScheduleModal({job,onConfirm,onClose}){
  const [pl,setPl]=useState("Richie");const [date,setDate]=useState(new Date().toISOString().split("T")[0]);const [start,setStart]=useState("09:00");const [end,setEnd]=useState("11:00");
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
      <div style={{background:"#fff",borderRadius:12,maxWidth:440,width:"100%",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",fontFamily:F,overflow:"hidden"}}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid #e8eaed",background:"#f8f9fa"}}>
          <div style={{fontSize:11,fontWeight:600,color:"#80868b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Schedule Job</div>
          <div style={{fontSize:14,fontWeight:600,color:"#202124"}}>{job.address}</div>
          <div style={{fontSize:12,color:"#5f6368",marginTop:2}}>{job.jobType} · {job.agentName}</div>
        </div>
        <div style={{padding:"20px 24px"}}>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:600,color:"#5f6368",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Assign to</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {TEAM.map(p=>{const c=PC[p];return<button key={p} onClick={()=>setPl(p)} style={{background:pl===p?c.dot:"#f1f3f4",color:pl===p?"#fff":c.text,border:`1px solid ${pl===p?c.dot:c.border}`,borderRadius:20,padding:"6px 16px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>{p}</button>;})}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:600,color:"#5f6368",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Date</div>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{border:"1px solid #e0e0e0",borderRadius:6,padding:"8px 12px",fontSize:13,width:"100%",boxSizing:"border-box",fontFamily:F,outline:"none"}}/>
          </div>
          <div style={{display:"flex",gap:12,marginBottom:4}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:600,color:"#5f6368",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Start</div>
              <input type="time" value={start} onChange={e=>setStart(e.target.value)} style={{border:"1px solid #e0e0e0",borderRadius:6,padding:"8px 12px",fontSize:13,width:"100%",boxSizing:"border-box",fontFamily:F,outline:"none"}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:600,color:"#5f6368",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>End</div>
              <input type="time" value={end} onChange={e=>setEnd(e.target.value)} style={{border:"1px solid #e0e0e0",borderRadius:6,padding:"8px 12px",fontSize:13,width:"100%",boxSizing:"border-box",fontFamily:F,outline:"none"}}/>
            </div>
          </div>
        </div>
        <div style={{padding:"16px 24px",borderTop:"1px solid #e8eaed",display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid #e0e0e0",color:"#5f6368",padding:"9px 20px",borderRadius:6,fontSize:13,cursor:"pointer",fontFamily:F}}>Cancel</button>
          <button onClick={()=>onConfirm({...job,id:"ev_"+Date.now(),assignee:pl,timeStart:start,timeEnd:end,status:"pending",actionLog:[],story:"",furtherAction:"",newArrivalTime:"",departedAt:null,arrivedAt:null,commencedAt:null,completedAt:null})} style={{background:"#1a73e8",color:"#fff",border:"none",padding:"9px 24px",borderRadius:6,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F}}>Schedule Job</button>
        </div>
      </div>
    </div>
  );
}

// ── Job Drawer ────────────────────────────────────────────────────────────
function Drawer({job,allJobs,onClose,onUpdate}){
  const nj=allJobs.filter(j=>j.assignee===job.assignee&&j.id!==job.id&&["pending","travelling"].includes(j.status)).sort((a,b)=>pt(a.timeStart)-pt(b.timeStart))[0]||null;
  const [notes,setNotes]=useState(job.notes);const [story,setStory]=useState(job.story);const [edited,setEdited]=useState(false);const [flags,setFlags]=useState([]);const [gen,setGen]=useState(false);const [showComp,setShowComp]=useState(false);const [fa,setFa]=useState(job.furtherAction||"");const [copied,setCopied]=useState(false);const [showDir,setShowDir]=useState(false);const [dirRead,setDirRead]=useState(false);const [showNext,setShowNext]=useState(false);const [ms,setMs]=useState(()=>initM(job.jobType));const [cust,setCust]=useState([]);const [showWO,setShowWO]=useState(false);
  const s=STATUS_COLORS[job.status]||STATUS_COLORS.pending;const c=PC[job.assignee]||PC.Richie;const jcolor=jc(job.jobType);
  const al=(action)=>[...(job.actionLog||[]),{time:tn(),actor:job.assignee,action}];
  const upd=(id,u)=>onUpdate(id,u);
  const handleStart=()=>upd(job.id,{status:"travelling",departedAt:tn(),actionLog:al("Departed for job")});
  const handleArr=()=>{const t=job.departedAt?td(job.departedAt,tn()):null;upd(job.id,{status:"arrived",arrivedAt:tn(),actionLog:al(`Arrived on site${t?" — travel "+t:""}`)});setShowDir(true);};
  const handleComm=()=>{upd(job.id,{status:"in-progress",commencedAt:tn(),actionLog:al("Work commenced")});setShowDir(false);};
  const handleComp=()=>{if(!fa)return;const wt=job.commencedAt?td(job.commencedAt,tn()):null;upd(job.id,{status:"ready-to-invoice",completedAt:tn(),story,notes,furtherAction:fa,actionLog:al(`Completed${wt?" — on tools "+wt:""} — ${fa}`)});setShowComp(false);if(nj)setShowNext(true);else onClose();};
  const handleNT=()=>{onUpdate(nj.id,{status:"travelling",departedAt:tn(),actionLog:[...(nj.actionLog||[]),{time:tn(),actor:nj.assignee,action:"Departed for job"}]});onClose();};
  const updM=(id,v)=>{if(id==="__c"){setCust(p=>[...p,v]);return;}setMs(p=>({...p,[id]:v}));};
  const genStory=async()=>{if(!notes.trim())return;setGen(true);setFlags([]);const mt=mToTxt(job.jobType,ms);const ct=cust.length?"\nOther: "+cust.join(", "):"";
    try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:IP,messages:[{role:"user",content:`Job: ${job.jobType}\nAddress: ${job.address}\nAgency instructions: ${job.workOrder?.instructions||"None"}\nMaterials:\n${mt}${ct}\nNotes: ${notes}\n\nGenerate JSON.`}]})});
    const d=await r.json();const raw=d.content?.map(b=>b.text||"").join("\n")||"";
    try{const p=JSON.parse(raw.replace(/```json|```/g,"").trim());setStory(p.draft||raw);setFlags(p.flags||[]);}catch{setStory(raw);}setEdited(false);}catch{setStory("Failed — try again.");}setGen(false);};
  const ti=[];
  if(job.departedAt)ti.push({l:"Departed",v:job.departedAt});
  if(job.arrivedAt)ti.push({l:"Arrived",v:job.arrivedAt,sub:job.departedAt?td(job.departedAt,job.arrivedAt):null});
  if(job.commencedAt)ti.push({l:"Commenced",v:job.commencedAt});
  if(job.completedAt)ti.push({l:"Completed",v:job.completedAt,sub:job.commencedAt?td(job.commencedAt,job.completedAt):null});
  const showM=["in-progress","ready-to-invoice","complete"].includes(job.status);const ql=["0","¼","½","¾","1"];
  const act=["travelling","arrived","in-progress"].includes(job.status);
  const headerBg=act?s.bg:jcolor.bg;const headerBorder=act?s.border:jcolor.border;
  const Btn=({bg,col,txt,onClick,dis})=><button onClick={onClick} disabled={dis} style={{flex:1,background:dis?"#e0e0e0":bg,border:"none",color:dis?"#9aa0a6":col,padding:"12px 0",fontSize:13,fontWeight:600,cursor:dis?"not-allowed":"pointer",fontFamily:F,borderRadius:6}}>{txt}</button>;
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex"}}>
      <div onClick={onClose} style={{flex:1,background:"rgba(0,0,0,0.4)"}}/>
      <div style={{width:"min(520px,100vw)",background:"#fff",borderLeft:"1px solid #e0e0e0",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:F,boxShadow:"-4px 0 20px rgba(0,0,0,0.15)"}}>
        {/* Header */}
        <div style={{padding:"18px 20px",borderBottom:`3px solid ${headerBorder}`,background:headerBg,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:11,fontWeight:700,color:act?s.text:jcolor.text,background:"rgba(255,255,255,0.7)",border:`1px solid ${headerBorder}`,borderRadius:12,padding:"2px 10px"}}>{s.label}</span>
                <span style={{fontSize:11,color:c.text,fontWeight:600,background:"rgba(255,255,255,0.7)",border:`1px solid ${c.border}`,borderRadius:12,padding:"2px 10px"}}>{job.assignee}</span>
              </div>
              <div style={{fontSize:16,color:"#202124",fontWeight:700,lineHeight:1.3,marginBottom:4}}>{job.address}</div>
              <div style={{fontSize:12,color:"#5f6368",display:"flex",gap:10,flexWrap:"wrap"}}>
                <span>{job.timeStart}–{job.timeEnd}</span><span>·</span><span>{job.jobType}</span><span>·</span><span>{job.ivNumber}</span>
                {job.workOrder?.keyNumber&&<span style={{color:"#e65100",fontWeight:700}}>Key #{job.workOrder.keyNumber}</span>}
                {job.workOrder?.spendLimit&&<span style={{color:"#c62828",fontWeight:700}}>{job.workOrder.spendLimit}</span>}
              </div>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.8)",border:"1px solid #e0e0e0",color:"#5f6368",fontSize:16,cursor:"pointer",padding:"6px 12px",borderRadius:6,flexShrink:0}}>✕</button>
          </div>
        </div>
        {/* Body */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
          {/* Time strip */}
          {ti.length>0&&<div style={{display:"flex",gap:0,flexWrap:"wrap",marginBottom:14,padding:"10px 14px",background:"#f8f9fa",border:"1px solid #e8eaed",borderRadius:8}}>
            {ti.map((t,i)=><div key={i} style={{marginRight:20,marginBottom:4}}><div style={{fontSize:10,fontWeight:600,color:"#80868b",textTransform:"uppercase",letterSpacing:"0.05em"}}>{t.l}</div><div style={{fontSize:13,color:"#3c4043",fontWeight:500,marginTop:2}}>{t.v}{t.sub&&<span style={{fontSize:11,color:"#9aa0a6"}}> ({t.sub})</span>}</div></div>)}
          </div>}
          {/* Contacts */}
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            {job.tenantName&&<a href={`tel:${job.tenantPhone?.replace(/\s/g,"")}`} style={{fontSize:12,color:"#1a73e8",textDecoration:"none",background:"#e8f0fe",border:"1px solid #c5d8fb",borderRadius:20,padding:"6px 14px",display:"inline-flex",alignItems:"center",gap:5}}>📞 {job.tenantName}{job.tenantNumber?` #${job.tenantNumber}`:""} — {job.tenantPhone}</a>}
            {job.agentName&&<a href={`tel:${job.agentPhone?.replace(/\s/g,"")}`} style={{fontSize:12,color:"#188038",textDecoration:"none",background:"#e6f4ea",border:"1px solid #ceead6",borderRadius:20,padding:"6px 14px",display:"inline-flex",alignItems:"center",gap:5}}>🏢 {job.agentName} — {job.agentPhone}</a>}
          </div>
          {/* Work order */}
          {job.workOrder&&<div style={{marginBottom:14}}>
            <button onClick={()=>setShowWO(!showWO)} style={{background:"#f8f9fa",border:"1px solid #e8eaed",color:"#3c4043",padding:"8px 14px",fontSize:12,fontWeight:500,cursor:"pointer",borderRadius:8,display:"flex",alignItems:"center",gap:8,width:"100%",fontFamily:F}}>
              {showWO?"▲":"▼"} Work Order — {job.workOrder.agency}
              {job.workOrder.spendLimit&&<span style={{color:"#c62828",fontWeight:700,marginLeft:4}}>{job.workOrder.spendLimit}</span>}
              {job.workOrder.hasPhotos&&<span>📷</span>}
              {job.workOrder.url&&<a href={job.workOrder.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{marginLeft:"auto",fontSize:11,color:"#1a73e8",background:"#e8f0fe",border:"1px solid #c5d8fb",borderRadius:12,padding:"2px 10px",textDecoration:"none",fontWeight:600}}>View PDF</a>}
            </button>
            {showWO&&<div style={{background:"#f8f9fa",border:"1px solid #e8eaed",borderRadius:8,padding:"14px",marginTop:6}}>
              <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:10,fontSize:12}}>
                {job.workOrder.keyNumber&&<div><div style={{fontSize:10,fontWeight:600,color:"#80868b",textTransform:"uppercase",marginBottom:2}}>Key</div><span style={{color:"#e65100",fontWeight:700,fontSize:14}}>#{job.workOrder.keyNumber}</span></div>}
                {job.workOrder.spendLimit&&<div><div style={{fontSize:10,fontWeight:600,color:"#80868b",textTransform:"uppercase",marginBottom:2}}>Spend Limit</div><span style={{color:"#c62828",fontWeight:700,fontSize:14}}>{job.workOrder.spendLimit}</span></div>}
              </div>
              <div style={{fontSize:13,color:"#3c4043",lineHeight:1.6}}>{job.workOrder.instructions}</div>
            </div>}
          </div>}
          {/* Directive gate */}
          {showDir&&<div style={{background:"#e6f4ea",border:"1px solid #81c995",borderRadius:8,padding:16,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:"#137333",marginBottom:10}}>📋 Work Directives — Read Before Commencing</div>
            {job.workOrder?.keyNumber&&<div style={{fontSize:13,marginBottom:6}}>Key: <span style={{color:"#e65100",fontWeight:700}}>#{job.workOrder.keyNumber}</span></div>}
            {job.workOrder?.spendLimit&&<div style={{fontSize:13,marginBottom:8}}>Spend limit: <span style={{color:"#c62828",fontWeight:700}}>{job.workOrder.spendLimit}</span></div>}
            <div style={{fontSize:13,color:"#1e4620",lineHeight:1.7,background:"rgba(255,255,255,0.7)",border:"1px solid #81c995",borderRadius:6,padding:"10px 12px",marginBottom:12}}>{job.workOrder?.instructions||job.notes}</div>
            <div onClick={()=>setDirRead(!dirRead)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:14,userSelect:"none"}}>
              <div style={{width:20,height:20,border:`2px solid ${dirRead?"#137333":"#81c995"}`,background:dirRead?"#137333":"transparent",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                {dirRead&&<span style={{color:"#fff",fontSize:13,fontWeight:700}}>✓</span>}
              </div>
              <span style={{fontSize:13,color:dirRead?"#137333":"#3c4043",fontWeight:dirRead?600:400}}>I have read and understood the work directives</span>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowDir(false)} style={{background:"transparent",border:"1px solid #dadce0",color:"#5f6368",padding:"9px 16px",fontSize:13,cursor:"pointer",borderRadius:6,fontFamily:F}}>Back</button>
              <button onClick={handleComm} disabled={!dirRead} style={{flex:1,background:dirRead?"#137333":"#e0e0e0",border:"none",color:dirRead?"#fff":"#9aa0a6",padding:"9px 0",fontSize:13,fontWeight:600,cursor:dirRead?"pointer":"not-allowed",borderRadius:6,fontFamily:F}}>✓ Commence Job</button>
            </div>
          </div>}
          {/* Materials */}
          {showM&&!showDir&&<div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"#5f6368",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Materials Used</div>
            <div style={{background:"#fff",border:"1px solid #e8eaed",borderRadius:8,overflow:"hidden"}}>
              {getM(job.jobType).map((m,i,arr)=>{
                const sv=ms[m.id]||{used:false,qty:0,length:"450"};
                const tog=()=>{if(m.type==="hose")updM(m.id,{used:!sv.used,length:sv.length||"450"});else updM(m.id,{used:!sv.used,qty:sv.used?0:1});};
                return<div key={m.id} style={{borderBottom:i<arr.length-1?"1px solid #f1f3f4":"none",padding:"9px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",background:sv.used?"#e6f4ea":"transparent"}}>
                  <div onClick={tog} style={{width:18,height:18,border:`2px solid ${sv.used?"#137333":"#dadce0"}`,background:sv.used?"#137333":"transparent",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"all 0.15s"}}>
                    {sv.used&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>✓</span>}
                  </div>
                  <div onClick={tog} style={{flex:1,fontSize:13,color:sv.used?"#137333":"#3c4043",cursor:"pointer",lineHeight:1.3,fontWeight:sv.used?500:400}}>{m.name}</div>
                  {sv.used&&m.type==="qty"&&<div style={{display:"flex",alignItems:"center",border:"1px solid #dadce0",borderRadius:6,overflow:"hidden"}}>
                    <button onClick={()=>{const q=Math.max(0,(ms[m.id]?.qty||0)-1);updM(m.id,{...ms[m.id],qty:q,used:q>0});}} style={{background:"#f8f9fa",border:"none",color:"#5f6368",width:30,height:30,fontSize:16,cursor:"pointer",fontFamily:F}}>−</button>
                    <span style={{color:"#202124",fontSize:13,fontWeight:600,minWidth:26,textAlign:"center"}}>{sv.qty}</span>
                    <button onClick={()=>updM(m.id,{...ms[m.id],qty:(ms[m.id]?.qty||0)+1,used:true})} style={{background:"#f8f9fa",border:"none",color:"#5f6368",width:30,height:30,fontSize:16,cursor:"pointer",fontFamily:F}}>+</button>
                  </div>}
                  {sv.used&&m.type==="quarter"&&<div style={{display:"flex",gap:4}}>{ql.map((l,idx)=><button key={idx} onClick={()=>updM(m.id,{...ms[m.id],qty:idx,used:idx>0})} style={{background:sv.qty===idx?"#1a73e8":"#f1f3f4",border:"none",color:sv.qty===idx?"#fff":"#5f6368",padding:"4px 10px",fontSize:12,fontWeight:600,cursor:"pointer",borderRadius:4,fontFamily:F}}>{l}</button>)}</div>}
                  {sv.used&&m.type==="hose"&&<div style={{display:"flex",gap:4}}>{["300","450","600"].map(ln=><button key={ln} onClick={()=>updM(m.id,{...ms[m.id],length:ln,used:true})} style={{background:sv.length===ln?"#1a73e8":"#f1f3f4",border:"none",color:sv.length===ln?"#fff":"#5f6368",padding:"4px 10px",fontSize:12,fontWeight:600,cursor:"pointer",borderRadius:4,fontFamily:F}}>{ln}</button>)}</div>}
                </div>;
              })}
              <div style={{padding:"10px 14px",borderTop:"1px solid #f1f3f4",background:"#fafafa"}}>
                <input placeholder="Add other item..." style={{width:"100%",border:"none",borderBottom:"1px solid #e0e0e0",color:"#5f6368",fontSize:12,padding:"3px 0",outline:"none",boxSizing:"border-box",fontFamily:F,background:"transparent"}} onKeyDown={e=>{if(e.key==="Enter"&&e.target.value.trim()){updM("__c",e.target.value.trim());e.target.value="";}}}/>
              </div>
            </div>
          </div>}
          {/* Notes */}
          {showM&&!showDir&&<div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"#5f6368",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Job Notes</div>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} style={{width:"100%",minHeight:80,background:"#f8f9fa",border:"1px solid #e8eaed",borderRadius:8,color:"#3c4043",fontFamily:F,fontSize:13,lineHeight:1.6,padding:"10px 12px",resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
            <button onClick={genStory} disabled={gen} style={{marginTop:8,background:gen?"#f1f3f4":"#1a73e8",border:"none",color:gen?"#9aa0a6":"#fff",padding:"8px 18px",fontSize:12,fontWeight:600,cursor:gen?"not-allowed":"pointer",borderRadius:20,fontFamily:F}}>{gen?"Generating...":"⚡ Generate Invoice Story"}</button>
          </div>}
          {/* Story */}
          {story&&<div style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:"#5f6368",textTransform:"uppercase",letterSpacing:"0.05em"}}>Invoice Draft {edited&&<span style={{color:"#f9ab00",fontSize:10,fontWeight:600}}>· edited</span>}</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={genStory} style={{background:"transparent",border:"1px solid #e0e0e0",color:"#5f6368",padding:"4px 12px",fontSize:11,fontWeight:500,cursor:"pointer",borderRadius:12,fontFamily:F}}>↺ Regenerate</button>
                <button onClick={()=>{navigator.clipboard.writeText(story);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:copied?"#e6f4ea":"#e8f0fe",border:`1px solid ${copied?"#81c995":"#c5d8fb"}`,color:copied?"#137333":"#1a73e8",padding:"4px 12px",fontSize:11,fontWeight:600,cursor:"pointer",borderRadius:12,fontFamily:F}}>{copied?"Copied ✓":"Copy"}</button>
              </div>
            </div>
            <textarea value={story} onChange={e=>{setStory(e.target.value);setEdited(true);}} style={{width:"100%",minHeight:140,background:"#f8f9fa",border:"1px solid #e8eaed",borderRadius:8,color:"#3c4043",fontFamily:mono||F,fontSize:12,lineHeight:1.75,padding:"12px 14px",resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
            {flags.length>0&&<div style={{marginTop:8,background:"#fef7e0",border:"1px solid #f9ab00",borderRadius:8,padding:"12px 14px"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#e37400",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>⚠ Review Before Sending</div>
              {flags.map((f,i)=><div key={i} style={{fontSize:12,color:"#b06000",lineHeight:1.6,marginBottom:i<flags.length-1?6:0,display:"flex",gap:8}}><span style={{color:"#f9ab00",flexShrink:0}}>—</span><span>{f}</span></div>)}
            </div>}
          </div>}
          {/* Further action */}
          {showComp&&<div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"#5f6368",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Further Action Required?</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {["None","Quote Required","Follow-up","Return Visit","Referral"].map(opt=><button key={opt} onClick={()=>setFa(opt)} style={{background:fa===opt?"#ea4335":"#f1f3f4",border:"none",color:fa===opt?"#fff":"#5f6368",padding:"7px 16px",fontSize:12,fontWeight:600,cursor:"pointer",borderRadius:20,fontFamily:F}}>{opt}</button>)}
            </div>
          </div>}
          {/* Next job */}
          {showNext&&nj&&<div style={{background:"#e8f0fe",border:"1px solid #c5d8fb",borderRadius:8,padding:16,marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"#1a73e8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Next Job</div>
            <div style={{fontSize:14,color:"#202124",fontWeight:600,marginBottom:3}}>{nj.address}</div>
            <div style={{fontSize:12,color:"#5f6368",marginBottom:12}}>{nj.timeStart}–{nj.timeEnd} · {nj.jobType}</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={handleNT} style={{flex:1,background:"#1a73e8",border:"none",color:"#fff",padding:"10px 0",fontSize:13,fontWeight:600,cursor:"pointer",borderRadius:6,fontFamily:F}}>🚗 Start Travel Now</button>
              <button onClick={()=>{setShowNext(false);onClose();}} style={{background:"transparent",border:"1px solid #c5d8fb",color:"#1a73e8",padding:"10px 16px",fontSize:12,cursor:"pointer",borderRadius:6,fontFamily:F}}>Later</button>
            </div>
          </div>}
          {/* Action log */}
          {job.actionLog?.length>0&&<div style={{borderTop:"1px solid #e8eaed",paddingTop:12,marginTop:8}}>
            <div style={{fontSize:11,fontWeight:700,color:"#9aa0a6",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Action Log</div>
            {job.actionLog.map((e,i)=><div key={i} style={{fontSize:12,color:"#80868b",marginBottom:5,display:"flex",gap:12}}><span style={{color:"#9aa0a6",flexShrink:0,fontFamily:mono}}>{e.time}</span><span style={{color:"#9aa0a6",flexShrink:0}}>{e.actor}</span><span style={{color:"#5f6368"}}>{e.action}</span></div>)}
          </div>}
        </div>
        {/* Action bar */}
        {!showDir&&!showNext&&<div style={{borderTop:"1px solid #e8eaed",padding:"14px 20px",background:"#f8f9fa",flexShrink:0,display:"flex",gap:10,flexWrap:"wrap"}}>
          {job.status==="pending"&&<Btn bg="#f9ab00" col="#fff" txt="🚗 Start Job" onClick={handleStart}/>}
          {job.status==="travelling"&&<Btn bg="#34a853" col="#fff" txt="📍 Arrived on Site" onClick={handleArr}/>}
          {job.status==="arrived"&&!showDir&&<Btn bg="#1a73e8" col="#fff" txt="📋 Read Directives & Commence" onClick={()=>setShowDir(true)}/>}
          {job.status==="in-progress"&&!showComp&&<Btn bg="#34a853" col="#fff" txt="✓ Complete Job" onClick={()=>setShowComp(true)}/>}
          {showComp&&<Btn bg="#34a853" col="#fff" txt="Confirm Complete" onClick={handleComp} dis={!fa}/>}
          {job.status==="ready-to-invoice"&&<div style={{flex:1,textAlign:"center",fontSize:13,color:"#1a73e8",fontWeight:600,padding:"12px 0"}}>✓ Flagged for Invoicing</div>}
          {job.status==="late-alert"&&<Btn bg="#ea4335" col="#fff" txt="⚠ Contact Tenant Now" onClick={()=>{}}/>}
        </div>}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App(){
  const [schedJobs,setSchedJobs]=useState(SCHED_JOBS);
  const [poolJobs,setPoolJobs]=useState(POOL_JOBS);
  const [view,setView]=useState("board");
  const [myP,setMyP]=useState("Richie");
  const [sel,setSel]=useState(null);
  const [schedModal,setSchedModal]=useState(null);
  const [now,setNow]=useState(tn());
  const checked=useRef(new Set());
  useEffect(()=>{
    rno();
    const t=setInterval(()=>{const n=tn();setNow(n);const nm=pt(n);setJobs(prev=>prev.map(j=>{if(j.status!=="pending"||checked.current.has(j.id))return j;if(nm>=pt(j.timeEnd)-30){checked.current.add(j.id);sno("Viva Jobs","Action required: "+j.address);return{...j,status:"late-alert"};}return j;}));},15000);
    return()=>clearInterval(t);
  },[]);
  const setJobs=f=>setSchedJobs(f);
  const updJob=(id,u)=>{setSchedJobs(p=>p.map(j=>j.id===id?{...j,...u}:j));setSel(p=>p?.id===id?{...p,...u}:p);};
  const handleSchedule=(job)=>setSchedModal(job);
  const confirmSchedule=(newJob)=>{setSchedJobs(p=>[...p,newJob]);setPoolJobs(p=>p.filter(j=>j.id!==newJob.id.replace("ev_"+Date.now(),"").replace("ev_","p_")));setSchedModal(null);};
  const cnt={act:schedJobs.filter(j=>["travelling","arrived","in-progress"].includes(j.status)).length,late:schedJobs.filter(j=>j.status==="late-alert").length,inv:schedJobs.filter(j=>j.status==="ready-to-invoice").length};
  const today=new Date().toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"});
  return(
    <div style={{minHeight:"100vh",background:"#f8f9fa",fontFamily:F,color:"#202124"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <style>{`::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:#f1f3f4}::-webkit-scrollbar-thumb{background:#dadce0;border-radius:3px}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      {sel&&<Drawer job={sel} allJobs={schedJobs} onClose={()=>setSel(null)} onUpdate={updJob}/>}
      {schedModal&&<ScheduleModal job={schedModal} onConfirm={confirmSchedule} onClose={()=>setSchedModal(null)}/>}
      {/* Header */}
      <div style={{background:"#fff",borderBottom:"1px solid #e8eaed",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:28,height:28,background:"#e05a2b",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:13,fontWeight:800}}>V</span></div>
            <span style={{fontSize:16,fontWeight:700,color:"#202124"}}>Viva Jobs</span>
          </div>
          <span style={{fontSize:12,color:"#9aa0a6",paddingLeft:4}}>{today}</span>
        </div>
        <div style={{display:"flex",gap:16,fontSize:12,alignItems:"center"}}>
          <span style={{color:"#9aa0a6",fontFamily:mono}}>{now}</span>
          {cnt.late>0&&<span style={{color:"#ea4335",fontWeight:700,animation:"pulse 1.5s infinite"}}>⚠ {cnt.late} late</span>}
          {cnt.act>0&&<span style={{color:"#e37400",fontWeight:600}}>{cnt.act} active</span>}
          {cnt.inv>0&&<span style={{color:"#1a73e8",fontWeight:600}}>{cnt.inv} to invoice</span>}
          <span style={{background:"#fce8b2",color:"#b06000",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:12}}>{poolJobs.length} in pool</span>
        </div>
      </div>
      {/* Nav */}
      <div style={{background:"#fff",borderBottom:"1px solid #e8eaed",padding:"0 24px",display:"flex",alignItems:"center"}}>
        {[{k:"board",l:"▦  Schedule Board"},{k:"myjobs",l:"☰  My Jobs"},{k:"pool",l:"📋  Job Pool"}].map(({k,l})=>(
          <button key={k} onClick={()=>setView(k)} style={{background:"transparent",border:"none",borderBottom:`3px solid ${view===k?"#1a73e8":"transparent"}`,color:view===k?"#1a73e8":"#5f6368",padding:"14px 18px",fontSize:13,fontWeight:view===k?700:500,cursor:"pointer",fontFamily:F,transition:"all 0.15s",marginBottom:-1}}>{l}</button>
        ))}
        {view==="myjobs"&&<div style={{marginLeft:"auto",display:"flex",gap:6,padding:"8px 0"}}>
          {TEAM.map(p=>{const c=PC[p];return<button key={p} onClick={()=>setMyP(p)} style={{background:myP===p?c.dot:"#f1f3f4",color:myP===p?"#fff":c.text,border:"none",borderRadius:20,padding:"6px 16px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>{p}</button>;})}
        </div>}
      </div>
      {/* Content */}
      <div style={{padding:"20px 24px",maxWidth:1400,margin:"0 auto"}}>
        {view==="board"&&<Board jobs={schedJobs} onSelect={setSel}/>}
        {view==="myjobs"&&<MyJobs jobs={schedJobs} plumber={myP} onSelect={setSel}/>}
        {view==="pool"&&<JobPool poolJobs={poolJobs} onSchedule={handleSchedule}/>}
      </div>
    </div>
  );
}
