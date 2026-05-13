import React, { useState, useEffect, useRef, useCallback } from "react";

// ── Config ────────────────────────────────────────────────────────────────
const CLIENT_ID = "485477368548-miajb1flq89rchpvjjnijp2nov3nit6p.apps.googleusercontent.com";
const PICKER_API_KEY = "AIzaSyCEp9qInOxvwZEq0jVO0FNRnGHZ5KRVrqM";
const SCOPES = "https://www.googleapis.com/auth/calendar";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

const TEAM = ["Richie","Mingo","Harry","Chris","Nick"];
const DAY_START = 7;
const DAY_END = 18;
const DAY_MINS = (DAY_END - DAY_START) * 60;

// Team email map
const EMAIL_TO_NAME = {
  "info@vivaplumbing.com": "Richie",
  "vivaorganise@gmail.com": "Richie",
  "deanvivaplumbing@gmail.com": "Mingo",
  "vivaplumbing05@gmail.com": "Harry",
  "chrisvivaplumbing@gmail.com": "Chris",
  "nicholaspaget14@gmail.com": "Nick",
};

const NAME_TO_EMAIL = {
  "Richie": "info@vivaplumbing.com",
  "Mingo": "deanvivaplumbing@gmail.com",
  "Harry": "vivaplumbing05@gmail.com",
  "Chris": "chrisvivaplumbing@gmail.com",
  "Nick": "nicholaspaget14@gmail.com",
};

const PC = {
  Richie:{light:"#e8f0ff",border:"#4a7acc",dot:"#2a5aaa",text:"#1a3a7a"},
  Mingo: {light:"#fff0ea",border:"#e07040",dot:"#c05020",text:"#8a2a00"},
  Harry: {light:"#eafff0",border:"#40b060",dot:"#208040",text:"#0a5020"},
  Chris: {light:"#fffde8",border:"#c8a820",dot:"#a07800",text:"#604800"},
  Nick:  {light:"#f5eaff",border:"#9060c0",dot:"#6030a0",text:"#3a0a70"},
  Unknown:{light:"#f5f5f5",border:"#999",dot:"#666",text:"#333"},
};

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
  "Water Compliance":        {bg:"#e3f2fd",border:"#0288d1",text:"#01579b"},
  "Return Visit":            {bg:"#fff8e1",border:"#f9a825",text:"#e65100"},
};

