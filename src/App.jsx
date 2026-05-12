import React, { useState, useEffect, useRef } from "react";

const PLUMBERS = ["All", "Richie", "Mingo", "Harry", "Chris", "Nick"];

// ── Materials library per job type ────────────────────────────────────────
const MATERIALS = {
  "Toilet": [
    { id:"t1",  name:"Fluidmaster Inlet Valve — Bottom Entry",       type:"qty",     default:0 },
    { id:"t2",  name:"Fluidmaster Inlet Valve — Side Entry 15mm",    type:"qty",     default:0 },
    { id:"t3",  name:"Caroma Outlet Valve Seal — Red",               type:"qty",     default:0 },
    { id:"t4",  name:"Caroma Outlet Valve Seal — Grey",              type:"qty",     default:0 },
    { id:"t5",  name:"Geberit Outlet Valve Seal",                    type:"qty",     default:0 },
    { id:"t6",  name:"Keeseal",                                      type:"qty",     default:0 },
    { id:"t7",  name:"Pan Cone Seal — Double Skirt",                 type:"qty",     default:0 },
    { id:"t8",  name:"Pan Collar Rubber",                            type:"qty",     default:0 },
    { id:"t9",  name:"Pan Collar",                                   type:"qty",     default:0 },
    { id:"t10", name:"Polymer Sealant",                              type:"quarter", default:0 },
    { id:"t11", name:"Braided Flexible Supply Hose",                 type:"hose",    default:"450" },
    { id:"t12", name:"Toilet Seat — Caroma Tasman",                  type:"qty",     default:0 },
    { id:"t13", name:"Toilet Seat — Posh Dominique Soft Close",      type:"qty",     default:0 },
    { id:"t14", name:"Sundries — Rags",                              type:"qty",     default:0 },
  ],
  "Tap Service": [
    { id:"tp1", name:"Tap Washer Kit (jumper valves, O-rings, lubricant)", type:"qty",     default:0 },
    { id:"tp2", name:"Polymer Sealant",                              type:"quarter", default:0 },
    { id:"tp3", name:"Wall Top Taps Cross Handle — Jumper Valve",    type:"qty",     default:0 },
    { id:"tp4", name:"Wall Top Taps Cross Handle — Ceramic Disc",    type:"qty",     default:0 },
    { id:"tp5", name:"Thread Tape PTFE",                             type:"quarter", default:0 },
    { id:"tp6", name:"All Directional Shower Rose",                  type:"qty",     default:0 },
    { id:"tp7", name:"Shower Hose — Metal",                          type:"qty",     default:0 },
  ],
  "Flexi Hose / Health Check": [
    { id:"f1",  name:"Braided Flexible Supply Hose",                 type:"hose",    default:"450" },
    { id:"f2",  name:"Polymer Sealant",                              type:"quarter", default:0 },
    { id:"f3",  name:"Thread Tape PTFE",                             type:"quarter", default:0 },
    { id:"f4",  name:"Tap Washer Kit",                               type:"qty",     default:0 },
    { id:"f5",  name:"Sundries — Rags",                              type:"qty",     default:0 },
  ],
  "Blocked Drain": [
    { id:"d1",  name:"Drain Cleaner / Treatment",                    type:"qty",     default:0 },
    { id:"d2",  name:"Rubber Gloves",                                type:"qty",     default:0 },
    { id:"d3",  name:"Sundries — Rags",                              type:"qty",     default:0 },
  ],
  "Hot Water": [
    { id:"hw1", name:"Thread Tape PTFE",                             type:"quarter", default:0 },
    { id:"hw2", name:"Polymer Sealant",                              type:"quarter", default:0 },
    { id:"hw3", name:"Braided Flexible Supply Hose",                 type:"hose",    default:"450" },
    { id:"hw4", name:"Sundries — Rags",                              type:"qty",     default:0 },
  ],
};

const GENERIC_MATERIALS = [
  { id:"g1",  name:"Polymer Sealant",        type:"quarter", default:0 },
  { id:"g2",  name:"Thread Tape PTFE",       type:"quarter", default:0 },
  { id:"g3",  name:"Braided Flexible Supply Hose", type:"hose", default:"450" },
  { id:"g4",  name:"Sundries — Rags",        type:"qty",     default:0 },
];

function getMaterials(jobType) {
  return MATERIALS[jobType] || GENERIC_MATERIALS;
}

function initMaterialState(jobType) {
  const list = getMaterials(jobType);
  const state = {};
  list.forEach(m => {
    if (m.type === "qty")     state[m.id] = { used: false, qty: 0 };
    if (m.type === "quarter") state[m.id] = { used: false, qty: 0 }; // 0=0, 1=¼, 2=½, 3=¾, 4=1
    if (m.type === "hose")    state[m.id] = { used: false, length: m.default };
  });
  return state;
}

function materialsToText(jobType, matState) {
  const list = getMaterials(jobType);
  const lines = [];
  list.forEach(m => {
    const s = matState[m.id];
    if (!s || !s.used) return;
    if (m.type === "qty")     lines.push(`${m.name} × ${s.qty}`);
    if (m.type === "quarter") { const labels=["0","¼","½","¾","1"]; lines.push(`${m.name} × ${labels[s.qty]}`); }
    if (m.type === "hose")    lines.push(`${m.name} — ${s.length}mm`);
  });
  return lines.join("\n");
}