const STATUS_COLORS = {
  pending:            {bg:"#f5f5f5",border:"#d0d0d0",text:"#666",   label:"Pending"},
  travelling:         {bg:"#fff8e1",border:"#f9a825",text:"#e65100",label:"Travelling"},
  arrived:            {bg:"#e8f5e9",border:"#66bb6a",text:"#1b5e20",label:"Arrived"},
  "in-progress":      {bg:"#fff3e0",border:"#ffa726",text:"#bf360c",label:"In Progress"},
  "late-alert":       {bg:"#ffebee",border:"#ef5350",text:"#b71c1c",label:"Action Required"},
  "ready-to-invoice": {bg:"#e3f2fd",border:"#42a5f5",text:"#0d47a1",label:"Ready to Invoice"},
  complete:           {bg:"#e8f5e9",border:"#66bb6a",text:"#1b5e20",label:"Complete"},
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

const IP=`You are a plumbing documentation assistant for Viva Plumbing, Brisbane. Convert rough plumber notes into a clean invoice description, review it, and generate smart follow-up questions.

INVOICE RULES:
- Open with "Called out to investigate..."
- Structure: findings > works carried out > outcome > recommendations
- Completed work in past tense. Recommendations in present tense ("It is recommended that...")
- No first-person, no dot points, no pipe sizes, no fluff
- "Braided supply hose" -> "premium PEX core braided supply hoses"
- "corroded" not "rusty". "Rodded" not "sent" for eel. Cables = 4.55m each
- Fixture location required for shower/toilet/basin/vanity/bath - flag if missing or unclear
- Compare draft to agency instructions and flag any gaps
- keeseal stays as written

OUTPUT - respond only with valid JSON:
{
  "draft": "full invoice description as clean prose",
  "flags": ["flag 1", "flag 2"],
  "queries": [
    {"q": "question text", "options": ["Option A", "Option B", "Option C"]}
  ]
}

Queries should be smart follow-up questions to improve the draft - only include if genuinely needed. Max 4 questions. Examples: fixture location if missing, whether flood/pressure test was done for leak jobs, whether work order items were all addressed. Make options short and tappable.`;

// ── Helpers ───────────────────────────────────────────────────────────────
function tn(){const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");}
function pt(t){if(!t)return 0;const[h,m]=t.split(":").map(Number);return h*60+m;}
function td(a,b){const d=pt(b)-pt(a);if(d<=0)return null;return d>=60?Math.floor(d/60)+"h "+d%60+"m":d+" min";}
function t2p(ts){return Math.max(0,Math.min(100,(pt(ts)-DAY_START*60)/DAY_MINS*100));}
function dur(s,e){return Math.max(2,(pt(e)-pt(s))/DAY_MINS*100);}
function jc(jt){return JT_COLORS[jt]||{bg:"#e8eaed",border:"#9aa0a6",text:"#3c4043"};}
function sno(t,b){try{if(typeof window!=="undefined"&&"Notification"in window&&window.Notification.permission==="granted")new window.Notification(t,{body:b});}catch(e){}}
function rno(){try{if(typeof window!=="undefined"&&"Notification"in window&&window.Notification.permission==="default")window.Notification.requestPermission();}catch(e){}}

// Parse assignee from Calendar event attendees
function getAssignee(event) {
  if (!event.attendees) return "Richie";
  // Look for the # number in title for tenant, but assignee is determined by which plumber email is in attendees
  // Try to find a plumber email (excluding vivaorganise which is always there)
  for (const att of event.attendees) {
    const name = EMAIL_TO_NAME[att.email?.toLowerCase()];
    if (name && name !== "Richie" && att.email !== "vivaorganise@gmail.com") {
      return name;
    }
  }
  // Check if Richie's personal email is there
  if (event.attendees.some(a => a.email === "info@vivaplumbing.com")) return "Richie";
  return "Richie";
}

// Parse job type from event title only (not description)
function parseJobType(title, desc) {
  const t = title.toUpperCase();
  const d = (desc||"").toUpperCase();
  // Title-based detection first
  if (t.includes("QUOTE ONLY")) return "Quote Only";
  if (t.includes("QUOTED WORK")) return "Quoted Work";
  if (t.includes("URGENT")) return "Urgent";
  // DUPLICATE means return visit / follow-up
  if (t.includes("DUPLICATE")) return "Return Visit";
  // Water compliance detected from notes keyword WELS
  if (d.includes("WELS") || t.includes("WELS") || t.includes("COMPLIANCE") || t.includes("WATER COMPLIANCE")) return "Water Compliance";
  // Default - Do and Charge (green, no keyword needed)
  return "Do and Charge";
}

// Check if event is a suburb header (all caps, no street number)
function isSuburbHeader(title) {
  if (!title) return true;
  // Has a street number = real job
  if (/\d/.test(title)) return false;
  // All caps or mostly caps with no numbers = suburb header
  const upper = title.replace(/[^A-Za-z]/g,"");
  if (upper.length > 0 && upper === upper.toUpperCase() && title.length < 60) return true;
  return false;
}

// Extract brief from description
function extractBrief(desc) {
  if (!desc) return "";
  const lines = desc.split("\n").map(l=>l.trim()).filter(Boolean);
  // Skip template lines, find meaningful content
  const skip = ["notes:","depart:","arrive:","complete:","materials:","story:","quote:","labour:","---","remember","wels","is the property","water metre","must conduct","toilets must","test operation"];
  for (const line of lines) {
    const ll = line.toLowerCase();
    if (skip.some(s=>ll.startsWith(s))) continue;
    if (ll.length < 5) continue;
    if (/^\d+-\d+/.test(line)) continue; // skip codes like "10-2 1#"
    return line.slice(0,80) + (line.length>80?"...":"");
  }
  return "";
}

// Extract IV number
function extractIV(title, desc) {
  const match = (title+" "+(desc||"")).match(/IV-\d+/i);
  return match ? match[0].toUpperCase() : "";
}

// Check if job is complete (has invoice/quote number at top of notes)
function isComplete(title, desc) {
  if (!desc) return false;
  const firstLines = desc.split("\n").slice(0,3).join(" ");
  return /IV-\d+|QU-\d+|INV\d+/i.test(firstLines);
}

// Parse notes section from Calendar event description
function parseNotes(desc) {
  if (!desc) return "";
  const notesMatch = desc.match(/Job Story:(.*?)(?:---|Quote:|$)/si);
  if (notesMatch) return notesMatch[1].trim();
  const match = desc.match(/Notes:(.*?)(?:---|$)/si);
  if (match) return match[1].trim();
  return "";
}

// Parse status from description
function parseStatus(desc) {
  if (!desc) return "pending";
  const d = desc.toLowerCase();
  if (d.includes("time complete:") && d.match(/time complete:\s*\d/)) return "ready-to-invoice";
  if (d.includes("time arrive:") && d.match(/time arrive:\s*\d/)) return "in-progress";
  if (d.includes("time depart:") && d.match(/time depart:\s*\d/)) return "travelling";
  return "pending";
}

// parseIV handled by extractIV above

// Parse tenant number from title (e.g. "#2")
function parseTenantNum(title) {
  const match = title.match(/#(\d+)/);
  return match ? parseInt(match[1]) : null;
}

// Parse key number from description
function parseKeyNum(desc) {
  if (!desc) return null;
  const match = (desc||"").match(/key\s*#?(\d+)/i);
  return match ? match[1] : null;
}

// Convert Calendar event to job object
function getDriveUrl(event) {
  // Check for Drive attachments
  if (event.attachments && event.attachments.length > 0) {
    const pdf = event.attachments.find(a => a.mimeType === "application/pdf" || a.title?.toLowerCase().includes(".pdf"));
    if (pdf) return pdf.fileUrl || `https://drive.google.com/file/d/${pdf.fileId}/view`;
    return event.attachments[0].fileUrl || null;
  }
  // Check description for Drive links
  const match = (event.description||"").match(/https:\/\/drive\.google\.com\/[^\s\n]+/);
  return match ? match[0] : null;
}

function eventToJob(event) {
  const title = event.summary || "";
  const desc = event.description || "";
  const start = event.start?.dateTime || event.start?.date || "";
  const end = event.end?.dateTime || event.end?.date || "";
  const startTime = start ? new Date(start).toTimeString().slice(0,5) : "08:00";
  const endTime = end ? new Date(end).toTimeString().slice(0,5) : "09:00";
  // Extract address from title (everything before the time pattern)
  const address = title.replace(/\s*\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}.*$/, "").replace(/#\d+\s*$/, "").trim() || title;
  return {
    id: event.id,
    calendarEventId: event.id,
    address,
    timeStart: startTime,
    timeEnd: endTime,
    assignee: getAssignee(event),
    ivNumber: parseIV(title, desc),
    jobType: parseJobType(title, desc),
    notes: parseNotes(desc),
    status: parseStatus(desc),
    departedAt: null, arrivedAt: null, commencedAt: null, completedAt: null,
    tenantNumber: parseTenantNum(title),
    tenantName: "", tenantPhone: "",
    agentName: "", agentPhone: "",
    area: "",
    workOrder: {
      agency: "", keyNumber: parseKeyNum(desc), spendLimit: null,
      instructions: desc.replace(/Notes:.*$/si,"").trim().slice(0,300),
      hasPhotos: (event.attachments||[]).length > 0, url: getDriveUrl(event),
    },
    story: "", actionLog: [], furtherAction: "", newArrivalTime: "",
    rawEvent: event,
  };
}

// Update Calendar event description with job status
async function updateCalendarEvent(jobId, updates) {
  try {
    const event = await window.gapi.client.calendar.events.get({
      calendarId: "primary", eventId: jobId,
    });
    const desc = event.result.description || "";
    // Update the notes section
    let newDesc = desc;
    if (updates.notes) {
      newDesc = newDesc.replace(/Job Story:.*?(?=---|$)/si, `Job Story: ${updates.notes}\n`);
      if (!newDesc.includes("Job Story:")) newDesc += `\nJob Story: ${updates.notes}`;
    }
    if (updates.story) {
      newDesc = newDesc + `\n\n--- INVOICE DRAFT ---\n${updates.story}`;
    }
    await window.gapi.client.calendar.events.patch({
      calendarId: "primary", eventId: jobId,
      resource: { description: newDesc },
    });
  } catch(e) { console.error("Calendar update failed:", e); }
}

const F = "'Segoe UI',system-ui,sans-serif";
const mono = "'DM Mono',monospace";

// ── Google Sign In ────────────────────────────────────────────────────────
function SignIn({ onSignedIn }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const script1 = document.createElement("script");
    script1.src = "https://apis.google.com/js/api.js";
    script1.onload = () => {
      window.gapi.load("client", async () => {
        try {
          await window.gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC],
          });
        } catch(e) { console.error(e); }
      });
    };
    document.head.appendChild(script1);
    const script2 = document.createElement("script");
    script2.src = "https://accounts.google.com/gsi/client";
    document.head.appendChild(script2);
    const script3 = document.createElement("script");
    script3.src = "https://apis.google.com/js/api.js";
    document.head.appendChild(script3);
  }, []);

  const handleSignIn = () => {
    setLoading(true); setError("");
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (resp) => {
          if (resp.error) { setError("Sign in failed. Try again."); setLoading(false); return; }
          window.gapi.client.setToken(resp);
          // Get user info
          try {
            const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${resp.access_token}` }
            }).then(r => r.json());
            const name = EMAIL_TO_NAME[userInfo.email?.toLowerCase()] || "Richie";
            const userData = { name, email: userInfo.email, token: resp.access_token };
            localStorage.setItem("viva_user", JSON.stringify(userData));
            onSignedIn(userData);
          } catch(e) { const userData = { name: "Richie", email: "", token: resp.access_token };
            localStorage.setItem("viva_user", JSON.stringify(userData));
            onSignedIn(userData); }
          setLoading(false);
        },
      });
      client.requestAccessToken();
    } catch(e) { setError("Sign in failed. Make sure popups are allowed."); setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",background:"#f8f9fa",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F}}>
      <div style={{background:"#fff",borderRadius:12,padding:"48px 40px",boxShadow:"0 4px 20px rgba(0,0,0,0.1)",maxWidth:400,width:"100%",textAlign:"center"}}>
        <div style={{width:56,height:56,background:"#e05a2b",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
          <span style={{color:"#fff",fontSize:28,fontWeight:800}}>V</span>
        </div>
        <div style={{fontSize:22,fontWeight:700,color:"#202124",marginBottom:8}}>Viva Jobs</div>
        <div style={{fontSize:14,color:"#5f6368",marginBottom:32}}>Sign in with your Google account to access your jobs</div>
        {error && <div style={{background:"#ffebee",border:"1px solid #ef9a9a",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#c62828",marginBottom:16}}>{error}</div>}
        <button onClick={handleSignIn} disabled={loading}
          style={{background:loading?"#f1f3f4":"#1a73e8",color:loading?"#9aa0a6":"#fff",border:"none",borderRadius:8,padding:"12px 32px",fontSize:15,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:F,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#fff" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#fff" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#fff" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#fff" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg>
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
        <div style={{fontSize:11,color:"#9aa0a6",marginTop:16}}>Access restricted to Viva Plumbing team members</div>
      </div>
    </div>
  );
}

// ── Schedule Board ────────────────────────────────────────────────────────
function Board({jobs,onSelect}){
  const hrs=Array.from({length:DAY_END-DAY_START+1},(_,i)=>DAY_START+i);
  const now=tn();const np=t2p(now);const showNow=pt(now)>=DAY_START*60&&pt(now)<=DAY_END*60;
  return(
    <div style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.12)",fontFamily:F}}>
      <div style={{display:"flex",borderBottom:"1px solid #e8eaed",background:"#f8f9fa"}}>
        <div style={{width:120,flexShrink:0,padding:"10px 14px",fontSize:11,color:"#80868b",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",borderRight:"1px solid #e8eaed"}}>Plumber</div>
        <div style={{flex:1,position:"relative",height:36}}>
          {hrs.map(h=><div key={h} style={{position:"absolute",left:`${(h-DAY_START)/(DAY_END-DAY_START)*100}%`,top:0,height:"100%",borderLeft:"1px solid #e8eaed",display:"flex",alignItems:"center",paddingLeft:4}}><span style={{fontSize:10,color:"#9aa0a6",fontWeight:500}}>{h>12?`${h-12}pm`:h===12?"12pm":`${h}am`}</span></div>)}
          {showNow&&<div style={{position:"absolute",left:`${np}%`,top:0,bottom:0,width:2,background:"#ea4335",zIndex:5}}><div style={{position:"absolute",top:2,left:3,fontSize:9,color:"#ea4335",fontWeight:600,whiteSpace:"nowrap"}}>{now}</div></div>}
        </div>
      </div>
      {TEAM.map((pl,pi)=>{
        const pj=jobs.filter(j=>j.assignee===pl);const c=PC[pl]||PC.Unknown;
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
                  <div key={job.id} onClick={()=>onSelect(job)} title={`${job.address} — ${job.jobType} — ${sc.label}`}
                    style={{position:"absolute",left:`${l}%`,width:`${w}%`,top:5,bottom:5,background:isLate?"#ffebee":act?sc.bg:jcolor.bg,border:`1px solid ${isLate?"#ef5350":act?sc.border:jcolor.border}`,borderLeft:`3px solid ${isLate?"#ef5350":act?sc.border:jcolor.border}`,borderRadius:4,cursor:"pointer",overflow:"hidden",zIndex:2,boxShadow:act?"0 1px 4px rgba(0,0,0,0.2)":"0 1px 2px rgba(0,0,0,0.08)",transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.25)";e.currentTarget.style.zIndex=10;}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow=act?"0 1px 4px rgba(0,0,0,0.2)":"0 1px 2px rgba(0,0,0,0.08)";e.currentTarget.style.zIndex=2;}}>
                    <div style={{padding:"3px 7px",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                      <div style={{fontSize:11,color:isLate?"#b71c1c":act?sc.text:jcolor.text,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",lineHeight:1.3}}>{job.timeStart} {job.address.split(",")[0]}</div>
                      <div style={{fontSize:10,color:isLate?"#ef5350":act?sc.text:jcolor.text,opacity:0.8,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:1}}>{job.jobType}{job.isDuplicate?" · Follow-up":""}{job.workOrder?.keyNumber?` · Key ${job.workOrder.keyNumber}`:""}{job.brief?` · ${job.brief}`:""}{isLate?" ⚠":act?" ●":""}</div>
                    </div>
                  </div>
                );
              })}
              {pj.length===0&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",paddingLeft:14}}><span style={{fontSize:11,color:"#dadce0",fontStyle:"italic"}}>No jobs today</span></div>}
            </div>
          </div>
        );
      })}
      <div style={{padding:"10px 16px",borderTop:"1px solid #e8eaed",display:"flex",gap:14,flexWrap:"wrap",background:"#f8f9fa",alignItems:"center"}}>
        <span style={{fontSize:10,color:"#80868b",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Status:</span>
        {Object.entries(STATUS_COLORS).slice(0,5).map(([k,v])=><div key={k} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,background:v.bg,border:`2px solid ${v.border}`,borderRadius:2}}/><span style={{fontSize:10,color:"#5f6368"}}>{v.label}</span></div>)}
      </div>
    </div>
  );
}

// ── My Jobs ───────────────────────────────────────────────────────────────
function MyJobs({jobs,plumber,onSelect,viewDate,onDateChange,onRefresh}){
  const mj=jobs.filter(j=>j.assignee===plumber).sort((a,b)=>pt(a.timeStart)-pt(b.timeStart));
  const c=PC[plumber]||PC.Unknown;
  return(
    <div style={{padding:"16px",fontFamily:F}}>
      {/* Day picker for My Jobs */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,background:"#fff",border:"1px solid #e0e0e0",borderRadius:8,padding:"10px 14px",boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
        <button onClick={()=>{const d=new Date(viewDate);d.setDate(d.getDate()-1);onDateChange(d);}} style={{background:"#f1f3f4",border:"none",color:"#5f6368",width:32,height:32,borderRadius:"50%",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
        <input type="date" value={viewDate?.toISOString().split("T")[0]||new Date().toISOString().split("T")[0]} onChange={e=>onDateChange(new Date(e.target.value))}
          style={{flex:1,border:"1px solid #e0e0e0",borderRadius:6,padding:"6px 10px",fontSize:13,color:"#3c4043",fontFamily:F,outline:"none",background:"#f8f9fa"}}/>
        <button onClick={()=>{const d=new Date(viewDate);d.setDate(d.getDate()+1);onDateChange(d);}} style={{background:"#f1f3f4",border:"none",color:"#5f6368",width:32,height:32,borderRadius:"50%",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
        {viewDate?.toDateString()!==new Date().toDateString()&&<button onClick={()=>onDateChange(new Date())} style={{background:"#e8f0fe",border:"none",color:"#1a73e8",padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>Today</button>}
        <button onClick={onRefresh} style={{background:"#f1f3f4",border:"none",color:"#5f6368",padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:F}}>↻</button>
      </div>
      <div style={{fontSize:13,fontWeight:600,color:c.text,marginBottom:16,display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:c.dot}}/>{plumber} — {mj.length} job{mj.length!==1?"s":""}</div>
      {mj.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#9aa0a6",fontSize:14}}>No jobs scheduled today</div>}
      {mj.map(job=>{
        const s=STATUS_COLORS[job.status]||STATUS_COLORS.pending;const jcolor=jc(job.jobType);const act=["travelling","arrived","in-progress"].includes(job.status);
        return(
          <div key={job.id} onClick={()=>onSelect(job)} style={{background:act?s.bg:jcolor.bg,border:`1px solid ${act?s.border:jcolor.border}`,borderLeft:`4px solid ${act?s.border:jcolor.border}`,borderRadius:8,padding:"14px 16px",marginBottom:10,cursor:"pointer",boxShadow:act?"0 2px 8px rgba(0,0,0,0.15)":"0 1px 2px rgba(0,0,0,0.08)",transition:"all 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.2)"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow=act?"0 2px 8px rgba(0,0,0,0.15)":"0 1px 2px rgba(0,0,0,0.08)"}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:13,color:act?s.text:jcolor.text,fontWeight:700}}>{job.timeStart} – {job.timeEnd}</span>
              <span style={{fontSize:10,color:act?s.text:jcolor.text,fontWeight:600,background:"rgba(255,255,255,0.7)",border:`1px solid ${act?s.border:jcolor.border}`,borderRadius:12,padding:"2px 10px"}}>{s.label}</span>
            </div>
            <div style={{fontSize:15,color:"#202124",fontWeight:600,marginBottom:5,lineHeight:1.3}}>{job.address}</div>
            <div style={{fontSize:12,color:"#5f6368",marginBottom:job.tenantName?5:0,display:"flex",gap:10,flexWrap:"wrap"}}>
              <span>{job.jobType}</span>{job.ivNumber&&<><span>·</span><span>{job.ivNumber}</span></>}
              {job.workOrder?.keyNumber&&<span style={{color:"#e65100",fontWeight:600}}>Key #{job.workOrder.keyNumber}</span>}
              {job.workOrder?.spendLimit&&<span style={{color:"#c62828",fontWeight:600}}>{job.workOrder.spendLimit}</span>}
            </div>
            {job.brief&&<div style={{fontSize:12,color:"#80868b",marginBottom:4,fontStyle:"italic"}}>{job.brief}</div>}
            {job.isDuplicate&&<div style={{fontSize:11,color:"#e65100",fontWeight:600,marginBottom:4}}>↩ Follow-up / Return visit</div>}
            {job.tenantName&&<div style={{fontSize:12,color:"#5f6368"}}>Tenant{job.tenantNumber?` #${job.tenantNumber}`:""}: <span style={{color:"#1a73e8"}}>{job.tenantName} — {job.tenantPhone}</span></div>}
          </div>
        );
      })}
    </div>
  );
}

// ── Job Pool ──────────────────────────────────────────────────────────────
function JobPool({poolJobs,onSchedule,onSelect}){
  const [search,setSearch]=useState("");
  const [typeFilter,setType]=useState("All");
  const types=["All",...[...new Set(poolJobs.map(j=>j.jobType))]];
  const filtered=poolJobs.filter(j=>{
    const byT=typeFilter==="All"||j.jobType===typeFilter;
    const byS=!search||j.address.toLowerCase().includes(search.toLowerCase())||j.agentName?.toLowerCase().includes(search.toLowerCase());
    return byT&&byS;
  });
  return(
    <div style={{fontFamily:F}}>
      <div style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:8,padding:"14px 16px",marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search address or agent..."
            style={{flex:1,minWidth:180,border:"1px solid #e0e0e0",borderRadius:6,padding:"7px 12px",fontSize:13,color:"#3c4043",fontFamily:F,outline:"none",background:"#f8f9fa"}}/>
          <select value={typeFilter} onChange={e=>setType(e.target.value)} style={{border:"1px solid #e0e0e0",borderRadius:6,padding:"7px 10px",fontSize:12,color:"#3c4043",fontFamily:F,background:"#f8f9fa",outline:"none"}}>
            {types.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{marginTop:8,fontSize:12,color:"#80868b"}}>{filtered.length} unscheduled jobs</div>
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#9aa0a6",fontSize:14}}>No unscheduled jobs found</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:10}}>
        {filtered.map(job=>{
          const c=jc(job.jobType);const urgent=job.jobType==="Urgent";
          return(
            <div key={job.id} onClick={()=>onSelect(job)} style={{background:urgent?"#fff8f8":c.bg,border:`1px solid ${urgent?"#ef5350":c.border}`,borderRadius:8,padding:"12px 14px",boxShadow:"0 1px 2px rgba(0,0,0,0.08)",transition:"all 0.15s",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.15)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 2px rgba(0,0,0,0.08)"}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6,gap:8}}>
                <div style={{fontSize:13,fontWeight:600,color:urgent?"#b71c1c":c.text,lineHeight:1.3,flex:1}}>{urgent?"⚠ ":""}{job.address}</div>
                <div style={{fontSize:10,fontWeight:600,color:c.text,background:"rgba(255,255,255,0.7)",border:`1px solid ${c.border}`,borderRadius:12,padding:"2px 8px",whiteSpace:"nowrap",flexShrink:0}}>{job.jobType}</div>
              </div>
              {job.agentName&&<div style={{fontSize:11,color:"#5f6368",marginBottom:4}}>{job.agentName}{job.ivNumber?` · ${job.ivNumber}`:""}</div>}
              {job.notes&&<div style={{fontSize:11,color:"#80868b",marginBottom:8,lineHeight:1.4}}>{job.notes.slice(0,120)}{job.notes.length>120?"...":""}</div>}
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {job.tenantPhone&&<a href={`tel:${job.tenantPhone.replace(/\s/g,"")}`} onClick={e=>e.stopPropagation()} style={{fontSize:11,color:"#1a73e8",textDecoration:"none"}}>{job.tenantName||"Tenant"} {job.tenantPhone}</a>}
                <button onClick={e=>{e.stopPropagation();onSchedule(job);}} style={{marginLeft:"auto",background:"#1a73e8",color:"#fff",border:"none",borderRadius:16,padding:"4px 14px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F}}>Schedule</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Schedule Modal ────────────────────────────────────────────────────────
function ScheduleModal({job,onConfirm,onClose,defaultDate}){
  const [pl,setPl]=useState("Richie");
  const todayDef=defaultDate?defaultDate.toISOString().split("T")[0]:new Date().toISOString().split("T")[0];
  const [date,setDate]=useState(todayDef);
  const [start,setStart]=useState("09:00");
  const [end,setEnd]=useState("11:00");
  const [saving,setSaving]=useState(false);

  const confirm=async()=>{
    setSaving(true);
    // Create Calendar event
    try {
      const startDT=`${date}T${start}:00`;const endDT=`${date}T${end}:00`;
      const attendees=[
        {email:"vivaorganise@gmail.com"},
        {email:NAME_TO_EMAIL[pl]||"info@vivaplumbing.com"},
      ];
      // Build title with job type keyword
      const titleKeyword = job.jobType==="Quoted Work"?" QUOTED WORK":job.jobType==="Quote Only"?" QUOTE ONLY":job.jobType==="Return Visit"?" DUPLICATE":"";
      const tenantSuffix = job.tenantNumber ? ` #${job.tenantNumber}` : "";
      const eventTitle = `${job.address}${tenantSuffix}${titleKeyword}`;

      // Preserve original description if available, otherwise use template
      const originalDesc = job.rawEvent?.description || "";
      const templateDesc = originalDesc || `Notes:\n\n${job.notes||""}\n\n-----------------------------------\nTime     Depart:\nTime      Arrive:\nTime Complete:\n\nIs this job complete (Y/N/Not Sure):\n\nIs further action required - (Quote, Follow-up, Referral for additional work or Return visit?):\n\nJob Materials:\n\nJob Story:\n\n-----------------------------------\nQuote:\n\nLabour:\nMaterials:`;

      const event={
        summary: eventTitle,
        description: templateDesc,
        start:{dateTime:startDT,timeZone:"Australia/Brisbane"},
        end:{dateTime:endDT,timeZone:"Australia/Brisbane"},
        attendees,
      };
      const resp=await window.gapi.client.calendar.events.insert({calendarId:"primary",resource:event});
      const newJob={
        ...job,id:resp.result.id,calendarEventId:resp.result.id,
        assignee:pl,timeStart:start,timeEnd:end,status:"pending",
        actionLog:[],story:"",furtherAction:"",newArrivalTime:"",
        departedAt:null,arrivedAt:null,commencedAt:null,completedAt:null,
      };
      onConfirm(newJob);
    } catch(e) {
      console.error("Failed to create calendar event:",e);
      // Still add to local state even if calendar fails
      onConfirm({...job,id:"local_"+Date.now(),assignee:pl,timeStart:start,timeEnd:end,status:"pending",actionLog:[],story:"",furtherAction:"",newArrivalTime:"",departedAt:null,arrivedAt:null,commencedAt:null,completedAt:null});
    }
    setSaving(false);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
      <div style={{background:"#fff",borderRadius:12,maxWidth:440,width:"100%",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",fontFamily:F,overflow:"hidden"}}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid #e8eaed",background:"#f8f9fa"}}>
          <div style={{fontSize:11,fontWeight:600,color:"#80868b",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Schedule Job</div>
          <div style={{fontSize:14,fontWeight:600,color:"#202124"}}>{job.address}</div>
          <div style={{fontSize:12,color:"#5f6368",marginTop:2}}>{job.jobType}{job.agentName?` · ${job.agentName}`:""}</div>
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
          <div style={{display:"flex",gap:12}}>
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
          <button onClick={confirm} disabled={saving} style={{background:saving?"#9aa0a6":"#1a73e8",color:"#fff",border:"none",padding:"9px 24px",borderRadius:6,fontSize:13,fontWeight:600,cursor:saving?"not-allowed":"pointer",fontFamily:F}}>{saving?"Saving...":"Schedule Job"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Job Drawer ────────────────────────────────────────────────────────────
function Drawer({job,allJobs,onClose,onUpdate,user}){
  const nj=allJobs.filter(j=>j.assignee===job.assignee&&j.id!==job.id&&["pending","travelling"].includes(j.status)).sort((a,b)=>pt(a.timeStart)-pt(b.timeStart))[0]||null;
  const [notes,setNotes]=useState(job.notes||"");const [story,setStory]=useState(job.story||"");const [edited,setEdited]=useState(false);const [flags,setFlags]=useState([]);const [gen,setGen]=useState(false);const [showComp,setShowComp]=useState(false);const [fa,setFa]=useState(job.furtherAction||"");const [copied,setCopied]=useState(false);const [showDir,setShowDir]=useState(false);const [dirRead,setDirRead]=useState(false);const [showNext,setShowNext]=useState(false);const [ms,setMs]=useState(()=>initM(job.jobType));const [cust,setCust]=useState([]);const [showWO,setShowWO]=useState(false);
  const s=STATUS_COLORS[job.status]||STATUS_COLORS.pending;const c=PC[job.assignee]||PC.Unknown;const jcolor=jc(job.jobType);
  const al=(action)=>[...(job.actionLog||[]),{time:tn(),actor:job.assignee,action}];
  const upd=(id,u)=>onUpdate(id,u);
  const handleStart=()=>{upd(job.id,{status:"travelling",departedAt:tn(),actionLog:al("Departed for job")});if(job.calendarEventId)updateCalendarEvent(job.calendarEventId,{notes:`Departed: ${tn()}`});};
  const handleArr=()=>{const t=job.departedAt?td(job.departedAt,tn()):null;upd(job.id,{status:"arrived",arrivedAt:tn(),actionLog:al(`Arrived on site${t?" — travel "+t:""}`)});setShowDir(true);};
  const handleComm=()=>{upd(job.id,{status:"in-progress",commencedAt:tn(),actionLog:al("Work commenced")});setShowDir(false);};
  const handleComp=()=>{if(!fa)return;const wt=job.commencedAt?td(job.commencedAt,tn()):null;const updates={status:"ready-to-invoice",completedAt:tn(),story,notes,furtherAction:fa,actionLog:al(`Completed${wt?" — on tools "+wt:""} — ${fa}`)};upd(job.id,updates);if(job.calendarEventId)updateCalendarEvent(job.calendarEventId,{notes,story});setShowComp(false);if(nj)setShowNext(true);else onClose();};
  const handleNT=()=>{onUpdate(nj.id,{status:"travelling",departedAt:tn(),actionLog:[...(nj.actionLog||[]),{time:tn(),actor:nj.assignee,action:"Departed for job"}]});onClose();};
  const updM=(id,v)=>{if(id==="__c"){setCust(p=>[...p,v]);return;}setMs(p=>({...p,[id]:v}));};
  const genStory=async()=>{if(!notes.trim())return;setGen(true);setFlags([]);const mt=mToTxt(job.jobType,ms);const ct=cust.length?"\nOther: "+cust.join(", "):"";
    // Build query context if answers exist
    const qContext = Object.keys(queryAnswers).length > 0
      ? "\n\nPlumber clarifications:\n" + Object.entries(queryAnswers).map(([q,a])=>`${q}: ${a}`).join("\n")
      : "";
    try{const r=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:IP,messages:[{role:"user",content:`Job: ${job.jobType}\nAddress: ${job.address}\nAgency instructions: ${job.workOrder?.instructions||"None"}\nMaterials:\n${mt}${ct}\nNotes: ${notes}\n\nGenerate JSON.`}]})});
    const d=await r.json();const raw=d.content?.map(b=>b.text||"").join("\n")||"";
    try{const p=JSON.parse(raw.replace(/```json|```/g,"").trim());setStory(p.draft||raw);setFlags(p.flags||[]);setQueries(p.queries||[]);}catch{setStory(raw);}setEdited(false);}catch{setStory("Failed — try again.");}setGen(false);};
  const ti=[];
  if(job.departedAt)ti.push({l:"Departed",v:job.departedAt});
  if(job.arrivedAt)ti.push({l:"Arrived",v:job.arrivedAt,sub:job.departedAt?td(job.departedAt,job.arrivedAt):null});
  if(job.commencedAt)ti.push({l:"Commenced",v:job.commencedAt});
  if(job.completedAt)ti.push({l:"Completed",v:job.completedAt,sub:job.commencedAt?td(job.commencedAt,job.completedAt):null});
  const showM=["in-progress","ready-to-invoice","complete"].includes(job.status);const ql=["0","¼","½","¾","1"];
  const act=["travelling","arrived","in-progress"].includes(job.status);
  const headerBg=act?(s?.bg||"#fff3e0"):(jcolor?.bg||"#e8f0fe");const headerBorder=act?(s?.border||"#ffa726"):(jcolor?.border||"#4a7acc");
  const Btn=({bg,col,txt,onClick,dis})=><button onClick={onClick} disabled={dis} style={{flex:1,background:dis?"#e0e0e0":bg,border:"none",color:dis?"#9aa0a6":col,padding:"12px 0",fontSize:13,fontWeight:600,cursor:dis?"not-allowed":"pointer",fontFamily:F,borderRadius:6}}>{txt}</button>;
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex"}}>
      <div onClick={onClose} style={{flex:1,background:"rgba(0,0,0,0.4)"}}/>
      <div style={{width:"min(520px,100vw)",background:"#fff",borderLeft:"1px solid #e0e0e0",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:F,boxShadow:"-4px 0 20px rgba(0,0,0,0.15)"}}>
        <div style={{padding:"18px 20px",borderBottom:`3px solid ${headerBorder}`,background:headerBg,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:11,fontWeight:700,color:act?s.text:jcolor.text,background:"rgba(255,255,255,0.7)",border:`1px solid ${headerBorder}`,borderRadius:12,padding:"2px 10px"}}>{s.label}</span>
                <span style={{fontSize:11,color:c.text,fontWeight:600,background:"rgba(255,255,255,0.7)",border:`1px solid ${c.border}`,borderRadius:12,padding:"2px 10px"}}>{job.assignee}</span>
              </div>
              <div style={{fontSize:16,color:"#202124",fontWeight:700,lineHeight:1.3,marginBottom:4}}>{job.address}</div>
              <div style={{fontSize:12,color:"#5f6368",display:"flex",gap:10,flexWrap:"wrap"}}>
                <span>{job.timeStart}–{job.timeEnd}</span><span>·</span><span>{job.jobType}</span>
                {job.ivNumber&&<><span>·</span><span>{job.ivNumber}</span></>}
                {job.workOrder?.keyNumber&&<span style={{color:"#e65100",fontWeight:700}}>Key #{job.workOrder.keyNumber}</span>}
                {job.workOrder?.spendLimit&&<span style={{color:"#c62828",fontWeight:700}}>{job.workOrder.spendLimit}</span>}
              </div>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.8)",border:"1px solid #e0e0e0",color:"#5f6368",fontSize:16,cursor:"pointer",padding:"6px 12px",borderRadius:6,flexShrink:0}}>✕</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
          {ti.length>0&&<div style={{display:"flex",gap:0,flexWrap:"wrap",marginBottom:14,padding:"10px 14px",background:"#f8f9fa",border:"1px solid #e8eaed",borderRadius:8}}>
            {ti.map((t,i)=><div key={i} style={{marginRight:20,marginBottom:4}}><div style={{fontSize:10,fontWeight:600,color:"#80868b",textTransform:"uppercase",letterSpacing:"0.05em"}}>{t.l}</div><div style={{fontSize:13,color:"#3c4043",fontWeight:500,marginTop:2}}>{t.v}{t.sub&&<span style={{fontSize:11,color:"#9aa0a6"}}> ({t.sub})</span>}</div></div>)}
          </div>}
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            {job.tenantName&&<a href={`tel:${job.tenantPhone?.replace(/\s/g,"")}`} style={{fontSize:12,color:"#1a73e8",textDecoration:"none",background:"#e8f0fe",border:"1px solid #c5d8fb",borderRadius:20,padding:"6px 14px",display:"inline-flex",alignItems:"center",gap:5}}>📞 {job.tenantName}{job.tenantNumber?` #${job.tenantNumber}`:""} — {job.tenantPhone}</a>}
            {job.agentName&&<a href={`tel:${job.agentPhone?.replace(/\s/g,"")}`} style={{fontSize:12,color:"#188038",textDecoration:"none",background:"#e6f4ea",border:"1px solid #ceead6",borderRadius:20,padding:"6px 14px",display:"inline-flex",alignItems:"center",gap:5}}>🏢 {job.agentName} — {job.agentPhone}</a>}
          </div>
          {job.workOrder&&<div style={{marginBottom:14}}>
            <button onClick={()=>setShowWO(!showWO)} style={{background:"#f8f9fa",border:"1px solid #e8eaed",color:"#3c4043",padding:"8px 14px",fontSize:12,fontWeight:500,cursor:"pointer",borderRadius:8,display:"flex",alignItems:"center",gap:8,width:"100%",fontFamily:F}}>
              {showWO?"▲":"▼"} Work Order{job.workOrder.agency?` — ${job.workOrder.agency}`:""}
              {job.workOrder.spendLimit&&<span style={{color:"#c62828",fontWeight:700,marginLeft:4}}>{job.workOrder.spendLimit}</span>}
              {job.workOrder.hasPhotos&&<span>📷</span>}
              {job.workOrder.url&&<a href={job.workOrder.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{marginLeft:"auto",fontSize:11,color:"#1a73e8",background:"#e8f0fe",border:"1px solid #c5d8fb",borderRadius:12,padding:"2px 10px",textDecoration:"none",fontWeight:600}}>View PDF</a>}
            </button>
            {showWO&&<div style={{background:"#f8f9fa",border:"1px solid #e8eaed",borderRadius:8,padding:"14px",marginTop:6}}>
              {job.workOrder.keyNumber&&<div style={{marginBottom:8}}><span style={{fontSize:10,fontWeight:600,color:"#80868b",textTransform:"uppercase"}}>Key </span><span style={{color:"#e65100",fontWeight:700,fontSize:14}}>#{job.workOrder.keyNumber}</span></div>}
              {job.workOrder.instructions&&<div style={{fontSize:13,color:"#3c4043",lineHeight:1.6}}>{job.workOrder.instructions}</div>}
            </div>}
          </div>}
          {showDir&&<div style={{background:"#e6f4ea",border:"1px solid #81c995",borderRadius:8,padding:16,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:"#137333",marginBottom:10}}>📋 Work Directives — Read Before Commencing</div>
            {job.workOrder?.keyNumber&&<div style={{fontSize:13,marginBottom:6}}>Key: <span style={{color:"#e65100",fontWeight:700}}>#{job.workOrder.keyNumber}</span></div>}
            {job.workOrder?.spendLimit&&<div style={{fontSize:13,marginBottom:8}}>Spend limit: <span style={{color:"#c62828",fontWeight:700}}>{job.workOrder.spendLimit}</span></div>}
            <div style={{fontSize:13,color:"#1e4620",lineHeight:1.7,background:"rgba(255,255,255,0.7)",border:"1px solid #81c995",borderRadius:6,padding:"10px 12px",marginBottom:12}}>{job.workOrder?.instructions||job.notes||"No specific instructions provided."}</div>
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
                  <div onClick={tog} style={{flex:1,fontSize:13,color:sv.used?"#137333":"#3c4043",cursor:"pointer",fontWeight:sv.used?500:400}}>{m.name}</div>
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
          {showM&&!showDir&&<div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"#5f6368",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Job Notes</div>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} style={{width:"100%",minHeight:80,background:"#f8f9fa",border:"1px solid #e8eaed",borderRadius:8,color:"#3c4043",fontFamily:F,fontSize:13,lineHeight:1.6,padding:"10px 12px",resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
            <button onClick={genStory} disabled={gen} style={{marginTop:8,background:gen?"#f1f3f4":"#1a73e8",border:"none",color:gen?"#9aa0a6":"#fff",padding:"8px 18px",fontSize:12,fontWeight:600,cursor:gen?"not-allowed":"pointer",borderRadius:20,fontFamily:F}}>{gen?"Generating...":"⚡ Generate Invoice Story"}</button>
          </div>}
          {story&&<div style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:"#5f6368",textTransform:"uppercase",letterSpacing:"0.05em"}}>Invoice Draft {edited&&<span style={{color:"#f9ab00",fontSize:10,fontWeight:600}}>· edited</span>}</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={genStory} style={{background:"transparent",border:"1px solid #e0e0e0",color:"#5f6368",padding:"4px 12px",fontSize:11,fontWeight:500,cursor:"pointer",borderRadius:12,fontFamily:F}}>↺ Regenerate</button>
                <button onClick={()=>{navigator.clipboard.writeText(story);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:copied?"#e6f4ea":"#e8f0fe",border:`1px solid ${copied?"#81c995":"#c5d8fb"}`,color:copied?"#137333":"#1a73e8",padding:"4px 12px",fontSize:11,fontWeight:600,cursor:"pointer",borderRadius:12,fontFamily:F}}>{copied?"Copied ✓":"Copy"}</button>
              </div>
            </div>
            <textarea value={story} onChange={e=>{setStory(e.target.value);setEdited(true);}} style={{width:"100%",minHeight:140,background:"#f8f9fa",border:"1px solid #e8eaed",borderRadius:8,color:"#3c4043",fontFamily:mono,fontSize:12,lineHeight:1.75,padding:"12px 14px",resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
            {flags.length>0&&<div style={{marginTop:8,background:"#fef7e0",border:"1px solid #f9ab00",borderRadius:8,padding:"12px 14px"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#e37400",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>⚠ Review Before Sending</div>
              {flags.map((f,i)=><div key={i} style={{fontSize:12,color:"#b06000",lineHeight:1.6,marginBottom:i<flags.length-1?6:0,display:"flex",gap:8}}><span style={{color:"#f9ab00",flexShrink:0}}>—</span><span>{f}</span></div>)}
            </div>}
          </div>}
          {/* Query follow-up section */}
          {queries.length>0&&story&&<div style={{marginBottom:14}}>
            <div style={{background:"#e8f0fe",border:"1px solid #c5d8fb",borderRadius:8,padding:"14px"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#1a73e8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>
                💬 Quick Questions — Answer to improve the draft
              </div>
              {queries.map((q,qi)=>(
                <div key={qi} style={{marginBottom:12}}>
                  <div style={{fontSize:13,color:"#202124",fontWeight:500,marginBottom:6}}>{q.q}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {(q.options||[]).map((opt,oi)=>(
                      <button key={oi} onClick={()=>setQueryAnswers(p=>({...p,[q.q]:opt}))}
                        style={{background:queryAnswers[q.q]===opt?"#1a73e8":"#f1f3f4",border:"none",color:queryAnswers[q.q]===opt?"#fff":"#5f6368",padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:F}}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(queryAnswers).length>0&&(
                <button onClick={genStory} disabled={gen}
                  style={{marginTop:4,background:"#1a73e8",border:"none",color:"#fff",padding:"8px 20px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>
                  ↺ Regenerate with Answers
                </button>
              )}
            </div>
          </div>}

          {/* Photo picker */}
          {showM&&<div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"#5f6368",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>📷 Job Photos</div>
            <button onClick={()=>openDrivePicker(user?.token||"", (files)=>{
                setPhotoLinks(prev=>{
                  const existing = prev ? prev.split("\n").filter(Boolean) : [];
                  const newLinks = files.map(f=>f.url);
                  return [...existing,...newLinks].join("\n");
                });
              })}
              style={{background:"#e8f0fe",border:"1px solid #c5d8fb",color:"#1a73e8",padding:"8px 18px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <span>📁</span> Select from Google Drive / Photos
            </button>
            {photoLinks&&<div style={{background:"#f8f9fa",border:"1px solid #e8eaed",borderRadius:8,padding:"10px 12px"}}>
              {photoLinks.split("\n").filter(Boolean).map((link,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<photoLinks.split("\n").filter(Boolean).length-1?6:0}}>
                  <span style={{fontSize:11,color:"#9aa0a6",flexShrink:0}}>📎</span>
                  <a href={link} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#1a73e8",textDecoration:"none",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Photo {i+1}</a>
                  <button onClick={()=>setPhotoLinks(prev=>prev.split("\n").filter((l,li)=>li!==i).join("\n"))}
                    style={{background:"none",border:"none",color:"#ea4335",cursor:"pointer",fontSize:14,padding:"0 4px",flexShrink:0}}>✕</button>
                </div>
              ))}
            </div>}
            {!photoLinks&&<div style={{fontSize:11,color:"#9aa0a6"}}>No photos attached yet</div>}
          </div>}

          {showComp&&<div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"#5f6368",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Further Action Required?</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {["None","Quote Required","Follow-up","Return Visit","Referral"].map(opt=><button key={opt} onClick={()=>setFa(opt)} style={{background:fa===opt?"#ea4335":"#f1f3f4",border:"none",color:fa===opt?"#fff":"#5f6368",padding:"7px 16px",fontSize:12,fontWeight:600,cursor:"pointer",borderRadius:20,fontFamily:F}}>{opt}</button>)}
            </div>
          </div>}
          {showNext&&nj&&<div style={{background:"#e8f0fe",border:"1px solid #c5d8fb",borderRadius:8,padding:16,marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"#1a73e8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Next Job</div>
            <div style={{fontSize:14,color:"#202124",fontWeight:600,marginBottom:3}}>{nj.address}</div>
            <div style={{fontSize:12,color:"#5f6368",marginBottom:12}}>{nj.timeStart}–{nj.timeEnd} · {nj.jobType}</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={handleNT} style={{flex:1,background:"#1a73e8",border:"none",color:"#fff",padding:"10px 0",fontSize:13,fontWeight:600,cursor:"pointer",borderRadius:6,fontFamily:F}}>🚗 Start Travel Now</button>
              <button onClick={()=>{setShowNext(false);onClose();}} style={{background:"transparent",border:"1px solid #c5d8fb",color:"#1a73e8",padding:"10px 16px",fontSize:12,cursor:"pointer",borderRadius:6,fontFamily:F}}>Later</button>
            </div>
          </div>}
          {job.actionLog?.length>0&&<div style={{borderTop:"1px solid #e8eaed",paddingTop:12,marginTop:8}}>
            <div style={{fontSize:11,fontWeight:700,color:"#9aa0a6",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Action Log</div>
            {job.actionLog.map((e,i)=><div key={i} style={{fontSize:12,color:"#80868b",marginBottom:5,display:"flex",gap:12}}><span style={{color:"#9aa0a6",flexShrink:0,fontFamily:mono}}>{e.time}</span><span style={{color:"#9aa0a6",flexShrink:0}}>{e.actor}</span><span style={{color:"#5f6368"}}>{e.action}</span></div>)}
          </div>}
        </div>
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
  // Restore user from localStorage on mount
  const [user,setUser]=useState(()=>{
    try {
      const saved = localStorage.getItem("viva_user");
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  });
  const [viewDate,setViewDate]=useState(new Date());
  const [schedJobs,setSchedJobs]=useState([]);
  const [poolJobs,setPoolJobs]=useState([]);
  const [loading,setLoading]=useState(false);
  const [view,setView]=useState("board");
  const [myP,setMyP]=useState("Richie");
  const [sel,setSel]=useState(null);
  const [schedModal,setSchedModal]=useState(null);
  const [now,setNow]=useState(tn());
  const [lastSync,setLastSync]=useState(null);
  const checked=useRef(new Set());

  // Restore gapi token if user already signed in
  useEffect(()=>{
    if(user?.token) {
      const tryRestoreToken = () => {
        if(window.gapi?.client) {
          window.gapi.client.setToken({ access_token: user.token });
        } else {
          setTimeout(tryRestoreToken, 500);
        }
      };
      tryRestoreToken();
    }
  },[user]);

  // Load Google API scripts
  useEffect(()=>{
    const s1=document.createElement("script");s1.src="https://apis.google.com/js/api.js";
    s1.onload=()=>{window.gapi.load("client",async()=>{try{await window.gapi.client.init({discoveryDocs:[DISCOVERY_DOC]});}catch(e){console.error(e);}});};
    document.head.appendChild(s1);
    const s2=document.createElement("script");s2.src="https://accounts.google.com/gsi/client";document.head.appendChild(s2);
  },[viewDate]);

  // Fetch Calendar events
  const fetchCalendarJobs=useCallback(async(dateOverride)=>{
    if(!window.gapi?.client?.calendar)return;
    setLoading(true);
    try{
      const today=dateOverride||viewDate;
      const todayStr=today.toISOString().split("T")[0];
      // Get Sunday for pool jobs
      const dayOfWeek=today.getDay();
      const sunday=new Date(today);sunday.setDate(today.getDate()-(dayOfWeek===0?7:dayOfWeek));
      const sundayStr=sunday.toISOString().split("T")[0];
      const sundayEnd=new Date(sunday);sundayEnd.setDate(sunday.getDate()+1);
      const sundayEndStr=sundayEnd.toISOString().split("T")[0];
      // Today's events
      const todayStart=`${todayStr}T00:00:00+10:00`;
      const todayEnd=`${todayStr}T23:59:59+10:00`;
      const todayResp=await window.gapi.client.calendar.events.list({
        calendarId:"primary",timeMin:todayStart,timeMax:todayEnd,
        singleEvents:true,orderBy:"startTime",maxResults:50,
        fields:"items(id,summary,description,start,end,attendees,attachments)",
      });
      const todayEvents=(todayResp.result.items||[]).filter(e=>e.start?.dateTime||e.start?.date);
      setSchedJobs(processEvents(todayEvents));
      // Sunday pool events
      const sunResp=await window.gapi.client.calendar.events.list({
        calendarId:"primary",
        timeMin:`${sundayStr}T00:00:00+10:00`,
        timeMax:`${sundayEndStr}T00:00:00+10:00`,
        singleEvents:true,orderBy:"startTime",maxResults:100,
        fields:"items(id,summary,description,start,end,attendees,attachments)",
      });
      const sunEvents=(sunResp.result.items||[]).filter(e=>e.summary);
      setPoolJobs(processEvents(sunEvents));
      setLastSync(new Date().toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"}));
    }catch(e){console.error("Calendar fetch error:",e);}
    setLoading(false);
  },[]);

  // Refetch when viewDate changes
  useEffect(()=>{if(user){fetchCalendarJobs(viewDate);setMyP(user.name);}rno();},[user,viewDate]);

  const goToDate=(d)=>{
    const nd=new Date(d);
    setViewDate(nd);
  };
  const prevDay=()=>{const d=new Date(viewDate);d.setDate(d.getDate()-1);setViewDate(d);};
  const nextDay=()=>{const d=new Date(viewDate);d.setDate(d.getDate()+1);setViewDate(d);};
  const goToday=()=>setViewDate(new Date());

  // Late alert checker
  useEffect(()=>{
    const t=setInterval(()=>{const n=tn();setNow(n);const nm=pt(n);setSchedJobs(prev=>prev.map(j=>{if(j.status!=="pending"||checked.current.has(j.id))return j;if(nm>=pt(j.timeEnd)-30){checked.current.add(j.id);sno("Viva Jobs","Action required: "+j.address);return{...j,status:"late-alert"};}return j;}));},15000);
    return()=>clearInterval(t);
  },[]);

  const updJob=(id,u)=>{setSchedJobs(p=>p.map(j=>j.id===id?{...j,...u}:j));setSel(p=>p?.id===id?{...p,...u}:p);};
  const confirmSchedule=(newJob)=>{
    // Preserve work order and all metadata from the pool job
    const poolJob=schedModal;
    const merged={...newJob,workOrder:poolJob?.workOrder||newJob.workOrder,tenantName:poolJob?.tenantName||newJob.tenantName,tenantPhone:poolJob?.tenantPhone||newJob.tenantPhone,tenantNumber:poolJob?.tenantNumber||newJob.tenantNumber,agentName:poolJob?.agentName||newJob.agentName,agentPhone:poolJob?.agentPhone||newJob.agentPhone,ivNumber:poolJob?.ivNumber||newJob.ivNumber,notes:poolJob?.notes||newJob.notes};
    setSchedJobs(p=>[...p,merged]);
    setPoolJobs(p=>p.filter(j=>j.id!==schedModal?.id));
    setSchedModal(null);
  };

  const cnt={act:schedJobs.filter(j=>["travelling","arrived","in-progress"].includes(j.status)).length,late:schedJobs.filter(j=>j.status==="late-alert").length,inv:schedJobs.filter(j=>j.status==="ready-to-invoice").length};
  const todayLabel=viewDate.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"});
  const isToday=viewDate.toDateString()===new Date().toDateString();

  if(!user) return <SignIn onSignedIn={setUser}/>;

  return(
    <div style={{minHeight:"100vh",background:"#f8f9fa",fontFamily:F,color:"#202124"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <style>{`::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:#f1f3f4}::-webkit-scrollbar-thumb{background:#dadce0;border-radius:3px}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      {sel&&<Drawer job={sel} allJobs={schedJobs} onClose={()=>setSel(null)} onUpdate={updJob} user={user}/>}
      {schedModal&&<ScheduleModal job={schedModal} onConfirm={confirmSchedule} onClose={()=>setSchedModal(null)} defaultDate={viewDate}/>}
      {/* Header */}
      <div style={{background:"#fff",borderBottom:"1px solid #e8eaed",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:0,background:"#e05a2b",borderRadius:8,padding:"4px 10px"}}>
              <span style={{color:"#fff",fontSize:14,fontWeight:900,letterSpacing:"-0.5px"}}>VIVA</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",lineHeight:1}}>
              <span style={{fontSize:13,fontWeight:700,color:"#202124",letterSpacing:"-0.3px"}}>Plumbing</span>
              <span style={{fontSize:10,color:"#9aa0a6",letterSpacing:"0.05em",textTransform:"uppercase"}}>Job Manager</span>
            </div>
          </div>
          <span style={{fontSize:12,color:"#9aa0a6"}}>{todayLabel}</span>
        </div>
        <div style={{display:"flex",gap:12,fontSize:12,alignItems:"center"}}>
          <span style={{color:"#9aa0a6",fontFamily:mono}}>{now}</span>

          {cnt.late>0&&<span style={{color:"#ea4335",fontWeight:700,animation:"pulse 1.5s infinite"}}>⚠ {cnt.late} late</span>}
          {cnt.act>0&&<span style={{color:"#e37400",fontWeight:600}}>{cnt.act} active</span>}
          {cnt.inv>0&&<span style={{color:"#1a73e8",fontWeight:600}}>{cnt.inv} to invoice</span>}
          <span style={{background:"#fce8b2",color:"#b06000",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:12}}>{poolJobs.length} in pool</span>
          <div style={{display:"flex",alignItems:"center",gap:6,background:"#f1f3f4",borderRadius:20,padding:"4px 12px"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:(PC[user.name]||PC.Unknown).dot}}/>
            <span style={{fontSize:12,color:"#3c4043",fontWeight:500}}>{user.name}</span>
            <button onClick={()=>{localStorage.removeItem("viva_user");setUser(null);}} style={{background:"none",border:"none",color:"#9aa0a6",fontSize:11,cursor:"pointer",padding:"0 0 0 4px",fontFamily:F}}>✕</button>
          </div>
        </div>
      </div>
      {/* Nav */}
      <div style={{background:"#fff",borderBottom:"1px solid #e8eaed",padding:"0 24px",display:"flex",alignItems:"center"}}>
        {[{k:"board",l:"▦  Schedule Board"},{k:"myjobs",l:"☰  My Jobs"},{k:"pool",l:`📋  Job Pool (${poolJobs.length})`}].map(({k,l})=>(
          <button key={k} onClick={()=>setView(k)} style={{background:"transparent",border:"none",borderBottom:`3px solid ${view===k?"#1a73e8":"transparent"}`,color:view===k?"#1a73e8":"#5f6368",padding:"14px 18px",fontSize:13,fontWeight:view===k?700:500,cursor:"pointer",fontFamily:F,transition:"all 0.15s",marginBottom:-1}}>{l}</button>
        ))}
        {view==="myjobs"&&<div style={{marginLeft:"auto",display:"flex",gap:6,padding:"8px 0"}}>
          {TEAM.map(p=>{const c=PC[p];return<button key={p} onClick={()=>setMyP(p)} style={{background:myP===p?c.dot:"#f1f3f4",color:myP===p?"#fff":c.text,border:"none",borderRadius:20,padding:"6px 16px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>{p}</button>;})}
        </div>}
      </div>
      {/* Day navigation */}
      {view==="board"&&<div style={{background:"#fff",borderBottom:"1px solid #e8eaed",padding:"10px 24px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={prevDay} style={{background:"#f1f3f4",border:"none",color:"#5f6368",width:32,height:32,borderRadius:"50%",fontSize:16,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
        <input type="date" value={viewDate.toISOString().split("T")[0]} onChange={e=>goToDate(e.target.value)}
          style={{border:"1px solid #e0e0e0",borderRadius:6,padding:"6px 10px",fontSize:13,color:"#3c4043",fontFamily:F,outline:"none",background:"#f8f9fa",cursor:"pointer"}}/>
        <button onClick={nextDay} style={{background:"#f1f3f4",border:"none",color:"#5f6368",width:32,height:32,borderRadius:"50%",fontSize:16,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
        {!isToday&&<button onClick={goToday} style={{background:"#e8f0fe",border:"none",color:"#1a73e8",padding:"6px 16px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F}}>Today</button>}
        {loading&&<span style={{fontSize:12,color:"#1a73e8"}}>Loading...</span>}
        {lastSync&&!loading&&<span style={{fontSize:11,color:"#9aa0a6"}}>Synced {lastSync}</span>}
        <button onClick={()=>fetchCalendarJobs(viewDate)} style={{marginLeft:"auto",background:"none",border:"1px solid #e0e0e0",color:"#5f6368",padding:"5px 14px",borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:F}}>↻ Refresh</button>
      </div>}

      {/* Content */}
      <div style={{padding:"20px 24px",maxWidth:1400,margin:"0 auto"}}>
        {loading&&schedJobs.length===0&&<div style={{textAlign:"center",padding:"60px 0",color:"#9aa0a6"}}>
          <div style={{fontSize:32,marginBottom:12}}>📅</div>
          <div style={{fontSize:14,fontWeight:500}}>Loading your Calendar jobs...</div>
        </div>}
        {!loading&&schedJobs.length===0&&view==="board"&&<div style={{textAlign:"center",padding:"60px 0",color:"#9aa0a6"}}>
          <div style={{fontSize:32,marginBottom:12}}>📅</div>
          <div style={{fontSize:14,fontWeight:500,marginBottom:8}}>No jobs scheduled for today</div>
          <div style={{fontSize:12}}>Jobs from your Google Calendar will appear here</div>
        </div>}
        {(schedJobs.length>0||view!=="board")&&<>
          {view==="board"&&<Board jobs={schedJobs} onSelect={setSel}/>}
          {view==="myjobs"&&<MyJobs jobs={schedJobs} plumber={myP} onSelect={setSel} viewDate={viewDate} onDateChange={(d)=>{setViewDate(d);fetchCalendarJobs(d);}} onRefresh={()=>fetchCalendarJobs(viewDate)}/>}
          {view==="pool"&&<JobPool poolJobs={poolJobs} onSchedule={setSchedModal} onSelect={setSel}/>}
        </>}
      </div>
    </div>
  );
}