// ── Mock jobs ─────────────────────────────────────────────────────────────
const MOCK_JOBS = [
  {
    id:"ev001", address:"704/1 Kingsmill Street, Chermside QLD 4051",
    timeStart:"08:30", timeEnd:"10:30", assignee:"Mingo", ivNumber:"IV-43216", jobType:"Toilet",
    notes:"Toilet leaking when flushed.",
    status:"pending", departedAt:null, arrivedAt:null, commencedAt:null, completedAt:null,
    tenantNumber:null, tenantName:"James Hargreaves", tenantPhone:"0412 345 678",
    agentName:"Samantha Price", agentPhone:"07 3123 4567",
    workOrder:{ agency:"Ray White Chermside", keyNumber:"841", spendLimit:"$250",
      instructions:"Toilet in main bathroom is leaking at the base when flushed. Please investigate and repair. Check all other fixtures while on site and report any issues. Do not exceed spend limit without written authorisation.",
      hasPhotos:false, url:null },
    story:"", actionLog:[], furtherAction:"", newArrivalTime:"",
  },
  {
    id:"ev002", address:"19 Yates Ave, Ashgrove QLD 4060",
    timeStart:"11:30", timeEnd:"13:30", assignee:"Chris", ivNumber:"IV-43194", jobType:"Flexi Hose / Health Check",
    notes:"Bathroom flexi hose and do a plumbing health check to ensure all taps, fittings and pipes are in good condition.",
    status:"pending", departedAt:null, arrivedAt:null, commencedAt:null, completedAt:null,
    tenantNumber:2, tenantName:"Lauren Potter", tenantPhone:"0413 268 174",
    agentName:"Kristy Van Den Elst", agentPhone:"07 3871 1420",
    workOrder:{ agency:"Plum Property", keyNumber:"642", spendLimit:null,
      instructions:"Flexi hose under bathroom sink requires replacing. Please attend to replace and also do a plumbing health check to ensure all taps, fittings and pipes are in good condition. Repair any issues while there.",
      hasPhotos:true, url:"https://drive.google.com/file/d/example/view" },
    story:"", actionLog:[], furtherAction:"", newArrivalTime:"",
  },
  {
    id:"ev003", address:"12 Latrobe Tce, Paddington QLD 4064",
    timeStart:"09:00", timeEnd:"11:00", assignee:"Richie", ivNumber:"IV-43201", jobType:"Hot Water",
    notes:"No hot water. Rheem 250L electric storage. Unit approx 12 years old.",
    status:"travelling", departedAt:"08:48", arrivedAt:null, commencedAt:null, completedAt:null,
    tenantNumber:1, tenantName:"Sarah Mitchell", tenantPhone:"0421 987 654",
    agentName:"Tom Reeves", agentPhone:"07 3300 1122",
    workOrder:{ agency:"LJ Hooker Paddington", keyNumber:null, spendLimit:"$500",
      instructions:"Tenant reports no hot water. Hot water unit electric storage approx 12 years old. Investigate and advise. If replacement required, quote separately and obtain approval before proceeding.",
      hasPhotos:false, url:"https://drive.google.com/file/d/example2/view" },
    story:"", actionLog:[{time:"08:48",actor:"Richie",action:"Departed for job"}], furtherAction:"", newArrivalTime:"",
  },
  {
    id:"ev004", address:"8 Swann Rd, Taringa QLD 4068",
    timeStart:"07:30", timeEnd:"09:00", assignee:"Nick", ivNumber:"IV-43188", jobType:"Blocked Drain",
    notes:"Kitchen sink blocked. Used 100mm eel, 3 cables. Grease and food debris retrieved.",
    status:"ready-to-invoice", departedAt:"07:22", arrivedAt:"07:38", commencedAt:"07:41", completedAt:"08:52",
    tenantNumber:null, tenantName:"Tom Bassett", tenantPhone:"0408 111 222",
    agentName:"Brooke Lawson", agentPhone:"07 3870 5500",
    workOrder:{ agency:"Place Estate Agents", keyNumber:null, spendLimit:"$300",
      instructions:"Kitchen sink blocked and not draining. Please clear blockage and investigate cause.",
      hasPhotos:false, url:"https://drive.google.com/file/d/example3/view" },
    story:"Called out to investigate a blocked kitchen sink drain at the property. On arrival, the kitchen sink had ceased to drain entirely. The inspection opening was rodded with the 100mm retriever head, engaging the obstruction at approximately 13.65 metres. Consecutive passes were made with the 100mm cutting head to restore the full diameter of the drain. Grease and food debris were retrieved from the line. The drain was flushed and tested, confirming a clear and free-flowing result.",
    actionLog:[
      {time:"07:22",actor:"Nick",action:"Departed for job"},
      {time:"07:38",actor:"Nick",action:"Arrived on site — travel time 16 min"},
      {time:"07:41",actor:"Nick",action:"Work commenced"},
      {time:"08:52",actor:"Nick",action:"Job completed — on tools 1h 11min — Further action: None"},
    ],
    furtherAction:"None", newArrivalTime:"",
  },
];

const STATUS = {
  pending:            { label:"Pending",          color:"#555",    dot:"#444" },
  travelling:         { label:"Travelling",        color:"#a07830", dot:"#c89040" },
  arrived:            { label:"Arrived",           color:"#7a9a50", dot:"#9aba60" },
  "in-progress":      { label:"In Progress",       color:"#e8a020", dot:"#e8a020" },
  "late-alert":       { label:"Action Required",   color:"#e05a2b", dot:"#e05a2b" },
  "ready-to-invoice": { label:"Ready to Invoice",  color:"#4a9eff", dot:"#4a9eff" },
  complete:           { label:"Complete",           color:"#3ab56e", dot:"#3ab56e" },
};

const INVOICE_PROMPT = `You are a plumbing documentation assistant for Viva Plumbing, Brisbane. Convert rough plumber notes into a clean invoice description, then review it.

INVOICE RULES:
- Open with "Called out to investigate..."
- Structure: findings > works carried out > outcome > recommendations
- Completed work in past tense; recommendations in present tense ("It is recommended that...")
- No first-person, no dot points, no fluff, no pipe sizes
- "Braided supply hose" -> "premium PEX core braided supply hoses"
- "corroded" not "rusty"; "Rodded" not "sent" for eel
- Cables = 4.55m each
- Eel: "Rodded the inspection opening with the [size] retriever head, engaging the obstruction at approximately [X] metres. Made consecutive passes with the [size] cutting head to restore the full diameter of the drain."
- Clean prose only, no headers, no bold

FIXTURE LOCATION RULE:
Fixture location must be specified for: shower, toilet, basin/vanity, bath. Not required for kitchen or laundry. If notes reference one of these fixtures without specifying location (e.g. "main bathroom", "ensuite", "upstairs"), flag it.

WORK ORDER COMPARISON:
Compare the draft against the agency instructions. Flag any items requested in the work order that are not addressed in the draft.

OUTPUT FORMAT - respond only with valid JSON, no markdown, no preamble:
{"draft": "the full invoice description as clean prose", "flags": ["flag 1", "flag 2"]}

flags is an array of short plain-text review notes. Empty array [] if nothing to flag. Each flag is one sentence. Do not put flags inside the draft.`

function timeNow() { const d=new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; }
function parseTime(t) { const [h,m]=t.split(":").map(Number); return h*60+m; }
function timeDiff(a,b) { const diff=parseTime(b)-parseTime(a); if(diff<=0)return null; const h=Math.floor(diff/60),m=diff%60; return h>0?`${h}h ${m}m`:`${m} min`; }
function safeNotify(title,body) { try{ if(typeof window!=="undefined"&&"Notification"in window&&window.Notification.permission==="granted") new window.Notification(title,{body}); }catch(e){} }
function requestNotifyPermission() { try{ if(typeof window!=="undefined"&&"Notification"in window&&window.Notification.permission==="default") window.Notification.requestPermission(); }catch(e){} }

function Dot({status}) {
  const c=STATUS[status]?.dot||"#444";
  const glow=status==="in-progress"?`0 0 7px ${c}`:status==="late-alert"?`0 0 10px ${c}`:status==="travelling"?`0 0 5px ${c}`:"none";
  return <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:c,marginRight:7,flexShrink:0,boxShadow:glow}}/>;
}

// ── Materials Checklist ───────────────────────────────────────────────────
function MaterialsChecklist({ jobType, matState, onChange }) {
  const list = getMaterials(jobType);
  const quarterLabels = ["0","¼","½","¾","1"];

  const toggle = (id, m) => {
    const cur = matState[id];
    if (m.type==="qty")     onChange(id, { used:!cur.used, qty:cur.used?0:1 });
    if (m.type==="quarter") onChange(id, { used:!cur.used, qty:cur.used?0:1 });
    if (m.type==="hose")    onChange(id, { used:!cur.used, length:cur.length||"450" });
  };

  const setQty = (id, delta) => {
    const cur = matState[id];
    const next = Math.max(0, (cur.qty||0)+delta);
    onChange(id, { ...cur, qty:next, used:next>0 });
  };

  const setQuarter = (id, val) => {
    onChange(id, { ...matState[id], qty:val, used:val>0 });
  };

  const setHoseLength = (id, length) => {
    onChange(id, { ...matState[id], length, used:true });
  };

  return (
    <div style={{ marginTop:12, marginBottom:4 }}>
      <div style={{ fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:"#333", marginBottom:10 }}>Materials Used</div>
      <div style={{ background:"#0d0d0d", border:"1px solid #1e1e1e" }}>
        {list.map((m, i) => {
          const s = matState[m.id] || { used:false, qty:0, length:"450" };
          return (
            <div key={m.id} style={{ borderBottom:i<list.length-1?"1px solid #141414":"none", padding:"10px 12px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", background:s.used?"#0f1a0f":"transparent", transition:"background 0.15s" }}>

              {/* Checkbox */}
              <div onClick={()=>toggle(m.id,m)} style={{ width:16, height:16, border:`1px solid ${s.used?"#3ab56e":"#2a2a2a"}`, background:s.used?"#3ab56e":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer", transition:"all 0.15s" }}>
                {s.used && <span style={{color:"#000",fontSize:10,fontWeight:700,lineHeight:1}}>✓</span>}
              </div>

              {/* Name */}
              <div onClick={()=>toggle(m.id,m)} style={{ flex:1, fontSize:12, color:s.used?"#8aba6a":"#444", cursor:"pointer", lineHeight:1.3 }}>{m.name}</div>

              {/* Controls — only show when used */}
              {s.used && m.type==="qty" && (
                <div style={{ display:"flex", alignItems:"center", gap:0, border:"1px solid #2a3a2a" }}>
                  <button onClick={()=>setQty(m.id,-1)} style={{ background:"#141414", border:"none", color:"#5a8a5a", width:28, height:28, fontSize:14, cursor:"pointer", fontFamily:"'DM Mono',monospace", display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                  <span style={{ color:"#8aba6a", fontSize:12, minWidth:24, textAlign:"center", fontFamily:"'DM Mono',monospace" }}>{s.qty}</span>
                  <button onClick={()=>setQty(m.id,1)} style={{ background:"#141414", border:"none", color:"#5a8a5a", width:28, height:28, fontSize:14, cursor:"pointer", fontFamily:"'DM Mono',monospace", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                </div>
              )}

              {s.used && m.type==="quarter" && (
                <div style={{ display:"flex", gap:4 }}>
                  {quarterLabels.map((l,idx)=>(
                    <button key={idx} onClick={()=>setQuarter(m.id,idx)}
                      style={{ background:s.qty===idx?"#3ab56e":"#141414", border:`1px solid ${s.qty===idx?"#3ab56e":"#222"}`, color:s.qty===idx?"#000":"#444", padding:"3px 7px", fontSize:10, fontFamily:"'DM Mono',monospace", cursor:"pointer" }}>
                      {l}
                    </button>
                  ))}
                </div>
              )}

              {s.used && m.type==="hose" && (
                <div style={{ display:"flex", gap:4 }}>
                  {["300","450","600"].map(len=>(
                    <button key={len} onClick={()=>setHoseLength(m.id,len)}
                      style={{ background:s.length===len?"#3ab56e":"#141414", border:`1px solid ${s.length===len?"#3ab56e":"#222"}`, color:s.length===len?"#000":"#444", padding:"3px 9px", fontSize:10, fontFamily:"'DM Mono',monospace", cursor:"pointer" }}>
                      {len}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Custom material field */}
        <div style={{ padding:"10px 12px", borderTop:"1px solid #141414" }}>
          <div style={{ fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:"#2a2a2a", marginBottom:6 }}>Other (not listed)</div>
          <input placeholder="Add item manually…"
            style={{ width:"100%", background:"transparent", border:"none", borderBottom:"1px solid #222", color:"#666", fontSize:12, fontFamily:"'DM Mono',monospace", padding:"4px 0", outline:"none", boxSizing:"border-box" }}
            onKeyDown={e=>{ if(e.key==="Enter"&&e.target.value.trim()) { onChange("__custom__", e.target.value.trim()); e.target.value=""; } }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Work Directive Gate ───────────────────────────────────────────────────
function WorkDirectiveGate({ job, onConfirm, onBack }) {
  const [read, setRead] = useState(false);
  return (
    <div style={{ background:"#0f1a0f", border:"1px solid #2a4a2a", padding:16, marginTop:12, fontFamily:"'DM Mono',monospace" }}>
      <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#4a8a4a", marginBottom:10 }}>📋 Work Directives — Read Before Commencing</div>
      <div style={{ display:"flex", gap:16, marginBottom:12, flexWrap:"wrap" }}>
        {job.workOrder?.keyNumber && <div style={{fontSize:11}}><span style={{color:"#2a3a2a",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase"}}>Key </span><span style={{color:"#e8a020"}}>#{job.workOrder.keyNumber}</span></div>}
        {job.workOrder?.spendLimit && <div style={{fontSize:11}}><span style={{color:"#2a3a2a",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase"}}>Spend limit </span><span style={{color:"#e05a2b",fontWeight:600}}>{job.workOrder.spendLimit}</span></div>}
        {job.workOrder?.agency && <div style={{fontSize:11,color:"#3a5a3a"}}>{job.workOrder.agency}</div>}
      </div>
      <div style={{ fontSize:12, color:"#5a8a5a", lineHeight:1.8, background:"#0a140a", border:"1px solid #1a2a1a", padding:"12px 14px", marginBottom:14 }}>
        {job.workOrder?.instructions || job.notes}
      </div>
      {job.tenantName && (
        <div style={{ fontSize:11, color:"#3a5a3a", marginBottom:14, padding:"8px 12px", background:"#0a140a", border:"1px solid #151e15" }}>
          Contact tenant{job.tenantNumber?` #${job.tenantNumber}`:""}: <span style={{color:"#5a8a5a"}}>{job.tenantName}</span> — <a href={`tel:${job.tenantPhone?.replace(/\s/g,"")}`} style={{color:"#4a7a4a",textDecoration:"none"}}>{job.tenantPhone}</a>
        </div>
      )}
      <div onClick={()=>setRead(!read)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:14, userSelect:"none" }}>
        <div style={{ width:18, height:18, border:`2px solid ${read?"#3ab56e":"#2a3a2a"}`, background:read?"#3ab56e":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
          {read && <span style={{color:"#000",fontSize:12,fontWeight:700}}>✓</span>}
        </div>
        <span style={{ fontSize:11, color:read?"#3ab56e":"#3a5a3a", letterSpacing:"0.08em" }}>I have read and understood the work directives</span>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onBack} style={{ background:"transparent", border:"1px solid #1e1e1e", color:"#333", padding:"10px 16px", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", cursor:"pointer" }}>Back</button>
        <button onClick={onConfirm} disabled={!read}
          style={{ flex:1, background:read?"#3ab56e":"#1a1a1a", border:"none", color:read?"#000":"#2a2a2a", padding:"10px 20px", fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", cursor:read?"pointer":"not-allowed", fontWeight:600, transition:"all 0.15s" }}>
          ✓ Commence Job
        </button>
      </div>
    </div>
  );
}

// ── Next Job Prompt ───────────────────────────────────────────────────────
function NextJobPrompt({ nextJob, onStartTravel, onDismiss }) {
  if (!nextJob) return null;
  return (
    <div style={{ background:"#0d1525", border:"1px solid #1a2a4a", padding:16, marginTop:12, fontFamily:"'DM Mono',monospace" }}>
      <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#4a9eff", marginBottom:8 }}>Next Job</div>
      <div style={{ fontSize:13, color:"#ccc", marginBottom:4 }}>{nextJob.address}</div>
      <div style={{ fontSize:11, color:"#3a5a7a", marginBottom:14 }}>
        {nextJob.timeStart}–{nextJob.timeEnd} · {nextJob.jobType}
        {nextJob.workOrder?.keyNumber && <span style={{color:"#6a5a20"}}> · 🔑 #{nextJob.workOrder.keyNumber}</span>}
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onStartTravel}
          style={{ flex:1, background:"#4a9eff", border:"none", color:"#000", padding:"10px 0", fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", cursor:"pointer", fontWeight:600 }}>
          🚗 Start Travel Now
        </button>
        <button onClick={onDismiss}
          style={{ background:"transparent", border:"1px solid #1a2a4a", color:"#3a5a7a", padding:"10px 16px", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", cursor:"pointer" }}>
          Later
        </button>
      </div>
    </div>
  );
}

// ── Work Order Panel ──────────────────────────────────────────────────────
function WorkOrderPanel({ workOrder, agentName, agentPhone }) {
  if (!workOrder) return null;
  return (
    <div style={{ marginTop:8, marginBottom:10, background:"#0d0d0d", border:"1px solid #1e1e1e", borderLeft:"3px solid #2a3a4a" }}>
      <div style={{ padding:"9px 14px", borderBottom:"1px solid #161616", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"#2a4a6a" }}>Work Order</span>
          <span style={{ fontSize:11, color:"#3a3a3a" }}>{workOrder.agency}</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {workOrder.hasPhotos && <span style={{ fontSize:9, color:"#5a6a3a", background:"#141e0d", border:"1px solid #2a3a1a", padding:"3px 8px" }}>📷 Photos</span>}
          {workOrder.url && <a href={workOrder.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:"#4a9eff", background:"#0d1525", border:"1px solid #1a2a4a", padding:"4px 10px", textDecoration:"none", fontFamily:"'DM Mono',monospace" }}>View PDF ↗</a>}
        </div>
      </div>
      <div style={{ padding:"9px 14px", borderBottom:"1px solid #111", display:"flex", gap:16, flexWrap:"wrap", fontSize:11 }}>
        {workOrder.keyNumber && <div><span style={{color:"#2a2a2a",fontSize:9,textTransform:"uppercase",display:"block",marginBottom:2}}>Key</span><span style={{color:"#e8a020"}}>#{workOrder.keyNumber}</span></div>}
        {workOrder.spendLimit && <div><span style={{color:"#2a2a2a",fontSize:9,textTransform:"uppercase",display:"block",marginBottom:2}}>Spend Limit</span><span style={{color:"#e05a2b"}}>{workOrder.spendLimit}</span></div>}
        {agentName && <div><span style={{color:"#2a2a2a",fontSize:9,textTransform:"uppercase",display:"block",marginBottom:2}}>Agent</span><a href={`tel:${agentPhone?.replace(/\s/g,"")}`} style={{color:"#555",textDecoration:"none"}}>{agentName}</a></div>}
      </div>
      <div style={{ padding:"11px 14px" }}>
        <div style={{ fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase", color:"#2a2a2a", marginBottom:7 }}>Agency Instructions</div>
        <div style={{ fontSize:12, color:"#666", lineHeight:1.7 }}>{workOrder.instructions}</div>
      </div>
    </div>
  );
}

// ── Late Alert Modal ──────────────────────────────────────────────────────
function LateAlertModal({ job, onClose, onLog }) {
  const [step, setStep] = useState("prompt");
  const [newTime, setNewTime] = useState("");
  const [notes, setNotes] = useState("");
  const first = job.tenantName?.split(" ")[0]||"Tenant";
  const smsText = `Hi ${first}, this is Viva Plumbing. Your technician is running slightly behind schedule and will be in touch shortly to confirm a revised arrival time. Apologies for any inconvenience — call us on 0475 521 500 if needed.`;
  const log = (action,extra={}) => onLog(job.id,action,extra);
  const confirmResolved = () => { if(!newTime)return; log(`Resident notified. New estimated arrival: ${newTime}${notes?` — ${notes}`:""}`,{status:"in-progress",newArrivalTime:newTime}); onClose(); };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
      <div style={{ background:"#111", border:"1px solid #e05a2b", maxWidth:420, width:"100%", fontFamily:"'DM Mono',monospace" }}>
        <div style={{ background:"#160800", padding:"14px 18px", borderBottom:"1px solid #2a1500" }}>
          <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#e05a2b" }}>⚠ Late Job Alert</div>
          <div style={{ fontSize:13, color:"#d4d0c8", marginTop:4 }}>{job.address}</div>
          <div style={{ fontSize:11, color:"#555", marginTop:2 }}>Window closes {job.timeEnd} · Tenant{job.tenantNumber?` #${job.tenantNumber}`:""}: {job.tenantName}</div>
        </div>
        <div style={{ padding:18 }}>
          {step==="prompt"&&<>
            <p style={{fontSize:12,color:"#777",margin:"0 0 16px",lineHeight:1.6}}>This job hasn't started. Contact {first} now.</p>
            <div style={{display:"flex",gap:10}}>
              <a href={`tel:${job.tenantPhone?.replace(/\s/g,"")}`} onClick={()=>{log(`Called ${job.tenantName}`);setStep("called");}} style={{flex:1,background:"#e8a020",color:"#000",padding:"11px 0",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer",textAlign:"center",textDecoration:"none",display:"block",fontWeight:600}}>📞 Call {first}</a>
              <button onClick={()=>{navigator.clipboard.writeText(smsText);log(`SMS sent to ${job.tenantName}`);setStep("resolved");}} style={{flex:1,background:"#1a1a1a",border:"1px solid #333",color:"#888",padding:"11px 0",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>💬 SMS {first}</button>
            </div>
          </>}
          {step==="called"&&<>
            <p style={{fontSize:12,color:"#777",margin:"0 0 16px"}}>Did {first} answer?</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{log(`${job.tenantName} answered`);setStep("resolved");}} style={{flex:1,background:"#3ab56e",border:"none",color:"#000",padding:"11px 0",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer",fontWeight:600}}>✓ Answered</button>
              <button onClick={()=>{log(`${job.tenantName} did not answer`);setStep("no-answer");}} style={{flex:1,background:"#1a1a1a",border:"1px solid #e05a2b",color:"#e05a2b",padding:"11px 0",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>No Answer</button>
            </div>
          </>}
          {step==="no-answer"&&<>
            <p style={{fontSize:12,color:"#777",margin:"0 0 10px",lineHeight:1.6}}>No answer — send SMS to {first}.</p>
            <div style={{background:"#0d0d0d",border:"1px solid #1e1e1e",padding:"10px 12px",fontSize:11,color:"#555",lineHeight:1.7,marginBottom:12}}>{smsText}</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>navigator.clipboard.writeText(smsText)} style={{flex:1,background:"#1a1a1a",border:"1px solid #222",color:"#555",padding:"10px 0",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Copy</button>
              <button onClick={()=>{log(`SMS sent after no answer`);setStep("resolved");}} style={{flex:1,background:"#e05a2b",border:"none",color:"#fff",padding:"10px 0",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer",fontWeight:600}}>Confirm Sent</button>
            </div>
          </>}
          {step==="resolved"&&<>
            <p style={{fontSize:12,color:"#3ab56e",margin:"0 0 14px"}}>✓ Resident contacted. Log the new arrival time.</p>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#444",marginBottom:6}}>New Estimated Arrival</div>
              <input type="time" value={newTime} onChange={e=>setNewTime(e.target.value)} style={{background:"#0d0d0d",border:"1px solid #333",color:"#d4d0c8",padding:"8px 12px",fontSize:13,fontFamily:"'DM Mono',monospace",width:"100%",boxSizing:"border-box",outline:"none"}}/>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#444",marginBottom:6}}>Notes (optional)</div>
              <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="e.g. Traffic delay, tenant happy to wait" style={{background:"#0d0d0d",border:"1px solid #1e1e1e",color:"#777",padding:"8px 12px",fontSize:12,fontFamily:"'DM Mono',monospace",width:"100%",boxSizing:"border-box",outline:"none"}}/>
            </div>
            <button onClick={confirmResolved} disabled={!newTime} style={{width:"100%",background:newTime?"#3ab56e":"#1a1a1a",border:"none",color:newTime?"#000":"#333",padding:"11px 0",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:newTime?"pointer":"not-allowed",fontWeight:600}}>Confirm Resident Notified</button>
          </>}
        </div>
      </div>
    </div>
  );
}

// ── Job Card ──────────────────────────────────────────────────────────────
function JobCard({ job, nextJob, onUpdate, onOpenAlert }) {
  const [expanded, setExpanded]             = useState(job.status==="late-alert"||job.status==="travelling");
  const [showWorkOrder, setShowWorkOrder]   = useState(false);
  const [showDirectives, setShowDirectives] = useState(false);
  const [showNextJob, setShowNextJob]       = useState(false);
  const [notes, setNotes]                   = useState(job.notes);
  const [story, setStory]                   = useState(job.story);
  const [storyEdited, setStoryEdited]       = useState(false);
  const [reviewFlags, setReviewFlags]       = useState([]);
  const [generating, setGenerating]         = useState(false);
  const [showComplete, setShowComplete]     = useState(false);
  const [furtherAction, setFurtherAction]   = useState(job.furtherAction||"");
  const [copied, setCopied]                 = useState(false);
  const [matState, setMatState]             = useState(()=>initMaterialState(job.jobType));
  const [customMats, setCustomMats]         = useState([]);

  const cfg    = STATUS[job.status]||STATUS.pending;
  const isLate = job.status==="late-alert";

  useEffect(()=>{ if(isLate||job.status==="travelling") setExpanded(true); },[isLate,job.status]);

  const addLog = (action) => [...(job.actionLog||[]),{time:timeNow(),actor:job.assignee,action}];

  const handleStartJob = () => onUpdate(job.id,{status:"travelling",departedAt:timeNow(),actionLog:addLog("Departed for job")});
  const handleArrived  = () => { const travel=job.departedAt?timeDiff(job.departedAt,timeNow()):null; onUpdate(job.id,{status:"arrived",arrivedAt:timeNow(),actionLog:addLog(`Arrived on site${travel?` — travel time ${travel}`:""}`)}); setShowDirectives(true); };
  const handleCommence = () => { onUpdate(job.id,{status:"in-progress",commencedAt:timeNow(),actionLog:addLog("Work commenced")}); setShowDirectives(false); };

  const handleConfirmComplete = () => {
    if (!furtherAction) return;
    const workTime = job.commencedAt?timeDiff(job.commencedAt,timeNow()):null;
    onUpdate(job.id,{ status:"ready-to-invoice", completedAt:timeNow(), story, notes, furtherAction,
      actionLog:addLog(`Job completed${workTime?` — on tools ${workTime}`:""} — Further action: ${furtherAction}`) });
    setShowComplete(false);
    if(nextJob) setShowNextJob(true); else setExpanded(false);
  };

  const handleStartNextTravel = () => {
    onUpdate(nextJob.id,{status:"travelling",departedAt:timeNow(),actionLog:[...(nextJob.actionLog||[]),{time:timeNow(),actor:nextJob.assignee,action:"Departed for job"}]});
    setShowNextJob(false); setExpanded(false);
  };

  const updateMat = (id, val) => {
    if (id==="__custom__") { setCustomMats(p=>[...p, val]); return; }
    setMatState(p=>({...p,[id]:val}));
  };

  const generateStory = async () => {
    if (!notes.trim()) return;
    setGenerating(true);
    setReviewFlags([]);
    const matText = materialsToText(job.jobType, matState);
    const customText = customMats.length ? `\nAdditional materials: ${customMats.join(", ")}` : "";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1200, system: INVOICE_PROMPT,
          messages: [{ role: "user", content: `Job: ${job.jobType}\nAddress: ${job.address}\nAgency instructions: ${job.workOrder?.instructions || "None"}\nMaterials used:\n${matText}${customText}\nPlumber notes: ${notes}\n\nGenerate the invoice description and review flags as JSON.` }]
        })
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || "").join("\n") || "";
      try {
        const clean = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setStory(parsed.draft || raw);
        setReviewFlags(parsed.flags || []);
      } catch {
        setStory(raw);
        setReviewFlags([]);
      }
      setStoryEdited(false);
    } catch { setStory("Failed — try again."); }
    setGenerating(false);
  };
;

  const timeStrip = () => {
    const items=[];
    if(job.departedAt)  items.push({label:"Departed",val:job.departedAt});
    if(job.arrivedAt)   items.push({label:"Arrived",val:job.arrivedAt,sub:job.departedAt?timeDiff(job.departedAt,job.arrivedAt):null});
    if(job.commencedAt) items.push({label:"Commenced",val:job.commencedAt});
    if(job.completedAt) items.push({label:"Completed",val:job.completedAt,sub:job.commencedAt?timeDiff(job.commencedAt,job.completedAt):null});
    return items;
  };

  const showMaterials = ["in-progress","ready-to-invoice","complete"].includes(job.status);

  return (
    <div style={{ background:expanded?"#141414":"#111", border:`1px solid ${isLate?"#3a1500":job.status==="travelling"?"#2a1e00":expanded?"#222":"#1a1a1a"}`, borderLeft:`3px solid ${cfg.dot}`, marginBottom:10, transition:"all 0.2s", fontFamily:"'DM Mono',monospace" }}>

      {/* Header */}
      <div onClick={()=>setExpanded(!expanded)} style={{ padding:"13px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, background:isLate?"#120700":job.status==="travelling"?"#0f0d00":"transparent" }}>
        <Dot status={job.status}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,color:isLate?"#e8a060":job.status==="travelling"?"#c89040":"#ccc",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{job.address}</div>
          <div style={{fontSize:11,color:"#3a3a3a",marginTop:3,display:"flex",gap:10,flexWrap:"wrap"}}>
            <span>{job.timeStart}–{job.timeEnd}</span>
            <span style={{color:"#222"}}>·</span>
            <span style={{color:"#4a4a4a"}}>{job.jobType}</span>
            <span style={{color:"#222"}}>·</span>
            <span style={{color:"#333"}}>{job.ivNumber}</span>
            {job.workOrder?.keyNumber&&<span style={{color:"#6a5a20"}}>🔑 #{job.workOrder.keyNumber}</span>}
            {job.newArrivalTime&&<span style={{color:"#e8a020"}}>→ ETA {job.newArrivalTime}</span>}
          </div>
        </div>
        <div style={{flexShrink:0,textAlign:"right"}}>
          <div style={{fontSize:10,letterSpacing:"0.1em",color:cfg.color,textTransform:"uppercase"}}>{cfg.label}</div>
          <div style={{fontSize:11,color:"#333",marginTop:2}}>{job.assignee}</div>
        </div>
      </div>

      {expanded && (
        <div style={{padding:"0 16px 16px",borderTop:"1px solid #1a1a1a"}}>

          {/* Time strip */}
          {timeStrip().length>0&&(
            <div style={{display:"flex",gap:0,padding:"10px 0 8px",flexWrap:"wrap"}}>
              {timeStrip().map((t,i)=>(
                <div key={i} style={{marginRight:20,marginBottom:4}}>
                  <div style={{fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",color:"#2a2a2a"}}>{t.label}</div>
                  <div style={{fontSize:12,color:"#666",marginTop:2}}>{t.val}{t.sub&&<span style={{fontSize:10,color:"#3a3a3a"}}> ({t.sub})</span>}</div>
                </div>
              ))}
            </div>
          )}

          {/* Contacts */}
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            {job.tenantName&&<a href={`tel:${job.tenantPhone?.replace(/\s/g,"")}`} style={{fontSize:11,color:"#555",textDecoration:"none",background:"#0d0d0d",border:"1px solid #1e1e1e",padding:"5px 10px",display:"inline-block"}}>📞 {job.tenantName}{job.tenantNumber?` #${job.tenantNumber}`:""} — {job.tenantPhone}</a>}
            {job.agentName&&<a href={`tel:${job.agentPhone?.replace(/\s/g,"")}`} style={{fontSize:11,color:"#3a5a3a",textDecoration:"none",background:"#0d0d0d",border:"1px solid #161e16",padding:"5px 10px",display:"inline-block"}}>🏢 {job.agentName} — {job.agentPhone}</a>}
          </div>

          {/* Work order toggle */}
          {job.workOrder&&!showDirectives&&(
            <button onClick={()=>setShowWorkOrder(!showWorkOrder)} style={{marginBottom:4,background:"transparent",border:`1px solid ${showWorkOrder?"#2a3a4a":"#1e1e1e"}`,color:showWorkOrder?"#4a9eff":"#3a3a3a",padding:"6px 13px",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
              {showWorkOrder?"▲":"▼"} Work Order — {job.workOrder.agency}
              {job.workOrder.spendLimit&&<span style={{color:"#e05a2b"}}>{job.workOrder.spendLimit}</span>}
              {job.workOrder.hasPhotos&&<span style={{color:"#5a6a3a"}}>📷</span>}
            </button>
          )}
          {showWorkOrder&&!showDirectives&&<WorkOrderPanel workOrder={job.workOrder} agentName={job.agentName} agentPhone={job.agentPhone}/>}

          {/* Directive gate */}
          {showDirectives&&<WorkDirectiveGate job={job} onConfirm={handleCommence} onBack={()=>setShowDirectives(false)}/>}

          {/* Materials + notes + story */}
          {showMaterials&&!showDirectives&&(
            <>
              <MaterialsChecklist jobType={job.jobType} matState={matState} onChange={updateMat}/>

              <div style={{marginTop:14}}>
                <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#333",marginBottom:6}}>Job Notes</div>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                  style={{width:"100%",minHeight:75,background:"#0d0d0d",border:"1px solid #1e1e1e",color:"#888",fontFamily:"'DM Mono',monospace",fontSize:12,lineHeight:1.6,padding:"9px 11px",resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
              </div>

              <button onClick={generateStory} disabled={generating}
                style={{marginTop:8,background:"transparent",border:"1px solid #222",color:generating?"#2a2a2a":"#555",padding:"7px 13px",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:generating?"not-allowed":"pointer"}}>
                {generating?"Generating…":"⚡ Generate Invoice Story"}
              </button>

              {story&&(
                <div style={{marginTop:12}}>
                  <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#333"}}>Invoice Draft {storyEdited&&<span style={{color:"#e8a020",fontSize:9}}>· edited</span>}</div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={generateStory} style={{background:"none",border:"none",color:"#333",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>↺ Regenerate</button>
                      <button onClick={()=>{navigator.clipboard.writeText(story);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
                        style={{background:"none",border:"1px solid #1a1a1a",color:copied?"#3ab56e":"#333",padding:"3px 10px",fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>
                        {copied?"Copied ✓":"Copy"}
                      </button>
                    </div>
                  </div>
                  <textarea value={story} onChange={e=>{ setStory(e.target.value); setStoryEdited(true); }}
                    style={{width:"100%",minHeight:140,background:"#0d0d0d",border:"1px solid #0d200d",color:"#888",fontFamily:"'DM Mono',monospace",fontSize:12,lineHeight:1.75,padding:"11px 13px",resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
              {reviewFlags.length>0&&(
                <div style={{marginTop:10,background:"#1a1200",border:"1px solid #3a2e00",padding:"12px 14px"}}>
                  <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"#8a7020",marginBottom:8}}>⚠ Review Before Sending</div>
                  {reviewFlags.map((flag,i)=>(
                    <div key={i} style={{fontSize:12,color:"#a07830",lineHeight:1.6,marginBottom:i<reviewFlags.length-1?6:0,display:"flex",gap:8}}>
                      <span style={{color:"#5a4010",flexShrink:0}}>—</span>
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              )}
                </div>
              )}
            </>
          )}

          {/* Further action */}
          {showComplete&&(
            <div style={{marginTop:14}}>
              <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#333",marginBottom:8}}>Further Action Required?</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["None","Quote Required","Follow-up","Return Visit","Referral"].map(opt=>(
                  <button key={opt} onClick={()=>setFurtherAction(opt)}
                    style={{background:furtherAction===opt?"#e05a2b":"#141414",border:`1px solid ${furtherAction===opt?"#e05a2b":"#222"}`,color:furtherAction===opt?"#fff":"#444",padding:"6px 13px",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Next job prompt */}
          {showNextJob&&nextJob&&<NextJobPrompt nextJob={nextJob} onStartTravel={handleStartNextTravel} onDismiss={()=>{ setShowNextJob(false); setExpanded(false); }}/>}

          {/* Action buttons */}
          {!showDirectives&&!showNextJob&&(
            <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
              {job.status==="pending"&&<button onClick={handleStartJob} style={{background:"#c89040",border:"none",color:"#000",padding:"10px 20px",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer",fontWeight:600}}>🚗 Start Job</button>}
              {job.status==="travelling"&&<button onClick={handleArrived} style={{background:"#9aba60",border:"none",color:"#000",padding:"10px 20px",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer",fontWeight:600}}>📍 Arrived on Site</button>}
              {job.status==="arrived"&&!showDirectives&&<button onClick={()=>setShowDirectives(true)} style={{background:"#3ab56e",border:"none",color:"#000",padding:"10px 20px",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer",fontWeight:600}}>📋 Read Directives & Commence</button>}
              {job.status==="late-alert"&&<button onClick={()=>onOpenAlert(job)} style={{background:"#e05a2b",border:"none",color:"#fff",padding:"10px 20px",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer",fontWeight:600,animation:"pulse 1.5s infinite"}}>⚠ Contact Tenant Now</button>}
              {job.status==="in-progress"&&!showComplete&&<button onClick={()=>setShowComplete(true)} style={{background:"#3ab56e",border:"none",color:"#000",padding:"10px 20px",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer",fontWeight:600}}>✓ Complete Job</button>}
              {showComplete&&<button onClick={handleConfirmComplete} disabled={!furtherAction} style={{background:furtherAction?"#3ab56e":"#1a1a1a",border:"none",color:furtherAction?"#000":"#2a2a2a",padding:"10px 20px",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:furtherAction?"pointer":"not-allowed",fontWeight:600}}>Confirm Complete</button>}
              {job.status==="ready-to-invoice"&&<div style={{fontSize:11,color:"#4a9eff",letterSpacing:"0.1em",textTransform:"uppercase",padding:"10px 0"}}>✓ Flagged for invoicing</div>}
            </div>
          )}

          {/* Action log */}
          {job.actionLog?.length>0&&(
            <div style={{marginTop:16,borderTop:"1px solid #141414",paddingTop:12}}>
              <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"#2a2a2a",marginBottom:8}}>Action Log</div>
              {job.actionLog.map((e,i)=>(
                <div key={i} style={{fontSize:11,color:"#333",marginBottom:4,display:"flex",gap:12}}>
                  <span style={{color:"#252525",flexShrink:0}}>{e.time}</span>
                  <span style={{color:"#2e2e2e",flexShrink:0}}>{e.actor}</span>
                  <span style={{color:"#454545"}}>{e.action}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [jobs, setJobs]           = useState(MOCK_JOBS);
  const [filter, setFilter]       = useState("All");
  const [statusFilter, setStatus] = useState("All");
  const [now, setNow]             = useState(timeNow());
  const [alertJob, setAlertJob]   = useState(null);
  const checked                   = useRef(new Set());

  useEffect(()=>{
    requestNotifyPermission();
    const tick = setInterval(()=>{
      const n=timeNow(); setNow(n); const nowM=parseTime(n);
      setJobs(prev=>prev.map(j=>{
        if(j.status!=="pending"||checked.current.has(j.id)) return j;
        if(nowM>=parseTime(j.timeEnd)-30){ checked.current.add(j.id); safeNotify("⚠ Viva Jobs",`${j.assignee}'s job hasn't started`); return{...j,status:"late-alert"}; }
        return j;
      }));
    },15000);
    return()=>clearInterval(tick);
  },[]);

  const updateJob = (id,updates) => setJobs(p=>p.map(j=>j.id===id?{...j,...updates}:j));
  const handleLog = (id,action,extra={}) => setJobs(p=>p.map(j=>{ if(j.id!==id)return j; const log=action?[...(j.actionLog||[]),{time:timeNow(),actor:j.assignee,action}]:j.actionLog; return{...j,actionLog:log,...extra}; }));
  const getNextJob = (job) => jobs.filter(j=>j.assignee===job.assignee&&j.id!==job.id&&["pending","travelling"].includes(j.status)).sort((a,b)=>parseTime(a.timeStart)-parseTime(b.timeStart))[0]||null;

  const counts = { pending:jobs.filter(j=>j.status==="pending").length, active:jobs.filter(j=>["travelling","arrived","in-progress"].includes(j.status)).length, late:jobs.filter(j=>j.status==="late-alert").length, invoice:jobs.filter(j=>j.status==="ready-to-invoice").length };
  const filtered = jobs.filter(j=>(filter==="All"||j.assignee===filter)&&(statusFilter==="All"||j.status===statusFilter));
  const fBtn = (on) => ({border:`1px solid ${on?"#e05a2b":"#1a1a1a"}`,background:on?"#e05a2b":"transparent",color:on?"#fff":"#333",padding:"5px 12px",fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"});
  const sBtn = (on) => ({border:`1px solid ${on?"#2a2a2a":"#111"}`,background:on?"#181818":"transparent",color:on?"#666":"#252525",padding:"5px 12px",fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"});

  return (
    <div style={{minHeight:"100vh",background:"#080808",fontFamily:"'DM Mono',monospace",color:"#ccc"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.55}}`}</style>

      {alertJob&&<LateAlertModal job={alertJob} onClose={()=>setAlertJob(null)} onLog={handleLog}/>}

      <div style={{borderBottom:"1px solid #161616",padding:"15px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#080808",zIndex:10}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}>
          <span style={{fontSize:13,color:"#e05a2b",letterSpacing:"0.1em"}}>VIVA</span>
          <span style={{fontSize:11,color:"#2a2a2a",letterSpacing:"0.15em"}}>JOBS</span>
        </div>
        <div style={{display:"flex",gap:14,fontSize:11,alignItems:"center"}}>
          <span style={{color:"#444"}}>{now}</span>
          {counts.late>0&&<span style={{color:"#e05a2b",animation:"pulse 1.5s infinite"}}>⚠ {counts.late} LATE</span>}
          {counts.active>0&&<span style={{color:"#e8a020"}}>{counts.active} active</span>}
          {counts.invoice>0&&<span style={{color:"#4a9eff"}}>{counts.invoice} to invoice</span>}
        </div>
      </div>

      <div style={{display:"flex",borderBottom:"1px solid #111",padding:"0 18px"}}>
        {[{l:"Pending",v:counts.pending,c:"#3a3a3a"},{l:"Active",v:counts.active,c:"#e8a020"},{l:"Late",v:counts.late,c:"#e05a2b"},{l:"Invoice",v:counts.invoice,c:"#4a9eff"}].map(s=>(
          <div key={s.l} style={{padding:"11px 16px 11px 0",marginRight:8}}>
            <div style={{fontSize:20,color:s.c,fontWeight:500}}>{s.v}</div>
            <div style={{fontSize:9,color:"#222",letterSpacing:"0.15em",textTransform:"uppercase",marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{padding:"11px 18px",borderBottom:"1px solid #111",display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
        {PLUMBERS.map(p=><button key={p} onClick={()=>setFilter(p)} style={fBtn(filter===p)}>{p}</button>)}
        <div style={{width:1,height:14,background:"#1a1a1a",margin:"0 3px"}}/>
        {[{k:"All",l:"All"},{k:"late-alert",l:"⚠ Late"},{k:"travelling",l:"Travelling"},{k:"in-progress",l:"Active"},{k:"ready-to-invoice",l:"Invoice"}].map(s=>(
          <button key={s.k} onClick={()=>setStatus(s.k)} style={sBtn(statusFilter===s.k)}>{s.l}</button>
        ))}
      </div>

      <div style={{padding:"12px 18px"}}>
        {filtered.length===0
          ?<div style={{textAlign:"center",padding:"40px 0",color:"#222",fontSize:12}}>No jobs match this filter</div>
          :filtered.map(j=><JobCard key={j.id} job={j} nextJob={getNextJob(j)} onUpdate={updateJob} onOpenAlert={setAlertJob}/>)
        }
      </div>

      <div style={{padding:"14px 18px",borderTop:"1px solid #0f0f0f",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <button onClick={()=>setJobs(p=>p.map(j=>j.id==="ev002"?{...j,status:"late-alert"}:j))}
          style={{background:"none",border:"1px solid #161616",color:"#222",padding:"5px 12px",fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>
          Demo: Trigger Late Alert
        </button>
        <span style={{fontSize:9,color:"#161616",letterSpacing:"0.1em"}}>STAGE 1 · MOCK DATA · Xero + Google Calendar next</span>
      </div>
    </div>
  );
}
