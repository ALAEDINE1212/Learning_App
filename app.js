/* ═══════════════════════════════════════════════════
   FIREBASE INIT + REALTIME DATABASE
═══════════════════════════════════════════════════ */
const _fbConfig = {
  apiKey:            "AIzaSyAIw-xYztZMOgfd3x5WQIBFxZwQn1yVelE",
  authDomain:        "learning-902e9.firebaseapp.com",
  databaseURL:       "https://learning-902e9-default-rtdb.firebaseio.com",
  projectId:         "learning-902e9",
  storageBucket:     "learning-902e9.firebasestorage.app",
  messagingSenderId: "306555202551",
  appId:             "1:306555202551:web:6d8ab07298e64f83291cf2",
  measurementId:     "G-Z7QL6WZYJF"
};

firebase.initializeApp(_fbConfig);
const _fbDB  = firebase.database();
const _fbRef = _fbDB.ref("tracker/mlt_v3");
try { firebase.analytics(); } catch(_) {}

/* Storage shim — keeps all existing window.storage calls working,
   now backed by Firebase Realtime Database instead of localStorage  */
window.storage = {
  get:    async (key) => {
    const snap = await _fbDB.ref(`tracker/${key}`).once("value");
    const val  = snap.val();
    return val != null ? { value: val } : null;
  },
  set:    async (key, val) => _fbDB.ref(`tracker/${key}`).set(val),
  delete: async (key)      => _fbDB.ref(`tracker/${key}`).remove(),
};

/* ═══════════════════════════════════════════════════
   REACT / RECHARTS GLOBALS
═══════════════════════════════════════════════════ */
const { useState, useEffect, useRef, useCallback } = React;
const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } = window.Recharts || {};

/* ═══════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════ */
const PRAYER_KEYS = ["fajr","dhuhr","asr","maghrib","isha"];
const PRAYERS = [
  {key:"fajr",   name:"Fajr",    icon:"🌙"},
  {key:"dhuhr",  name:"Dhuhr",   icon:"☀️"},
  {key:"asr",    name:"Asr",     icon:"🌤️"},
  {key:"maghrib",name:"Maghrib", icon:"🌇"},
  {key:"isha",   name:"Isha",    icon:"✨"},
];
const GYM_TYPES = ["Weights","Cardio","HIIT","Football","Swimming","Yoga","Mixed","Other"];
const STATUSES  = ["Not Started","In Progress","Done"];

const PHASES = [
  {id:"Phase 1", label:"Foundation", color:"#22d3ee", dates:"14 Apr – 10 May", target:60},
  {id:"Phase 2", label:"Core ML",    color:"#f5c518", dates:"11 May – 21 Jun", target:90},
  {id:"Phase 3", label:"Projects",   color:"#fb923c", dates:"22 Jun – 9 Aug",  target:100},
  {id:"Phase 4", label:"Portfolio",  color:"#c084fc", dates:"10 Aug – 30 Sep", target:100},
];

const PC = {"Phase 1":"#22d3ee","Phase 2":"#f5c518","Phase 3":"#fb923c","Phase 4":"#c084fc"};
const SC = {"Done":"#4ade80","In Progress":"#22d3ee","Not Started":"#3f5570"};

const NIGHT_SHIFTS = [
  "20 Apr","28 Apr","6 May","14 May","22 May","30 May","7 Jun","15 Jun",
  "23 Jun","1 Jul","9 Jul","17 Jul","25 Jul","2 Aug","10 Aug","18 Aug",
  "26 Aug","3 Sep","11 Sep","19 Sep","27 Sep"
];

const WEEKLY_PLAN = [
  {w:"Week 1", d:"14/04/26",p:"Phase 1",topic:"Python basics, NumPy, Pandas intro",             resource:"Kaggle Python Micro-course"},
  {w:"Week 2", d:"21/04/26",p:"Phase 1",topic:"Statistics: mean, variance, distributions",      resource:"Khan Academy Statistics"},
  {w:"Week 3", d:"28/04/26",p:"Phase 1",topic:"Linear algebra: vectors, matrices",              resource:"3Blue1Brown Linear Algebra"},
  {w:"Week 4", d:"05/05/26",p:"Phase 1",topic:"Data viz with Matplotlib & Seaborn",             resource:"Kaggle Pandas Micro-course"},
  {w:"Week 5", d:"11/05/26",p:"Phase 2",topic:"Andrew Ng ML — regression + gradient descent",   resource:"ML Specialisation (Coursera)"},
  {w:"Week 6", d:"18/05/26",p:"Phase 2",topic:"Classification: logistic regression, KNN",       resource:"ML Specialisation (Coursera)"},
  {w:"Week 7", d:"25/05/26",p:"Phase 2",topic:"Decision trees, Random Forests",                 resource:"ML Specialisation (Coursera)"},
  {w:"Week 8", d:"01/06/26",p:"Phase 2",topic:"Exploratory Data Analysis deep dive",            resource:"Kaggle EDA"},
  {w:"Week 9", d:"08/06/26",p:"Phase 2",topic:"Model evaluation: accuracy, precision, F1",      resource:"ML Specialisation (Coursera)"},
  {w:"Week 10",d:"15/06/26",p:"Phase 2",topic:"First Kaggle competition (Titanic)",              resource:"Kaggle"},
  {w:"Week 11",d:"22/06/26",p:"Phase 3",topic:"Feature engineering + cross-validation",         resource:"Kaggle Feature Engineering"},
  {w:"Week 12",d:"29/06/26",p:"Phase 3",topic:"SVM, gradient boosting (XGBoost basics)",        resource:"Kaggle XGBoost course"},
  {w:"Week 13",d:"06/07/26",p:"Phase 3",topic:"Unsupervised: clustering, PCA",                  resource:"Hands-on ML (Géron book)"},
  {w:"Week 14",d:"13/07/26",p:"Phase 3",topic:"Real-world project: house price prediction",     resource:"Kaggle"},
  {w:"Week 15",d:"20/07/26",p:"Phase 3",topic:"Intro to neural networks (fast.ai lesson 1-3)",  resource:"fast.ai"},
  {w:"Week 16",d:"27/07/26",p:"Phase 3",topic:"SQL for data analysis",                          resource:"Mode SQL Tutorial"},
  {w:"Week 17",d:"03/08/26",p:"Phase 3",topic:"Portfolio project #2",                           resource:"GitHub / Kaggle"},
  {w:"Week 18",d:"10/08/26",p:"Phase 4",topic:"NLP basics: text classification, TF-IDF",        resource:"Kaggle NLP course"},
  {w:"Week 19",d:"17/08/26",p:"Phase 4",topic:"Time series data analysis project",              resource:"Kaggle Time Series"},
  {w:"Week 20",d:"24/08/26",p:"Phase 4",topic:"Model deployment: Streamlit or FastAPI",         resource:"Streamlit docs"},
  {w:"Week 21",d:"31/08/26",p:"Phase 4",topic:"Capstone project: end-to-end ML pipeline",       resource:"GitHub"},
  {w:"Week 22",d:"07/09/26",p:"Phase 4",topic:"Capstone continued + write-up",                  resource:"GitHub / LinkedIn"},
  {w:"Week 23",d:"14/09/26",p:"Phase 4",topic:"Interview prep: ML concepts + stats Qs",         resource:"DataLemur"},
  {w:"Week 24",d:"21/09/26",p:"Phase 4",topic:"Polish CV, LinkedIn, GitHub + apply",            resource:"LinkedIn / CV"},
];

const RESOURCES = [
  {id:"r1", name:"Kaggle Python Micro-course",                   platform:"Kaggle",           ph:"Phase 1",type:"Course",        cost:"Free"},
  {id:"r2", name:"Kaggle Pandas Micro-course",                   platform:"Kaggle",           ph:"Phase 1",type:"Course",        cost:"Free"},
  {id:"r3", name:"3Blue1Brown — Essence of Linear Algebra",      platform:"YouTube",          ph:"Phase 1",type:"Video",         cost:"Free"},
  {id:"r4", name:"Khan Academy Statistics",                      platform:"Khan Academy",     ph:"Phase 1",type:"Course",        cost:"Free"},
  {id:"r5", name:"Math for ML & Data Science (DeepLearning.AI)", platform:"Coursera",         ph:"Phase 1",type:"Specialisation",cost:"Audit/Aid"},
  {id:"r6", name:"ML Specialisation — Andrew Ng",                platform:"Coursera",         ph:"Phase 2",type:"Specialisation",cost:"Audit/Aid"},
  {id:"r7", name:"Scikit-learn official docs + examples",        platform:"scikit-learn.org", ph:"Phase 2",type:"Docs",          cost:"Free"},
  {id:"r8", name:"Kaggle Intro to ML + Intermediate ML",         platform:"Kaggle",           ph:"Phase 2",type:"Course",        cost:"Free"},
  {id:"r9", name:"Kaggle Feature Engineering course",            platform:"Kaggle",           ph:"Phase 3",type:"Course",        cost:"Free"},
  {id:"r10",name:"Kaggle XGBoost course",                        platform:"Kaggle",           ph:"Phase 3",type:"Course",        cost:"Free"},
  {id:"r11",name:"fast.ai — Practical Deep Learning",            platform:"fast.ai",          ph:"Phase 3",type:"Course",        cost:"Free"},
  {id:"r12",name:"Mode SQL Tutorial",                            platform:"mode.com",         ph:"Phase 3",type:"Tutorial",      cost:"Free"},
  {id:"r13",name:"Hands-on ML with Scikit-Learn & TF (Géron)",  platform:"Book",             ph:"Phase 3",type:"Book",          cost:"~£30"},
  {id:"r14",name:"Kaggle NLP Micro-course",                      platform:"Kaggle",           ph:"Phase 4",type:"Course",        cost:"Free"},
  {id:"r15",name:"Kaggle Time Series course",                    platform:"Kaggle",           ph:"Phase 4",type:"Course",        cost:"Free"},
  {id:"r16",name:"Deep Learning Specialisation — Andrew Ng",     platform:"Coursera",         ph:"Phase 4",type:"Specialisation",cost:"Audit/Aid"},
  {id:"r17",name:"Streamlit docs",                               platform:"streamlit.io",     ph:"Phase 4",type:"Docs",          cost:"Free"},
  {id:"r18",name:"DataLemur — ML interview questions",           platform:"datalemur.com",    ph:"Phase 4",type:"Practice",      cost:"Free"},
];

const PROJECTS = [
  {id:"p1",name:"Titanic Survival Prediction",        ph:"Phase 2",tools:"pandas, scikit-learn"},
  {id:"p2",name:"House Price Prediction (Kaggle)",    ph:"Phase 3",tools:"pandas, XGBoost, sklearn"},
  {id:"p3",name:"Portfolio Project #2 (your choice)", ph:"Phase 3",tools:""},
  {id:"p4",name:"Capstone: End-to-End ML Pipeline",   ph:"Phase 4",tools:"scikit-learn, Streamlit"},
  {id:"p5",name:"(Add your own)",                     ph:"",        tools:""},
  {id:"p6",name:"(Add your own)",                     ph:"",        tools:""},
];

const MILESTONES = [
  {id:"m1", action:"Set up GitHub profile + push first notebook",      ph:"Phase 1",due:"10 May"},
  {id:"m2", action:"Add Python, NumPy, Pandas to LinkedIn skills",     ph:"Phase 1",due:"10 May"},
  {id:"m3", action:"Complete Kaggle Python + Pandas certificates",     ph:"Phase 1",due:"10 May"},
  {id:"m4", action:"Push Titanic notebook to GitHub with README",      ph:"Phase 2",due:"21 Jun"},
  {id:"m5", action:"Add Machine Learning + scikit-learn to LinkedIn",  ph:"Phase 2",due:"21 Jun"},
  {id:"m6", action:"Post first LinkedIn update (what you built)",      ph:"Phase 2",due:"21 Jun"},
  {id:"m7", action:"Add SQL, XGBoost, EDA to LinkedIn skills",         ph:"Phase 3",due:"9 Aug"},
  {id:"m8", action:"Write LinkedIn case study for house price project", ph:"Phase 3",due:"9 Aug"},
  {id:"m9", action:"Update CV — Projects section (2 projects min.)",   ph:"Phase 3",due:"9 Aug"},
  {id:"m10",action:"Update CV — Technical Skills section",             ph:"Phase 4",due:"30 Sep"},
  {id:"m11",action:"Deploy capstone as Streamlit app (live link)",     ph:"Phase 4",due:"30 Sep"},
  {id:"m12",action:"Publish capstone write-up on LinkedIn",            ph:"Phase 4",due:"30 Sep"},
  {id:"m13",action:"Request 1 LinkedIn recommendation",                ph:"Phase 4",due:"30 Sep"},
  {id:"m14",action:"List 3 projects on CV with tools + outcomes",      ph:"Phase 4",due:"30 Sep"},
  {id:"m15",action:"Apply to at least 3 data/ML roles or internships", ph:"Phase 4",due:"30 Sep"},
];

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
const getKey      = (d = new Date()) => d.toISOString().split("T")[0];
const emptyDay    = () => ({ prayers:{}, study:[], gym:null, books:[] });
const addDays     = (d, n) => { const r = new Date(d); r.setDate(r.getDate()+n); return r; };
const prayersDone = l => PRAYER_KEYS.filter(k => (l?.prayers||{})[k]).length;
const studyMins   = l => (l?.study||[]).reduce((s,e) => s+(e.duration||0), 0);

function computeStreak(logs, fn) {
  let n = 0, d = new Date();
  for (let i = 0; i < 730; i++) {
    const l = { ...emptyDay(), ...(logs[getKey(d)] || {}) };
    if (fn(l)) { n++; d = addDays(d,-1); } else break;
  }
  return n;
}

function parseWeekDate(s) {
  const [dd,mm,yy] = s.split("/");
  return new Date(`20${yy}-${mm}-${dd}T12:00:00`);
}

function autoHoursForWeek(dateStr, dailyLog) {
  const start = parseWeekDate(dateStr);
  let t = 0;
  for (let i = 0; i < 7; i++) {
    const l = { ...emptyDay(), ...(dailyLog[getKey(addDays(start,i))] || {}) };
    t += studyMins(l);
  }
  return +(t/60).toFixed(2);
}

function effectiveHours(w, weeklyLog, dailyLog) {
  const m = weeklyLog[w.w]?.hours;
  if (m !== "" && m !== undefined && m !== null) return +m;
  return autoHoursForWeek(w.d, dailyLog);
}

function computeWeekStreak(weeklyLog) {
  let s = 0;
  for (const w of WEEKLY_PLAN) {
    if (weeklyLog[w.w]?.status === "Done") s++; else break;
  }
  return s;
}

function exportBackup(data) {
  const a = document.createElement("a");
  a.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data,null,2));
  a.download = `ml-tracker-backup-${getKey()}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/* ═══════════════════════════════════════════════════
   ANALYTICS HELPERS
═══════════════════════════════════════════════════ */
function getConsistencyPct(dailyLog, days = 30) {
  let studied = 0;
  for (let i = 0; i < days; i++) {
    const d = addDays(new Date(), -i);
    const l = { ...emptyDay(), ...(dailyLog[getKey(d)] || {}) };
    if (studyMins(l) > 0) studied++;
  }
  return Math.round((studied / days) * 100);
}

function getPrayerConsistencyPct(dailyLog, days = 30) {
  let full = 0;
  for (let i = 0; i < days; i++) {
    const d = addDays(new Date(), -i);
    const l = { ...emptyDay(), ...(dailyLog[getKey(d)] || {}) };
    if (prayersDone(l) === 5) full++;
  }
  return Math.round((full / days) * 100);
}

function getBestDayOfWeek(dailyLog) {
  const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const totals = new Array(7).fill(0);
  const counts = new Array(7).fill(0);
  for (let i = 0; i < 90; i++) {
    const d = addDays(new Date(), -i);
    const l = { ...emptyDay(), ...(dailyLog[getKey(d)] || {}) };
    const m = studyMins(l);
    if (m > 0) { totals[d.getDay()] += m; counts[d.getDay()]++; }
  }
  const avgs = totals.map((t, i) => counts[i] > 0 ? t / counts[i] : 0);
  const best = avgs.indexOf(Math.max(...avgs));
  return avgs[best] > 0 ? DAY_NAMES[best] : null;
}

function getTotalPages(dailyLog) {
  let total = 0;
  for (const key in dailyLog) {
    (dailyLog[key]?.books || []).forEach(b => { total += b.pages || 0; });
  }
  return total;
}

function getTotalGymSessions(dailyLog) {
  let total = 0;
  for (const key in dailyLog) {
    if (dailyLog[key]?.gym) total++;
  }
  return total;
}

function getLast7DayAvgStudy(dailyLog) {
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(new Date(), -i);
    const l = { ...emptyDay(), ...(dailyLog[getKey(d)] || {}) };
    total += studyMins(l);
  }
  return +(total / 7 / 60).toFixed(1);
}

function get30DayHeatmap(dailyLog) {
  return Array.from({ length: 30 }, (_, i) => {
    const d = addDays(new Date(), -29 + i);
    const l = { ...emptyDay(), ...(dailyLog[getKey(d)] || {}) };
    return { date: d, mins: studyMins(l), prayers: prayersDone(l), gym: !!l.gym, key: getKey(d) };
  });
}

const defWeekly   = () => Object.fromEntries(WEEKLY_PLAN.map(w  => [w.w,  {hours:"",status:"Not Started",notes:""}]));
const defRes      = () => Object.fromEntries(RESOURCES.map(r   => [r.id,  {status:"Not Started",notes:""}]));
const defProjects = () => Object.fromEntries(PROJECTS.map(p    => [p.id,  {status:"Not Started",startDate:"",githubLink:"",linkedIn:false,notes:"",tools:p.tools,name:p.name}]));
const defMiles    = () => Object.fromEntries(MILESTONES.map(m  => [m.id,  {done:false,notes:""}]));
const defFlash    = () => [];

/* ═══════════════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════════════ */
function SL({ children, style={} }) {
  return React.createElement("div", {
    className:"sl", style
  }, children);
}

function FL({ children }) {
  return React.createElement("div", { className:"fl" }, children);
}

function TRow({ label, right }) {
  return React.createElement("div", {
    style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}
  },
    React.createElement("span", {style:{fontSize:15,fontWeight:600,color:"var(--text)"}}, label),
    React.createElement("span", null, right)
  );
}

function Btn({ color, onClick, children, style={} }) {
  return React.createElement("button", {
    onClick,
    style:{
      background:`${color}18`, border:`1px solid ${color}44`,
      borderRadius:8, padding:"5px 11px",
      color, fontSize:12, fontWeight:600, ...style
    }
  }, children);
}

function Empty({ msg, color, onClick }) {
  return React.createElement("div", {
    onClick,
    className:"empty-state",
    style:{ border:`1.5px dashed ${color}44` }
  }, msg);
}

function LI({ color, title, meta, onRemove }) {
  return React.createElement("div", {
    className:"list-item",
    style:{ borderLeft:`3px solid ${color}` }
  },
    React.createElement("div", null,
      React.createElement("div", {style:{fontSize:14,fontWeight:600,color:"var(--text)"}}, title),
      meta && React.createElement("div", {style:{fontSize:12,color:"var(--muted)",marginTop:3}}, meta)
    ),
    React.createElement("button", {
      onClick:onRemove,
      style:{background:"none",border:"none",color:"var(--muted)",fontSize:20,padding:"2px 6px",lineHeight:1}
    }, "×")
  );
}

function ModalHeader({ title, onClose }) {
  return React.createElement("div", {
    style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}
  },
    React.createElement("div", {
      style:{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:"var(--text)"}
    }, title),
    React.createElement("button", {
      onClick:onClose,
      style:{background:"none",border:"none",color:"var(--muted)",fontSize:24,lineHeight:1}
    }, "×")
  );
}

function MF({ label, value, onChange, placeholder, type="text" }) {
  return React.createElement("div", {style:{marginBottom:14}},
    React.createElement(FL, null, label),
    React.createElement("input", {
      type, value:value||"",
      onChange:e=>onChange(e.target.value),
      placeholder,
      className:"inp"
    })
  );
}

function MSub({ onClick, label, color }) {
  return React.createElement("button", {
    onClick,
    style:{
      width:"100%", background:`${color}18`,
      border:`1px solid ${color}77`, borderRadius:11,
      padding:13, color, fontSize:14, fontWeight:700,
      fontFamily:"'Syne',sans-serif", marginTop:6
    }
  }, label);
}

function ProgBar({ pct, color="#22d3ee", height=6 }) {
  return React.createElement("div", {
    className:"prog-track", style:{height}
  },
    React.createElement("div", {
      className:"prog-fill",
      style:{width:`${Math.min(100,pct||0)}%`, background:color, height}
    })
  );
}

/* ═══════════════════════════════════════════════════
   ANIMATED NUMBER
═══════════════════════════════════════════════════ */
function AnimatedNumber({ value, decimals = 0, duration = 900, suffix = "" }) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = parseFloat(value) || 0;
    const startTime = performance.now();
    const startVal = 0;

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const next = +(startVal + (target - startVal) * eased).toFixed(decimals);
      setCurrent(next);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return React.createElement("span", null,
    decimals > 0 ? current.toFixed(decimals) : current,
    suffix
  );
}

/* ═══════════════════════════════════════════════════
   HEATMAP DOTS (last 30 days study activity)
═══════════════════════════════════════════════════ */
function HeatmapDots({ dailyLog }) {
  const cells = get30DayHeatmap(dailyLog);
  const [tooltip, setTooltip] = useState(null);

  function heatColor(mins) {
    if (mins === 0)   return "var(--border)";
    if (mins < 30)    return "#22d3ee22";
    if (mins < 60)    return "#22d3ee55";
    if (mins < 120)   return "#22d3ee99";
    return "#22d3ee";
  }

  return React.createElement("div", { style: { marginBottom: 24 } },
    React.createElement(SL, null, "Study Activity — Last 30 Days"),
    React.createElement("div", {
      style: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: "18px 16px" }
    },
      React.createElement("div", { className: "heatmap-wrap" },
        cells.map(day =>
          React.createElement("div", {
            key: day.key,
            className: "heatmap-cell",
            style: { background: heatColor(day.mins) },
            onMouseEnter: () => setTooltip(day),
            onMouseLeave: () => setTooltip(null),
          })
        )
      ),
      tooltip && React.createElement("div", {
        style: {
          marginTop: 10, fontSize: 12, color: "var(--text)",
          background: "var(--card2)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "7px 12px", lineHeight: 1.5
        }
      },
        React.createElement("b", null, tooltip.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })),
        ` — ${tooltip.mins}min study · ${tooltip.prayers}/5 prayers`,
        tooltip.gym ? " · 🏋️ gym" : ""
      ),
      React.createElement("div", {
        style: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 10 }
      },
        React.createElement("span", { style: { fontSize: 11, color: "var(--muted)" } }, "Less"),
        [0, 25, 60, 120, 180].map(v =>
          React.createElement("div", {
            key: v,
            style: { width: 12, height: 12, borderRadius: 3, background: heatColor(v) }
          })
        ),
        React.createElement("span", { style: { fontSize: 11, color: "var(--muted)" } }, "More")
      )
    )
  );
}

function StatusSel({ value, onChange }) {
  const col = SC[value] || "#3f5570";
  return React.createElement("select", {
    value, onChange:e=>onChange(e.target.value),
    className:"status-sel",
    style:{
      background:"var(--bg)", border:`1px solid ${col}44`,
      color:col
    }
  }, STATUSES.map(s => React.createElement("option",{key:s,value:s},s)));
}

/* ═══════════════════════════════════════════════════
   CLOUD BADGE  (sync status in sidebar)
═══════════════════════════════════════════════════ */
function CloudBadge({ status }) {
  const map = {
    loading: { icon:"⏳", label:"Connecting…",  color:"var(--muted)" },
    synced:  { icon:"☁️",  label:"Synced",        color:"#4ade80"      },
    saving:  { icon:"🔄", label:"Saving…",       color:"#22d3ee"      },
    offline: { icon:"📵", label:"Offline",        color:"#fb923c"      },
    error:   { icon:"⚠️", label:"Sync error",    color:"#f87171"      },
  };
  const s = map[status] || map.loading;
  return React.createElement("div", {
    style:{
      display:"flex", alignItems:"center", gap:6,
      background:"var(--card)", border:`1px solid ${s.color}33`,
      borderRadius:8, padding:"6px 10px", marginTop:12,
      transition:"all 0.3s"
    }
  },
    React.createElement("span",{style:{fontSize:13}}, s.icon),
    React.createElement("span",{style:{fontSize:11,fontWeight:600,color:s.color}}, s.label),
    status==="saving" && React.createElement("div",{
      style:{
        width:8,height:8,borderRadius:"50%",border:"2px solid #22d3ee",
        borderTopColor:"transparent",
        animation:"spin 0.6s linear infinite",marginLeft:2
      }
    })
  );
}

/* ═══════════════════════════════════════════════════
   DAILY INSIGHTS  (smart tips in Today tab)
═══════════════════════════════════════════════════ */
function DailyInsights({ dailyLog }) {
  const yl  = { ...emptyDay(), ...(dailyLog[getKey(addDays(new Date(),-1))] || {}) };
  const yStudy   = studyMins(yl);
  const yPrayers = prayersDone(yl);
  const streak   = computeStreak(dailyLog, l => studyMins(l) > 0);
  const bestDay  = getBestDayOfWeek(dailyLog);
  const totalPg  = getTotalPages(dailyLog);

  const insights = [];
  if (yStudy > 0)
    insights.push({ icon:"📚", color:"#22d3ee",
      text:`Yesterday: ${yStudy >= 60 ? (yStudy/60).toFixed(1)+"h" : yStudy+"min"} studied. Keep building on it!` });
  if (yPrayers === 5)
    insights.push({ icon:"🕌", color:"#f5c518", text:"You completed all 5 prayers yesterday. Excellent discipline!" });
  if (streak >= 2)
    insights.push({ icon:"🔥", color:"#fb923c", text:`${streak}-day study streak. Consistency is your superpower.` });
  if (bestDay)
    insights.push({ icon:"📅", color:"#c084fc", text:`Your most productive day is ${bestDay}. Schedule tough topics then.` });
  if (totalPg >= 50)
    insights.push({ icon:"📖", color:"#4ade80", text:`You've read ${totalPg} pages across all books. Great habit!` });

  if (insights.length === 0) return null;

  return React.createElement("div", { style:{ marginBottom:24 } },
    React.createElement("div",{
      style:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:"16px 18px"}
    },
      React.createElement("div",{style:{fontSize:11,fontWeight:700,color:"var(--muted)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}},"Daily Insights"),
      insights.slice(0,3).map((ins,i) =>
        React.createElement("div",{
          key:i,
          className:"float-up",
          style:{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<insights.slice(0,3).length-1?12:0,
            animationDelay:`${i*0.07}s`}
        },
          React.createElement("span",{style:{fontSize:20,flexShrink:0}}, ins.icon),
          React.createElement("div",{style:{fontSize:13,color:"var(--text)",lineHeight:1.55}}, ins.text)
        )
      )
    )
  );
}

/* ═══════════════════════════════════════════════════
   POMODORO
═══════════════════════════════════════════════════ */
function Pomodoro({ onComplete }) {
  const [timeLeft, setTimeLeft] = useState(25*60);
  const [active, setActive] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    let t;
    if (active && timeLeft > 0) {
      t = setInterval(() => setTimeLeft(n => n-1), 1000);
    } else if (active && timeLeft === 0) {
      setActive(false);
      setSessions(s => s+1);
      onComplete();
      setTimeLeft(25*60);
    }
    return () => clearInterval(t);
  }, [active, timeLeft]);

  const m = String(Math.floor(timeLeft/60)).padStart(2,"0");
  const s = String(timeLeft%60).padStart(2,"0");
  const pct = ((25*60 - timeLeft)/(25*60))*100;
  const C = 2*Math.PI*38;

  return React.createElement("div", { className:"pomodoro-card" },
    React.createElement("div", { style:{display:"flex",alignItems:"center",gap:18} },
      React.createElement("svg", { width:84, height:84, style:{transform:"rotate(-90deg)",flexShrink:0} },
        React.createElement("circle",{cx:42,cy:42,r:38,fill:"none",stroke:"var(--border)",strokeWidth:4}),
        React.createElement("circle",{cx:42,cy:42,r:38,fill:"none",
          stroke:active?"#f5c518":"#22d3ee",strokeWidth:4,
          strokeDasharray:C, strokeDashoffset:C-(pct/100)*C,
          strokeLinecap:"round", style:{transition:"stroke-dashoffset 1s linear"}
        })
      ),
      React.createElement("div", null,
        React.createElement("div",{style:{fontSize:10,fontWeight:700,color:active?"#f5c518":"#22d3ee",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:4}},
          active ? "Focusing..." : "Focus Timer"
        ),
        React.createElement("div",{style:{fontFamily:"'Syne',sans-serif",fontSize:34,fontWeight:800,color:"var(--text)",lineHeight:1,letterSpacing:"-0.02em"}},
          `${m}:${s}`
        ),
        sessions > 0 && React.createElement("div",{style:{fontSize:11,color:"var(--muted)",marginTop:4}},
          `${sessions} session${sessions>1?"s":""} today`
        )
      )
    ),
    React.createElement("div", { style:{display:"flex",flexDirection:"column",gap:8} },
      React.createElement("button",{
        onClick:()=>setActive(!active),
        style:{
          background:active?"#fb923c18":"#22d3ee18",
          border:`1px solid ${active?"#fb923c":"#22d3ee"}`,
          borderRadius:8, padding:"9px 18px",
          color:active?"#fb923c":"#22d3ee",
          fontWeight:700, fontSize:13
        }
      }, active?"Pause":"Start"),
      React.createElement("button",{
        onClick:()=>{setActive(false);setTimeLeft(25*60);},
        style:{background:"transparent",border:"1px solid var(--border)",borderRadius:8,padding:"7px 14px",color:"var(--muted)",fontSize:12}
      },"Reset")
    )
  );
}

/* ═══════════════════════════════════════════════════
   MODALS
═══════════════════════════════════════════════════ */
function StudyModal({ form, sf, onSubmit, onClose }) {
  const f = k => v => sf(p => ({...p,[k]:v}));
  return React.createElement(React.Fragment, null,
    React.createElement(ModalHeader, {title:"Log Study Session", onClose}),
    React.createElement(MF, {label:"Subject", value:form.subject, onChange:f("subject"), placeholder:"e.g. Python basics"}),
    React.createElement(MF, {label:"Duration (min)", type:"number", value:form.duration, onChange:f("duration"), placeholder:"60"}),
    React.createElement(MF, {label:"Notes (optional)", value:form.notes, onChange:f("notes"), placeholder:"What did you cover?"}),
    React.createElement(MSub, {onClick:onSubmit, label:"Save Session", color:"#22d3ee"})
  );
}

function GymModal({ form, sf, onSubmit, onClose }) {
  const f = k => v => sf(p => ({...p,[k]:v}));
  return React.createElement(React.Fragment, null,
    React.createElement(ModalHeader, {title:"Log Workout", onClose}),
    React.createElement("div", {style:{marginBottom:14}},
      React.createElement(FL, null, "Type"),
      React.createElement("div", {style:{display:"flex",flexWrap:"wrap",gap:6}},
        GYM_TYPES.map(t =>
          React.createElement("button", {
            key:t, onClick:()=>f("type")(t),
            style:{
              background:form.type===t?"#fb923c1a":"var(--bg)",
              border:`1px solid ${form.type===t?"#fb923c":"var(--border)"}`,
              borderRadius:7, padding:"6px 12px",
              color:form.type===t?"#fb923c":"var(--muted)",
              fontSize:12, fontWeight:600
            }
          }, t)
        )
      )
    ),
    React.createElement(MF, {label:"Duration (min)", type:"number", value:form.duration, onChange:f("duration"), placeholder:"60"}),
    React.createElement(MF, {label:"Notes (optional)", value:form.notes, onChange:f("notes"), placeholder:"e.g. Chest + Triceps"}),
    React.createElement(MSub, {onClick:onSubmit, label:"Save Workout", color:"#fb923c"})
  );
}

function BookModal({ form, sf, onSubmit, onClose }) {
  const f = k => v => sf(p => ({...p,[k]:v}));
  return React.createElement(React.Fragment, null,
    React.createElement(ModalHeader, {title:"Log Reading", onClose}),
    React.createElement(MF, {label:"Book / Article", value:form.title, onChange:f("title"), placeholder:"Title"}),
    React.createElement(MF, {label:"Pages Read", type:"number", value:form.pages, onChange:f("pages"), placeholder:"20"}),
    React.createElement(MF, {label:"Notes (optional)", value:form.notes, onChange:f("notes"), placeholder:"Key takeaways..."}),
    React.createElement(MSub, {onClick:onSubmit, label:"Save Reading", color:"#c084fc"})
  );
}

function CardModal({ form, sf, onSubmit, onClose }) {
  const f = k => v => sf(p => ({...p,[k]:v}));
  return React.createElement(React.Fragment, null,
    React.createElement(ModalHeader, {title:"New Flashcard", onClose}),
    React.createElement(MF, {label:"Question (Front)", value:form.front, onChange:f("front"), placeholder:"e.g. What is cross-validation?"}),
    React.createElement(MF, {label:"Answer (Back)", value:form.back, onChange:f("back"), placeholder:"A technique for evaluating model performance..."}),
    React.createElement(MSub, {onClick:onSubmit, label:"Add Flashcard", color:"#c084fc"})
  );
}

/* ═══════════════════════════════════════════════════
   TODAY TAB
═══════════════════════════════════════════════════ */
function TodayTab({ tl, togglePrayer, open, updDaily, githubUsername, dailyLog }) {
  const pCount = prayersDone(tl);
  const sMins  = studyMins(tl);
  const greeting = getGreeting();
  const gc = new Date().getHours() < 12 ? "#f5c518" : new Date().getHours() < 17 ? "#22d3ee" : "#c084fc";

  const [commits, setCommits] = useState(null);
  useEffect(() => {
    if (!githubUsername) return;
    fetch(`https://api.github.com/users/${githubUsername}/events/public`)
      .then(r => r.json())
      .then(evs => {
        const t = getKey();
        const count = evs
          .filter(e => e.type==="PushEvent" && e.created_at.startsWith(t))
          .reduce((a,e) => a + (e.payload.commits||[]).length, 0);
        setCommits(count);
      }).catch(() => setCommits(null));
  }, [githubUsername]);

  const statsRow = [
    {l:"Prayers",    v:`${pCount}/5`,  c:pCount===5?"#4ade80":"#f5c518"},
    {l:"Study",      v:sMins>=60?`${(sMins/60).toFixed(1)}h`:`${sMins}m`, c:sMins>0?"#22d3ee":"var(--muted)"},
    {l:"Gym",        v:tl.gym?"Done":"—", c:tl.gym?"#fb923c":"var(--muted)"},
    {l:"Git Commits",v:commits!==null?commits:(githubUsername?"...":"—"), c:commits>0?"#c084fc":"var(--muted)"},
  ];

  return React.createElement("div", null,
    /* Header */
    React.createElement("div", {style:{marginBottom:26}},
      React.createElement("div",{style:{fontSize:13,color:gc,fontWeight:600,marginBottom:4,letterSpacing:"0.04em"}}, greeting),
      React.createElement("div",{style:{fontFamily:"'Syne',sans-serif",fontSize:34,fontWeight:800,color:"var(--text)",lineHeight:1.1}},
        new Date().toLocaleDateString("en-GB",{weekday:"long"})
      ),
      React.createElement("div",{style:{fontSize:15,color:"var(--muted)",marginTop:5}},
        new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})
      )
    ),

    /* Daily Insights */
    dailyLog && React.createElement(DailyInsights, {dailyLog}),

    /* Pomodoro */
    React.createElement(Pomodoro, {onComplete:()=>open("study",{duration:25,subject:""})}),

    /* Quick stats */
    React.createElement("div", {className:"grid-4", style:{marginBottom:28}},
      statsRow.map(({l,v,c}) =>
        React.createElement("div", {key:l, className:"stat-card"},
          React.createElement("div",{className:"stat-val",style:{color:c}}, v),
          React.createElement("div",{className:"stat-lbl"}, l)
        )
      )
    ),

    /* Prayers */
    React.createElement("div", {style:{marginBottom:26}},
      React.createElement(TRow, {label:"🕌 Prayers", right:React.createElement("span",{style:{fontSize:13,color:pCount===5?"#4ade80":"var(--muted)",fontWeight:600}},`${pCount} of 5`)}),
      React.createElement("div", {className:"grid-prayers"},
        PRAYERS.map(p => {
          const done = !!tl.prayers[p.key];
          return React.createElement("button", {
            key:p.key,
            className:`prayer-btn${done?" done":""}`,
            onClick:()=>togglePrayer(p.key)
          },
            React.createElement("div",{style:{fontSize:18,marginBottom:3}}, p.icon),
            React.createElement("div",{style:{fontSize:11,fontWeight:700,color:done?"#f5c518":"var(--muted)",textTransform:"uppercase",letterSpacing:"0.04em"}}, p.name),
            done && React.createElement("div",{style:{fontSize:11,color:"#4ade80",marginTop:2}},"✓")
          );
        })
      )
    ),

    /* Study */
    React.createElement("div", {style:{marginBottom:22}},
      React.createElement(TRow, {label:"📚 Study", right:React.createElement(Btn,{color:"#22d3ee",onClick:()=>open("study")},"+ Add session")}),
      tl.study.length === 0
        ? React.createElement(Empty,{msg:"No study sessions yet",color:"#22d3ee",onClick:()=>open("study")})
        : tl.study.map(e => React.createElement(LI,{key:e.id,color:"#22d3ee",title:e.subject,meta:`${e.duration} min${e.notes?" · "+e.notes:""}`,onRemove:()=>updDaily({study:tl.study.filter(x=>x.id!==e.id)})}))
    ),

    /* Gym */
    React.createElement("div", {style:{marginBottom:22}},
      React.createElement(TRow, {label:"🏋️ Gym", right:React.createElement(Btn,{color:"#fb923c",onClick:()=>open("gym")},tl.gym?"Edit workout":"+ Log workout")}),
      !tl.gym
        ? React.createElement(Empty,{msg:"No workout logged",color:"#fb923c",onClick:()=>open("gym")})
        : React.createElement(LI,{color:"#fb923c",title:tl.gym.type,meta:`${tl.gym.duration} min${tl.gym.notes?" · "+tl.gym.notes:""}`,onRemove:()=>updDaily({gym:null})})
    ),

    /* Reading */
    React.createElement("div", {style:{marginBottom:22}},
      React.createElement(TRow, {label:"📖 Reading", right:React.createElement(Btn,{color:"#c084fc",onClick:()=>open("book")},"+ Add book")}),
      tl.books.length === 0
        ? React.createElement(Empty,{msg:"Nothing logged",color:"#c084fc",onClick:()=>open("book")})
        : tl.books.map(e => React.createElement(LI,{key:e.id,color:"#c084fc",title:e.title,meta:`${e.pages} pages${e.notes?" · "+e.notes:""}`,onRemove:()=>updDaily({books:tl.books.filter(x=>x.id!==e.id)})}))
    )
  );
}

/* ═══════════════════════════════════════════════════
   DASHBOARD TAB
═══════════════════════════════════════════════════ */
function DashTab({ data, exportFn, updateSettings, importFn }) {
  const importRef = React.useRef(null);
  const phaseStats = PHASES.map(ph => {
    const weeks  = WEEKLY_PLAN.filter(w => w.p === ph.id);
    const logged = +weeks.reduce((s,w) => s+effectiveHours(w,data.weeklyLog,data.dailyLog), 0).toFixed(1);
    const done   = weeks.filter(w => data.weeklyLog[w.w]?.status==="Done").length;
    return {...ph, logged, done, total:weeks.length, pct:Math.min(100,(logged/ph.target)*100)};
  });

  const totalHrs   = +phaseStats.reduce((s,p) => s+p.logged, 0).toFixed(1);
  const sesssDone  = WEEKLY_PLAN.filter(w => data.weeklyLog[w.w]?.status==="Done").length;
  const projsDone  = PROJECTS.filter(p => data.projects[p.id]?.status==="Done").length;
  const mDone      = MILESTONES.filter(m => data.milestones[m.id]?.done).length;
  const rDone      = RESOURCES.filter(r => data.resources[r.id]?.status==="Done").length;
  const avg        = sesssDone > 0 ? (totalHrs/sesssDone).toFixed(1) : "0";
  const nextWeek   = WEEKLY_PLAN.find(w => (data.weeklyLog[w.w]?.status||"Not Started") !== "Done");

  const prayerStreak = computeStreak(data.dailyLog, l => prayersDone(l)===5);
  const studyStreak  = computeStreak(data.dailyLog, l => l.study.length>0);
  const gymStreak    = computeStreak(data.dailyLog, l => !!l.gym);
  const weekStreak   = computeWeekStreak(data.weeklyLog);

  const weekChart = Array.from({length:7}, (_,i) => {
    const d = addDays(new Date(), -6+i);
    const l = {...emptyDay(), ...(data.dailyLog[getKey(d)] || {})};
    return {
      day: d.toLocaleDateString("en-GB",{weekday:"short"}),
      prayers: prayersDone(l),
      study: +(studyMins(l)/60).toFixed(1)
    };
  });

  return React.createElement("div", null,

    /* Key metrics */
    React.createElement(SL, null, "Key Metrics"),
    React.createElement("div", {className:"grid-4", style:{marginBottom:22}},
      [{l:"Total Hours",v:totalHrs,c:"#22d3ee",dec:1},{l:"Sessions Done",v:sesssDone,c:"#f5c518",dec:0},{l:"Avg h/session",v:avg,c:"#fb923c",dec:1},{l:"Projects Done",v:projsDone,c:"#c084fc",dec:0}].map(({l,v,c,dec}) =>
        React.createElement("div",{key:l,className:"stat-card"},
          React.createElement("div",{className:"stat-val",style:{color:c}},
            React.createElement(AnimatedNumber,{value:v,decimals:dec})
          ),
          React.createElement("div",{className:"stat-lbl"},l)
        )
      )
    ),

    /* Streaks */
    React.createElement(SL, null, "Streaks"),
    React.createElement("div", {className:"grid-streaks", style:{marginBottom:22}},
      [{l:"Full prayer days",v:prayerStreak,c:"#f5c518",i:"🕌"},
       {l:"Study days in a row",v:studyStreak,c:"#22d3ee",i:"📚"},
       {l:"Gym days in a row",v:gymStreak,c:"#fb923c",i:"🏋️"},
       {l:"Plan weeks done",v:weekStreak,c:"#c084fc",i:"📅"}].map(({l,v,c,i}) =>
        React.createElement("div",{key:l,className:"streak-card"},
          React.createElement("span",{style:{fontSize:24}},i),
          React.createElement("div",null,
            React.createElement("div",{className:"streak-val",style:{color:c}},
              React.createElement(AnimatedNumber,{value:v})
            ),
            React.createElement("div",{className:"streak-lbl"},`day${v!==1?"s":""} — ${l}`)
          )
        )
      )
    ),

    /* Phase progress */
    React.createElement(SL, null, "Phase Progress"),
    phaseStats.map(ph => {
      const fin = ph.pct >= 100;
      return React.createElement("div", {
        key:ph.id,
        style:{background:fin?"#4ade8008":"var(--card)",border:`1px solid ${fin?"#4ade8030":"var(--border)"}`,borderRadius:13,padding:"13px 15px",marginBottom:8}
      },
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}},
          React.createElement("div",null,
            React.createElement("span",{style:{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:fin?"#4ade80":ph.color}},ph.id),
            React.createElement("span",{style:{fontSize:11,color:"var(--muted)",marginLeft:8}},`${ph.label} — ${ph.dates}`),
            fin && React.createElement("span",{className:"cel",style:{marginLeft:8,fontSize:11,color:"#4ade80"}},"🎉 Complete!")
          ),
          React.createElement("span",{style:{fontSize:11,color:fin?"#4ade80":ph.color}},`${ph.logged}/${ph.target}h`)
        ),
        React.createElement(ProgBar,{pct:ph.pct, color:fin?"#4ade80":ph.color, height:6}),
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginTop:5}},
          React.createElement("span",{style:{fontSize:10,color:"var(--muted)"}},`${ph.done}/${ph.total} sessions`),
          React.createElement("span",{style:{fontSize:10,color:fin?"#4ade80":"var(--muted)"}},`${ph.pct.toFixed(0)}%`)
        )
      );
    }),

    /* Up next */
    nextWeek && React.createElement("div",{style:{marginTop:20,marginBottom:22}},
      React.createElement(SL,null,"Up Next"),
      React.createElement("div",{style:{background:"var(--card)",borderLeft:`3px solid ${PC[nextWeek.p]}`,border:`1px solid ${PC[nextWeek.p]}33`,borderRadius:13,padding:"14px 16px"}},
        React.createElement("div",{style:{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:PC[nextWeek.p],marginBottom:5}},`${nextWeek.w} — ${nextWeek.d} — ${nextWeek.p}`),
        React.createElement("div",{style:{fontSize:15,fontWeight:600,color:"var(--text)",marginBottom:4}},nextWeek.topic),
        React.createElement("div",{style:{fontSize:13,color:"var(--muted)"}},nextWeek.resource)
      )
    ),

    /* Mini stats */
    React.createElement("div",{className:"grid-2",style:{marginBottom:22}},
      [{l:"CV Milestones",v:mDone,tot:MILESTONES.length,c:"#4ade80"},
       {l:"Resources",v:rDone,tot:RESOURCES.length,c:"#22d3ee"}].map(({l,v,tot,c}) => {
        const fin = v===tot;
        return React.createElement("div",{key:l},
          React.createElement(SL,null,l),
          React.createElement("div",{style:{background:fin?"#4ade8008":"var(--card)",border:`1px solid ${fin?"#4ade8030":"var(--border)"}`,borderRadius:13,padding:"14px 16px"}},
            fin && React.createElement("div",{style:{fontSize:18,textAlign:"center",marginBottom:6}},"🎉"),
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:8}},
              React.createElement("span",{style:{fontSize:13,fontWeight:600}},`${v}/${tot}`),
              React.createElement("span",{style:{fontSize:12,color:c}},`${((v/tot)*100).toFixed(0)}%`)
            ),
            React.createElement(ProgBar,{pct:(v/tot)*100,color:c,height:5})
          )
        );
      })
    ),

    /* Charts */
    BarChart && React.createElement("div",null,
      React.createElement(SL,null,"Weekly Charts"),
      React.createElement("div",{style:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:"14px 14px 10px",marginBottom:16}},
        React.createElement("div",{style:{fontSize:10,fontWeight:600,color:"#f5c518",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}},"Prayers per day (last 7)"),
        React.createElement(ResponsiveContainer,{width:"100%",height:80},
          React.createElement(BarChart,{data:weekChart,barSize:18,margin:{top:0,bottom:0,left:-28,right:0}},
            React.createElement(XAxis,{dataKey:"day",tick:{fill:"#3f5570",fontSize:10},axisLine:false,tickLine:false}),
            React.createElement(YAxis,{domain:[0,5],tick:{fill:"#3f5570",fontSize:9},axisLine:false,tickLine:false}),
            React.createElement(Tooltip,{contentStyle:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:8,fontSize:12,color:"var(--text)"},cursor:false}),
            React.createElement(Bar,{dataKey:"prayers",radius:[4,4,0,0]},
              weekChart.map((e,i)=>React.createElement(Cell,{key:i,fill:e.prayers===5?"#f5c518":e.prayers>0?"#f5c51877":"var(--border)"}))
            )
          )
        ),
        React.createElement("div",{style:{fontSize:10,fontWeight:600,color:"#22d3ee",textTransform:"uppercase",letterSpacing:"0.08em",margin:"12px 0 8px"}},"Study hours per day (last 7)"),
        React.createElement(ResponsiveContainer,{width:"100%",height:80},
          React.createElement(BarChart,{data:weekChart,barSize:18,margin:{top:0,bottom:0,left:-28,right:0}},
            React.createElement(XAxis,{dataKey:"day",tick:{fill:"#3f5570",fontSize:10},axisLine:false,tickLine:false}),
            React.createElement(YAxis,{tick:{fill:"#3f5570",fontSize:9},axisLine:false,tickLine:false}),
            React.createElement(Tooltip,{contentStyle:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:8,fontSize:12,color:"var(--text)"},cursor:false}),
            React.createElement(Bar,{dataKey:"study",radius:[4,4,0,0]},
              weekChart.map((e,i)=>React.createElement(Cell,{key:i,fill:e.study>0?"#22d3ee":"var(--border)"}))
            )
          )
        )
      )
    ),

    /* Heatmap */
    React.createElement(HeatmapDots, {dailyLog: data.dailyLog}),

    /* Analytics */
    React.createElement(SL, null, "Deep Analytics"),
    React.createElement("div", {className:"grid-2", style:{marginBottom:10}},
      React.createElement("div", {className:"analytics-stat"},
        React.createElement("div", {className:"as-label"}, "30-Day Study Consistency"),
        React.createElement("div", {className:"as-value", style:{color:"#22d3ee"}},
          React.createElement(AnimatedNumber, {value:getConsistencyPct(data.dailyLog), suffix:"%"})
        ),
        React.createElement("div", {className:"as-sub"}, "of days with study logged")
      ),
      React.createElement("div", {className:"analytics-stat"},
        React.createElement("div", {className:"as-label"}, "30-Day Prayer Consistency"),
        React.createElement("div", {className:"as-value", style:{color:"#f5c518"}},
          React.createElement(AnimatedNumber, {value:getPrayerConsistencyPct(data.dailyLog), suffix:"%"})
        ),
        React.createElement("div", {className:"as-sub"}, "of days with all 5 prayers")
      )
    ),
    React.createElement("div", {className:"grid-2", style:{marginBottom:10}},
      React.createElement("div", {className:"analytics-stat"},
        React.createElement("div", {className:"as-label"}, "Best Study Day"),
        React.createElement("div", {className:"as-value", style:{color:"#fb923c"}},
          getBestDayOfWeek(data.dailyLog) || "—"
        ),
        React.createElement("div", {className:"as-sub"}, "highest avg. minutes (90 days)")
      ),
      React.createElement("div", {className:"analytics-stat"},
        React.createElement("div", {className:"as-label"}, "7-Day Avg. Study"),
        React.createElement("div", {className:"as-value", style:{color:"#4ade80"}},
          React.createElement(AnimatedNumber, {value:getLast7DayAvgStudy(data.dailyLog), decimals:1, suffix:"h"})
        ),
        React.createElement("div", {className:"as-sub"}, "avg. hours/day this week")
      )
    ),
    React.createElement("div", {className:"grid-2", style:{marginBottom:24}},
      React.createElement("div", {className:"analytics-stat"},
        React.createElement("div", {className:"as-label"}, "Total Pages Read"),
        React.createElement("div", {className:"as-value", style:{color:"#c084fc"}},
          React.createElement(AnimatedNumber, {value:getTotalPages(data.dailyLog)})
        ),
        React.createElement("div", {className:"as-sub"}, "pages logged across all books")
      ),
      React.createElement("div", {className:"analytics-stat"},
        React.createElement("div", {className:"as-label"}, "Total Gym Sessions"),
        React.createElement("div", {className:"as-value", style:{color:"#fb923c"}},
          React.createElement(AnimatedNumber, {value:getTotalGymSessions(data.dailyLog)})
        ),
        React.createElement("div", {className:"as-sub"}, "workouts logged all-time")
      )
    ),

    /* Night shifts */
    React.createElement(SL,{style:{marginTop:18}}, "Night Shifts (reduce study goals)"),
    React.createElement("div",{style:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:"14px 16px",marginBottom:22}},
      React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:6}},
        NIGHT_SHIFTS.map(s => React.createElement("span",{key:s,className:"shift-tag"},s))
      )
    ),

    /* GitHub + settings */
    React.createElement("div",{className:"grid-2",style:{marginBottom:22}},
      React.createElement("div",{style:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:16}},
        React.createElement(SL,null,"GitHub"),
        React.createElement("input",{
          value:data.settings?.githubUsername||"",
          onChange:e=>updateSettings({githubUsername:e.target.value}),
          placeholder:"Your GitHub username",
          className:"inp", style:{marginBottom:8}
        }),
        React.createElement("div",{style:{fontSize:11,color:"var(--muted)"}},"Shows daily commits on Today tab")
      ),
      React.createElement("div",{style:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:16}},
        React.createElement(SL,null,"Backup & Restore"),
        React.createElement("input",{ref:importRef,type:"file",accept:".json",style:{display:"none"},
          onChange:e=>{if(e.target.files[0]){importFn(e.target.files[0]);e.target.value="";}}
        }),
        React.createElement("button",{
          onClick:exportFn,
          style:{width:"100%",background:"#4ade8018",border:"1px solid #4ade8044",borderRadius:9,padding:"11px",color:"#4ade80",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:8}
        },"💾 Export backup (JSON)"),
        React.createElement("button",{
          onClick:()=>importRef.current?.click(),
          style:{width:"100%",background:"#22d3ee0d",border:"1px solid #22d3ee33",borderRadius:9,padding:"11px",color:"#22d3ee",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8}
        },"📥 Import backup (JSON)"),
        data.lastExportDate && React.createElement("div",{style:{fontSize:11,color:"var(--muted)",marginTop:8}},
          `Last export: ${new Date(data.lastExportDate).toLocaleDateString()}`
        )
      )
    )
  );
}

/* ═══════════════════════════════════════════════════
   PLAN TAB
═══════════════════════════════════════════════════ */
function PlanTab({ weeklyLog, updWeek, dailyLog }) {
  const [openW,  setOpenW]  = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const totalHrs = +WEEKLY_PLAN.reduce((s,w) => s+effectiveHours(w,weeklyLog,dailyLog), 0).toFixed(1);
  const totalDone = WEEKLY_PLAN.filter(w => weeklyLog[w.w]?.status==="Done").length;
  const overallPct = Math.round((totalDone/WEEKLY_PLAN.length)*100);

  return React.createElement("div", null,
    /* Header */
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
      React.createElement(SL,{style:{marginBottom:0}},"Weekly Study Plan"),
      React.createElement("span",{style:{fontSize:12,color:"var(--muted)"}},`${totalHrs}h logged`)
    ),

    /* Overall progress bar */
    React.createElement("div",{style:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:13,padding:"14px 16px",marginBottom:18}},
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:8}},
        React.createElement("span",{style:{fontSize:13,fontWeight:600,color:"var(--text)"}},"Overall Progress"),
        React.createElement("span",{style:{fontSize:13,fontWeight:700,color:"#4ade80"}},`${totalDone}/${WEEKLY_PLAN.length} weeks (${overallPct}%)`)
      ),
      React.createElement(ProgBar,{pct:overallPct,color:"linear-gradient(90deg,#22d3ee,#4ade80)",height:8})
    ),

    /* Filter row */
    React.createElement("div",{style:{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}},
      React.createElement("input",{
        value:search, onChange:e=>setSearch(e.target.value),
        placeholder:"Search topics...",
        style:{flex:1,minWidth:120,background:"var(--card)",border:"1px solid var(--border)",borderRadius:9,padding:"7px 12px",color:"var(--text)",fontSize:13}
      }),
      React.createElement("select",{
        value:filter, onChange:e=>setFilter(e.target.value),
        style:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:9,padding:"7px 10px",color:"var(--text)",fontSize:12}
      },
        React.createElement("option",{value:"All"},"All"),
        STATUSES.map(s=>React.createElement("option",{key:s,value:s},s))
      )
    ),

    /* Phases */
    PHASES.map(ph => {
      const allWeeks = WEEKLY_PLAN.filter(w => w.p===ph.id);
      const weeks = allWeeks.filter(w =>
        (filter==="All" || (weeklyLog[w.w]?.status||"Not Started")===filter) &&
        (!search || w.topic.toLowerCase().includes(search.toLowerCase()) || w.resource.toLowerCase().includes(search.toLowerCase()))
      );
      if (weeks.length === 0) return null;

      const phHrs  = +allWeeks.reduce((s,w) => s+effectiveHours(w,weeklyLog,dailyLog),0).toFixed(1);
      const phDone = allWeeks.filter(w => weeklyLog[w.w]?.status==="Done").length;
      const fin    = phDone === allWeeks.length;

      return React.createElement("div",{key:ph.id,style:{marginBottom:22}},
        /* Phase header */
        React.createElement("div",{
          style:{background:fin?"#4ade8010":`${ph.color}10`,border:`1px solid ${fin?"#4ade8033":ph.color+"33"}`,borderRadius:11,padding:"10px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}
        },
          React.createElement("div",null,
            React.createElement("span",{style:{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:fin?"#4ade80":ph.color}},`${ph.id} — ${ph.label}`),
            React.createElement("span",{style:{fontSize:11,color:"var(--muted)",marginLeft:8}},ph.dates),
            fin && React.createElement("span",{className:"cel",style:{marginLeft:8,fontSize:11,color:"#4ade80"}},"🎉 Complete!")
          ),
          React.createElement("span",{style:{fontSize:12,color:fin?"#4ade80":ph.color}},`${phDone}/${allWeeks.length} — ${phHrs}h/${ph.target}h`)
        ),

        /* Week rows */
        weeks.map(w => {
          const log  = weeklyLog[w.w] || {hours:"",status:"Not Started",notes:""};
          const auto = autoHoursForWeek(w.d, dailyLog);
          const sc   = SC[log.status] || SC["Not Started"];
          const isOpen = openW === w.w;
          const dispHrs = log.hours!=="" ? log.hours : auto>0 ? auto.toFixed(1) : "";

          return React.createElement("div",{key:w.w,className:"week-row"},
            /* Collapsed header row */
            React.createElement("div",{
              onClick:()=>setOpenW(isOpen?null:w.w),
              style:{padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10}
            },
              React.createElement("div",{style:{width:3,height:36,borderRadius:2,background:sc,flexShrink:0}}),
              React.createElement("div",{style:{flex:1,minWidth:0}},
                React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},
                  React.createElement("span",{style:{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:ph.color}},w.w),
                  React.createElement("span",{style:{fontSize:10,color:sc,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}},log.status)
                ),
                React.createElement("div",{style:{fontSize:14,fontWeight:500,color:"var(--text)",marginTop:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},w.topic),
                React.createElement("div",{style:{fontSize:12,color:"var(--muted)",marginTop:2}},`${w.d} — ${w.resource}${dispHrs?" — "+dispHrs+"h":""}`)
              ),
              React.createElement("span",{style:{color:"var(--muted)",fontSize:11,flexShrink:0}},isOpen?"▲":"▼")
            ),

            /* Expanded edit panel */
            isOpen && React.createElement("div",{style:{padding:"0 14px 14px",borderTop:"1px solid var(--border)"}},
              React.createElement("div",{style:{fontSize:12,color:"var(--muted)",margin:"10px 0 12px",lineHeight:1.6}},
                React.createElement("b",{style:{color:"var(--text)"}},"Resource: "),
                w.resource,
                auto>0 && React.createElement("span",{style:{marginLeft:10,color:"#22d3ee",fontSize:11}},`— auto from daily log: ${auto.toFixed(1)}h`)
              ),
              React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}},
                React.createElement("div",null,
                  React.createElement(FL,null,"Status"),
                  React.createElement("select",{
                    value:log.status, onChange:e=>updWeek(w.w,{status:e.target.value}),
                    style:{width:"100%",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 10px",color:SC[log.status],fontSize:12}
                  }, STATUSES.map(s=>React.createElement("option",{key:s},s)))
                ),
                React.createElement("div",null,
                  React.createElement(FL,null,"Hours (override)"),
                  React.createElement("input",{
                    type:"number", value:log.hours,
                    onChange:e=>updWeek(w.w,{hours:e.target.value}),
                    placeholder:auto>0?`Auto: ${auto.toFixed(1)}h`:"e.g. 3",
                    style:{width:"100%",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 10px",color:"var(--text)",fontSize:12}
                  })
                )
              ),
              React.createElement(FL,null,"Notes"),
              React.createElement("input",{
                value:log.notes||"", onChange:e=>updWeek(w.w,{notes:e.target.value}),
                placeholder:"Session notes...",
                style:{width:"100%",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 10px",color:"var(--text)",fontSize:12}
              })
            )
          );
        })
      );
    })
  );
}

/* ═══════════════════════════════════════════════════
   RESOURCES TAB
═══════════════════════════════════════════════════ */
function ResTab({ resources, updRes }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const done = RESOURCES.filter(r => resources[r.id]?.status==="Done").length;

  return React.createElement("div", null,
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}},
      React.createElement(SL,{style:{marginBottom:0}},"Courses & Resources"),
      React.createElement("span",{style:{fontSize:12,color:"#22d3ee",fontWeight:600}},`${done}/${RESOURCES.length}`)
    ),
    React.createElement(ProgBar,{pct:(done/RESOURCES.length)*100,color:"#22d3ee",height:5}),
    React.createElement("div",{style:{height:16}}),

    /* Filters */
    React.createElement("div",{style:{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}},
      React.createElement("input",{
        value:search, onChange:e=>setSearch(e.target.value),
        placeholder:"Search resources...",
        style:{flex:1,minWidth:120,background:"var(--card)",border:"1px solid var(--border)",borderRadius:9,padding:"7px 12px",color:"var(--text)",fontSize:13}
      }),
      React.createElement("select",{
        value:filter, onChange:e=>setFilter(e.target.value),
        style:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:9,padding:"7px 10px",color:"var(--text)",fontSize:12}
      },
        React.createElement("option",{value:"All"},"All"),
        STATUSES.map(s=>React.createElement("option",{key:s,value:s},s))
      )
    ),

    PHASES.map(ph => {
      const items = RESOURCES.filter(r =>
        r.ph===ph.id &&
        (filter==="All" || (resources[r.id]?.status||"Not Started")===filter) &&
        (!search || r.name.toLowerCase().includes(search.toLowerCase()) || r.platform.toLowerCase().includes(search.toLowerCase()))
      );
      if (!items.length) return null;

      return React.createElement("div",{key:ph.id,style:{marginBottom:22}},
        React.createElement("div",{style:{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:ph.color,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}},`${ph.id} — ${ph.label}`),
        items.map(r => {
          const res = resources[r.id] || {status:"Not Started",notes:""};
          const sc  = SC[res.status] || SC["Not Started"];
          return React.createElement("div",{
            key:r.id, className:"hover-row",
            style:{background:"var(--card)",border:"1px solid var(--border)",borderLeft:`3px solid ${sc}`,borderRadius:11,padding:"12px 14px",marginBottom:6,transition:"background 0.15s"}
          },
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}},
              React.createElement("div",{style:{flex:1}},
                React.createElement("div",{style:{fontSize:14,fontWeight:600,color:res.status==="Done"?"var(--muted)":"var(--text)",textDecoration:res.status==="Done"?"line-through":"none",marginBottom:4}},r.name),
                React.createElement("div",{style:{fontSize:12,color:"var(--muted)"}},`${r.platform} — `,
                  React.createElement("span",{style:{color:ph.color}},r.type),
                  ` — ${r.cost}`
                )
              ),
              React.createElement(StatusSel,{value:res.status,onChange:v=>updRes(r.id,{status:v})})
            ),
            React.createElement("input",{
              value:res.notes||"", onChange:e=>updRes(r.id,{notes:e.target.value}),
              placeholder:"Notes...",
              style:{marginTop:8,width:"100%",background:"transparent",border:"none",borderBottom:"1px solid var(--border)",padding:"3px 0",color:"var(--muted)",fontSize:11}
            })
          );
        })
      );
    })
  );
}

/* ═══════════════════════════════════════════════════
   PROJECTS TAB
═══════════════════════════════════════════════════ */
function ProjTab({ projects, updProj }) {
  const done = PROJECTS.filter(p => projects[p.id]?.status==="Done").length;

  return React.createElement("div", null,
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}},
      React.createElement(SL,{style:{marginBottom:0}},"Portfolio Projects"),
      React.createElement("span",{style:{fontSize:12,color:"#c084fc",fontWeight:600}},`${done}/${PROJECTS.length} done`)
    ),
    React.createElement(ProgBar,{pct:(done/PROJECTS.length)*100,color:"#c084fc",height:5}),
    React.createElement("div",{style:{height:18}}),

    PROJECTS.map(p => {
      const proj = projects[p.id] || {status:"Not Started",startDate:"",githubLink:"",linkedIn:false,notes:"",tools:p.tools,name:p.name};
      const sc   = SC[proj.status] || SC["Not Started"];
      return React.createElement("div",{
        key:p.id,
        style:{background:"var(--card)",border:"1px solid var(--border)",borderLeft:`3px solid ${PC[p.ph]||"var(--border)"}`,borderRadius:14,padding:16,marginBottom:12}
      },
        /* Name + status */
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:10}},
          React.createElement("input",{
            value:proj.name||p.name,
            onChange:e=>updProj(p.id,{name:e.target.value}),
            style:{flex:1,background:"transparent",border:"none",fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:"var(--text)",padding:0}
          }),
          React.createElement(StatusSel,{value:proj.status,onChange:v=>updProj(p.id,{status:v})})
        ),
        p.ph && React.createElement("div",{style:{fontSize:11,fontWeight:700,color:PC[p.ph],marginBottom:10}},p.ph),

        /* Tools + date */
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}},
          React.createElement("div",null,
            React.createElement(FL,null,"Tools Used"),
            React.createElement("input",{value:proj.tools||"",onChange:e=>updProj(p.id,{tools:e.target.value}),placeholder:"pandas, sklearn...",className:"inp"})
          ),
          React.createElement("div",null,
            React.createElement(FL,null,"Start Date"),
            React.createElement("input",{type:"date",value:proj.startDate||"",onChange:e=>updProj(p.id,{startDate:e.target.value}),className:"inp"})
          )
        ),

        /* GitHub */
        React.createElement(FL,null,"GitHub Link"),
        React.createElement("input",{value:proj.githubLink||"",onChange:e=>updProj(p.id,{githubLink:e.target.value}),placeholder:"https://github.com/...",className:"inp",style:{marginBottom:10}}),

        /* LinkedIn */
        React.createElement("label",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:"var(--muted)",marginBottom:8}},
          React.createElement("input",{type:"checkbox",checked:!!proj.linkedIn,onChange:e=>updProj(p.id,{linkedIn:e.target.checked}),style:{accentColor:"#22d3ee"}}),
          "LinkedIn post published"
        ),

        /* Notes */
        React.createElement(FL,null,"Notes"),
        React.createElement("input",{value:proj.notes||"",onChange:e=>updProj(p.id,{notes:e.target.value}),placeholder:"Notes, ideas, links...",className:"inp"})
      );
    })
  );
}

/* ═══════════════════════════════════════════════════
   GOALS / CV TAB
═══════════════════════════════════════════════════ */
function GoalsTab({ milestones, updMile }) {
  const done    = MILESTONES.filter(m => milestones[m.id]?.done).length;
  const allDone = done === MILESTONES.length;

  return React.createElement("div", null,
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}},
      React.createElement(SL,{style:{marginBottom:0}},"CV & LinkedIn Milestones"),
      React.createElement("span",{style:{fontSize:12,color:"#4ade80",fontWeight:600}},`${done}/${MILESTONES.length}`)
    ),
    React.createElement(ProgBar,{pct:(done/MILESTONES.length)*100,color:"#4ade80",height:6}),
    React.createElement("div",{style:{height:allDone?14:24}}),

    allDone && React.createElement("div",{
      className:"cel",
      style:{background:"#f5c51810",border:"1px solid #f5c51840",borderRadius:14,padding:"20px",marginBottom:24,textAlign:"center"}
    },
      React.createElement("div",{style:{fontSize:32,marginBottom:8}},"🏆"),
      React.createElement("div",{style:{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#f5c518",marginBottom:4}},"All milestones complete!"),
      React.createElement("div",{style:{fontSize:12,color:"var(--muted)"}},"You've finished your full CV & LinkedIn plan.")
    ),

    PHASES.map(ph => {
      const items = MILESTONES.filter(m => m.ph===ph.id);
      return React.createElement("div",{key:ph.id,style:{marginBottom:22}},
        React.createElement("div",{style:{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,color:ph.color,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}},
          `${ph.id} — ${ph.label} — Due ${items[0]?.due}`
        ),
        items.map(m => {
          const ms = milestones[m.id] || {done:false,notes:""};
          return React.createElement("div",{
            key:m.id,
            style:{background:"var(--card)",border:`1px solid ${ms.done?"#4ade8033":"var(--border)"}`,borderRadius:11,padding:"12px 14px",marginBottom:6,display:"flex",gap:10,alignItems:"flex-start",opacity:ms.done?0.7:1,transition:"opacity 0.2s"}
          },
            React.createElement("button",{
              onClick:()=>updMile(m.id,{done:!ms.done}),
              className:`mile-check${ms.done?" done":""}`
            }, ms.done?"✓":""),
            React.createElement("div",{style:{flex:1}},
              React.createElement("div",{style:{fontSize:14,fontWeight:600,color:"var(--text)",textDecoration:ms.done?"line-through":"none",marginBottom:4}},m.action),
              React.createElement("div",{style:{fontSize:12,color:"var(--muted)"}},"Target: ",m.due),
              React.createElement("input",{
                value:ms.notes||"",
                onChange:e=>updMile(m.id,{notes:e.target.value}),
                placeholder:"Add notes...",
                style:{marginTop:6,width:"100%",background:"transparent",border:"none",borderBottom:"1px solid var(--border)",padding:"3px 0",color:"var(--muted)",fontSize:11}
              })
            )
          );
        })
      );
    })
  );
}

/* ═══════════════════════════════════════════════════
   FLASHCARDS TAB
═══════════════════════════════════════════════════ */
function FlashTab({ flashcards, save, open }) {
  const today = getKey();
  const due   = flashcards.filter(c => c.nextReview <= today);
  const [active, setActive]   = useState(null);
  const [showBack, setShowBack] = useState(false);

  function processReview(rating) {
    let { ease, interval } = active;
    if (rating === 0)      { ease -= 0.2; interval = 0; }
    else if (rating === 1) { interval = interval===0 ? 1 : interval*ease*0.8; }
    else if (rating === 2) { interval = interval===0 ? 1 : interval===1 ? 6 : interval*ease; }
    else                   { ease += 0.15; interval = interval===0 ? 1 : interval===1 ? 6 : interval*ease*1.3; }
    ease = Math.max(1.3, ease);
    const next = getKey(addDays(new Date(), Math.max(1, Math.round(interval))));
    save(flashcards.map(c => c.id===active.id ? {...c,ease,interval,nextReview:next} : c));
    setActive(null); setShowBack(false);
  }

  if (active) {
    return React.createElement("div", null,
      React.createElement("button",{onClick:()=>{setActive(null);setShowBack(false);},style:{background:"none",border:"none",color:"var(--muted)",fontSize:13,marginBottom:20,padding:0}},
        "← Back"
      ),
      React.createElement("div",{style:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:30,minHeight:250,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",marginBottom:20}},
        React.createElement("div",{style:{fontSize:20,fontWeight:700,marginBottom:20}},active.front),
        showBack
          ? React.createElement("div",{style:{fontSize:16,color:"#22d3ee",borderTop:"1px solid var(--border)",paddingTop:20,width:"100%",textAlign:"center"}},active.back)
          : React.createElement("button",{
              onClick:()=>setShowBack(true),
              style:{background:"#22d3ee18",color:"#22d3ee",padding:"10px 22px",borderRadius:8,border:"1px solid #22d3ee44",fontWeight:700}
            },"Show Answer")
      ),
      showBack && React.createElement("div",{className:"grid-4",style:{gap:8}},
        [{r:0,l:"Again",c:"#f87171"},{r:1,l:"Hard",c:"#fb923c"},{r:2,l:"Good",c:"#4ade80"},{r:3,l:"Easy",c:"#22d3ee"}].map(({r,l,c})=>
          React.createElement("button",{key:r,onClick:()=>processReview(r),style:{padding:12,borderRadius:9,border:`1px solid ${c}44`,background:`${c}14`,color:c,fontWeight:700,fontSize:13}},l)
        )
      )
    );
  }

  return React.createElement("div", null,
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}},
      React.createElement(SL,{style:{marginBottom:0}},"Flashcards"),
      React.createElement(Btn,{color:"#c084fc",onClick:()=>open("card")},"+ New card")
    ),
    React.createElement("div",{style:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:14,padding:22,textAlign:"center",marginBottom:24}},
      React.createElement("div",{style:{fontFamily:"'Syne',sans-serif",fontSize:44,fontWeight:800,color:due.length>0?"#c084fc":"#4ade80",lineHeight:1}},due.length),
      React.createElement("div",{style:{fontSize:12,color:"var(--muted)",marginTop:6}},`card${due.length!==1?"s":""} due for review today`),
      due.length > 0 && React.createElement("button",{
        onClick:()=>setActive(due[0]),
        style:{marginTop:16,width:"100%",maxWidth:240,background:"#c084fc18",border:"1px solid #c084fc44",borderRadius:9,padding:"12px",color:"#c084fc",fontWeight:700,fontSize:13}
      },"Start Reviewing")
    ),
    flashcards.length > 0 && React.createElement(SL, null, `All Cards (${flashcards.length})`),
    flashcards.length === 0
      ? React.createElement(Empty,{msg:"No flashcards yet. Add ML concepts to review!",color:"#c084fc",onClick:()=>open("card")})
      : flashcards.map(c =>
          React.createElement("div",{key:c.id,style:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:11,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}},
            React.createElement("div",null,
              React.createElement("div",{style:{fontSize:13,fontWeight:600,color:"var(--text)"}},c.front),
              React.createElement("div",{style:{fontSize:11,color:"var(--muted)",marginTop:3}},`Next review: ${c.nextReview}`)
            ),
            React.createElement("button",{onClick:()=>save(flashcards.filter(x=>x.id!==c.id)),style:{background:"none",border:"none",color:"var(--muted)",fontSize:20,opacity:0.5}},"×")
          )
        )
  );
}

/* ═══════════════════════════════════════════════════
   MY PLANS TAB
═══════════════════════════════════════════════════ */
function MyPlansTab({ customPlans, addPlan, delPlan, updPlanRow }) {
  const fileRef = useRef(null);
  const [pending,   setPending]   = useState(null);
  const [planName,  setPlanName]  = useState("");
  const [active,    setActive]    = useState(null);
  const [expanded,  setExpanded]  = useState(null);

  const handleFile = e => {
    const file = e.target.files[0]; if (!file) return;
    const ext  = file.name.split(".").pop().toLowerCase();
    if (ext === "csv") {
      Papa.parse(file, {header:true,skipEmptyLines:true,complete:res=>{
        setPending({columns:res.meta.fields||[],rows:res.data.map((r,i)=>({_id:i,_done:false,_notes:"",...r}))});
        setPlanName(file.name.replace(/\.[^/.]+$/,""));
      }});
    } else if (["xlsx","xls"].includes(ext)) {
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const wb  = XLSX.read(ev.target.result,{type:"binary"});
          const ws  = wb.Sheets[wb.SheetNames[0]];
          const arr = XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
          if (arr.length < 2) return;
          const cols = arr[0].map(String);
          const rows = arr.slice(1).map((r,i)=>{const o={_id:i,_done:false,_notes:""};cols.forEach((c,ci)=>{o[c]=r[ci]!==undefined?String(r[ci]):"";});return o;});
          setPending({columns:cols,rows});
          setPlanName(file.name.replace(/\.[^/.]+$/,""));
        } catch{}
      };
      reader.readAsBinaryString(file);
    }
    e.target.value="";
  };

  const confirmAdd = () => {
    if (!pending||!planName.trim()) return;
    addPlan({id:Date.now(),name:planName.trim(),columns:pending.columns,rows:pending.rows,uploadDate:getKey()});
    setPending(null); setPlanName("");
  };

  if (active) {
    const plan = customPlans.find(p=>p.id===active);
    if (!plan) { setActive(null); return null; }
    const dc  = plan.rows.filter(r=>r._done).length;
    const pct = plan.rows.length > 0 ? ((dc/plan.rows.length)*100) : 0;
    const fin = dc===plan.rows.length && plan.rows.length>0;

    return React.createElement("div", null,
      React.createElement("button",{onClick:()=>{setActive(null);setExpanded(null);},style:{background:"none",border:"none",color:"var(--muted)",fontSize:13,marginBottom:18,padding:0}},"← Back to plans"),
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}},
        React.createElement("div",{style:{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"var(--text)"}},plan.name),
        React.createElement("span",{style:{fontSize:12,color:fin?"#4ade80":"#22d3ee"}},`${dc}/${plan.rows.length}`)
      ),
      React.createElement(ProgBar,{pct,color:fin?"#4ade80":"#22d3ee",height:5}),
      React.createElement("div",{style:{height:fin?12:20}}),
      fin && React.createElement("div",{className:"cel",style:{background:"#4ade8010",border:"1px solid #4ade8033",borderRadius:12,padding:14,marginBottom:18,textAlign:"center",fontSize:13,color:"#4ade80"}},"🎉 Plan complete!"),
      plan.rows.map(row => {
        const isExp = expanded===row._id;
        return React.createElement("div",{
          key:row._id,
          style:{background:"var(--card)",border:`1px solid ${row._done?"#22d3ee44":"var(--border)"}`,borderRadius:11,padding:"12px 14px",marginBottom:6,opacity:row._done?0.72:1}
        },
          React.createElement("div",{style:{display:"flex",gap:10,alignItems:"flex-start"}},
            React.createElement("button",{
              onClick:()=>updPlanRow(plan.id,row._id,{_done:!row._done}),
              style:{width:20,height:20,borderRadius:5,border:`2px solid ${row._done?"#22d3ee":"var(--muted)"}`,background:row._done?"#22d3ee":"transparent",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#060b14",fontWeight:700}
            }, row._done?"✓":""),
            React.createElement("div",{style:{flex:1}},
              plan.columns.map((col,ci)=>
                React.createElement("div",{key:col,style:{marginBottom:ci<plan.columns.length-1?3:0}},
                  React.createElement("span",{style:{fontSize:10,color:"var(--muted)",marginRight:4}},`${col}:`),
                  React.createElement("span",{style:{fontSize:ci===0?13:12,fontWeight:ci===0?600:400,color:ci===0?"var(--text)":"var(--muted)",textDecoration:row._done&&ci===0?"line-through":"none"}},row[col]||"—")
                )
              ),
              React.createElement("button",{
                onClick:()=>setExpanded(isExp?null:row._id),
                style:{background:"none",border:"none",color:row._notes?"#22d3ee":"var(--muted)",fontSize:11,padding:"5px 0 0",display:"flex",alignItems:"center",gap:4}
              }, `📝 ${isExp?"Hide notes":"Add notes"}${!isExp&&row._notes?" — "+row._notes:""}`),
              isExp && React.createElement("textarea",{
                value:row._notes||"",
                onChange:e=>updPlanRow(plan.id,row._id,{_notes:e.target.value}),
                placeholder:"Notes for this item...",
                rows:2,
                style:{width:"100%",marginTop:6,background:"var(--bg)",border:"1px solid var(--border)",borderRadius:7,padding:"7px 10px",color:"var(--text)",fontSize:12,resize:"vertical",fontFamily:"'DM Sans',sans-serif"}
              })
            )
          )
        );
      })
    );
  }

  return React.createElement("div", null,
    React.createElement(SL, null, "Upload a Plan"),
    React.createElement("input",{ref:fileRef,type:"file",accept:".csv,.xlsx,.xls",onChange:handleFile,style:{display:"none"}}),
    React.createElement("button",{
      onClick:()=>fileRef.current?.click(),
      style:{width:"100%",background:"#22d3ee0d",border:"1.5px dashed #22d3ee44",borderRadius:14,padding:18,color:"#22d3ee",fontSize:13,fontWeight:600,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:8}
    }, "📎 Upload CSV or Excel (.csv / .xlsx / .xls)"),

    pending && React.createElement("div",{style:{background:"var(--card)",border:"1px solid #22d3ee44",borderRadius:14,padding:16,marginBottom:20}},
      React.createElement("div",{style:{fontSize:12,color:"var(--muted)",marginBottom:10}},
        "Parsed ",React.createElement("b",{style:{color:"var(--text)"}},pending.rows.length)," rows — Columns: ",pending.columns.join(", ")
      ),
      React.createElement(FL,null,"Plan Name"),
      React.createElement("input",{
        value:planName, onChange:e=>setPlanName(e.target.value),
        style:{width:"100%",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 12px",color:"var(--text)",fontSize:13,marginBottom:12}
      }),
      React.createElement("div",{style:{display:"flex",gap:8}},
        React.createElement("button",{onClick:confirmAdd,style:{flex:1,background:"#22d3ee1a",border:"1px solid #22d3ee",borderRadius:10,padding:11,color:"#22d3ee",fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif"}},"Add Plan"),
        React.createElement("button",{onClick:()=>setPending(null),style:{flex:1,background:"transparent",border:"1px solid var(--border)",borderRadius:10,padding:11,color:"var(--muted)",fontSize:13}},"Cancel")
      )
    ),

    React.createElement(SL, null, `My Plans (${customPlans.length})`),
    customPlans.length===0 && !pending && React.createElement("div",{style:{textAlign:"center",color:"var(--muted)",fontSize:13,padding:"32px 0"}},"No plans yet. Upload any CSV or Excel file to start tracking."),
    customPlans.map(plan => {
      const d   = plan.rows.filter(r=>r._done).length;
      const pct = plan.rows.length>0 ? ((d/plan.rows.length)*100) : 0;
      const fin = d===plan.rows.length && plan.rows.length>0;
      return React.createElement("div",{
        key:plan.id,
        style:{background:"var(--card)",border:`1px solid ${fin?"#4ade8033":"var(--border)"}`,borderRadius:14,padding:16,marginBottom:10}
      },
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}},
          React.createElement("div",{style:{flex:1}},
            React.createElement("div",{style:{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:"var(--text)",marginBottom:3,display:"flex",alignItems:"center",gap:6}},
              plan.name, fin && React.createElement("span",{className:"cel",style:{fontSize:13,color:"#4ade80"}},"🎉")
            ),
            React.createElement("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:10}},`${plan.rows.length} items — ${plan.columns.length} columns — ${plan.uploadDate}`),
            React.createElement(ProgBar,{pct,color:fin?"#4ade80":"#22d3ee",height:5}),
            React.createElement("div",{style:{fontSize:11,color:fin?"#4ade80":"#22d3ee",marginTop:4}},`${d}/${plan.rows.length} done — ${pct.toFixed(0)}%`)
          ),
          React.createElement("button",{onClick:()=>delPlan(plan.id),style:{background:"none",border:"none",color:"var(--muted)",fontSize:20,marginLeft:10,padding:"0 4px",lineHeight:1}},"×")
        ),
        React.createElement("button",{onClick:()=>setActive(plan.id),style:{width:"100%",background:"transparent",border:"1px solid var(--border)",borderRadius:8,padding:8,color:"var(--muted)",fontSize:12,marginTop:12}},"Open Plan →")
      );
    })
  );
}

/* ═══════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════ */
function App() {
  const [tab,        setTab]        = useState("today");
  const [data,       setData]       = useState(null);
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState({});
  const [syncStatus, setSyncStatus] = useState("loading");
  const localTsRef = useRef(null); // tracks our own save timestamp to skip echo
  const today = getKey();

  /* Helper: build full data object from raw Firebase payload */
  function buildData(p) {
    return {
      weeklyLog:     { ...defWeekly(),   ...(p.weeklyLog   || {}) },
      resources:     { ...defRes(),      ...(p.resources   || {}) },
      projects:      { ...defProjects(), ...(p.projects    || {}) },
      milestones:    { ...defMiles(),    ...(p.milestones  || {}) },
      dailyLog:      p.dailyLog      || {},
      customPlans:   p.customPlans   || [],
      flashcards:    p.flashcards    || defFlash(),
      settings:      p.settings      || { githubUsername: "" },
      lastExportDate:p.lastExportDate|| null,
      _ts:           p._ts           || null,
    };
  }

  function defaultData() {
    return {
      weeklyLog:defWeekly(), resources:defRes(), projects:defProjects(),
      milestones:defMiles(), dailyLog:{}, customPlans:[], flashcards:defFlash(),
      settings:{githubUsername:""}, lastExportDate:null, _ts:null,
    };
  }

  /* Real-time Firebase listener + connection monitor */
  useEffect(() => {
    setSyncStatus("loading");

    // Connection status
    const connRef = _fbDB.ref(".info/connected");
    connRef.on("value", snap => {
      if (!snap.val()) setSyncStatus(s => s !== "loading" ? "offline" : s);
    });

    // Data listener — fires on load and on every remote change
    _fbRef.on("value", snap => {
      const raw = snap.val();
      try {
        if (!raw) { setData(defaultData()); setSyncStatus("synced"); return; }
        const p = JSON.parse(raw);
        // Skip if this is our own save echoed back from Firebase
        if (p._ts && p._ts === localTsRef.current) { setSyncStatus("synced"); return; }
        setData(buildData(p));
        setSyncStatus("synced");
      } catch { setSyncStatus("error"); }
    }, () => setSyncStatus("error"));

    return () => { _fbRef.off(); connRef.off(); };
  }, []);

  /* Save — writes to Firebase, falls back to localStorage if offline */
  const save = d => {
    const ts = Date.now();
    localTsRef.current = ts;
    const payload = { ...d, _ts: ts };
    setData(payload);
    setSyncStatus("saving");
    _fbRef.set(JSON.stringify(payload))
      .then(() => setSyncStatus("synced"))
      .catch(() => {
        // Offline fallback
        try { localStorage.setItem("mlt_v3_offline", JSON.stringify(payload)); } catch {}
        setSyncStatus("offline");
      });
  };

  /* Import backup (JSON file) → push to Firebase */
  const importBackup = file => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const p = JSON.parse(e.target.result);
        save(buildData(p));
      } catch { alert("Invalid backup file. Make sure it's a JSON exported from this app."); }
    };
    reader.readAsText(file);
  };

  if (!data) return React.createElement("div", {
    style:{background:"#060b14",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}
  },
    React.createElement("div",{className:"spinner"}),
    React.createElement("span",{style:{color:"#3f5570",fontFamily:"'DM Sans',sans-serif",fontSize:14}},"Loading...")
  );

  /* Daily log helpers */
  const tl = { ...emptyDay(), ...(data.dailyLog[today]||{}) };
  const updDaily = p => save({...data, dailyLog:{...data.dailyLog,[today]:{...tl,...p}}});
  const togglePrayer = k => updDaily({prayers:{...tl.prayers,[k]:!tl.prayers[k]}});

  /* Modal helpers */
  const open  = (type, payload={}) => { setForm(payload); setModal(type); };
  const close = () => { setModal(null); setForm({}); };

  const submitStudy = () => {
    if (!form.subject?.trim()) return;
    updDaily({study:[...tl.study,{id:Date.now(),subject:form.subject.trim(),duration:+form.duration||30,notes:form.notes||""}]});
    close();
  };
  const submitGym = () => {
    updDaily({gym:{done:true,type:form.type||"Weights",duration:+form.duration||60,notes:form.notes||""}});
    close();
  };
  const submitBook = () => {
    if (!form.title?.trim()) return;
    updDaily({books:[...tl.books,{id:Date.now(),title:form.title.trim(),pages:+form.pages||0,notes:form.notes||""}]});
    close();
  };
  const submitCard = () => {
    if (!form.front?.trim()||!form.back?.trim()) return;
    save({...data, flashcards:[...data.flashcards,{id:Date.now(),front:form.front.trim(),back:form.back.trim(),ease:2.5,interval:0,nextReview:getKey()}]});
    close();
  };

  /* Data updaters */
  const updWeek  = (w,p) => save({...data,weeklyLog: {...data.weeklyLog,  [w]: {...data.weeklyLog[w], ...p}}});
  const updRes   = (id,p) => save({...data,resources: {...data.resources,  [id]:{...data.resources[id],...p}}});
  const updProj  = (id,p) => save({...data,projects:  {...data.projects,   [id]:{...data.projects[id],...p}}});
  const updMile  = (id,p) => save({...data,milestones:{...data.milestones,[id]:{...data.milestones[id],...p}}});
  const addPlan  = pl    => save({...data,customPlans:[...(data.customPlans||[]),pl]});
  const delPlan  = id    => save({...data,customPlans:data.customPlans.filter(p=>p.id!==id)});
  const updPlanRow = (planId,rowId,p) => {
    const plans = data.customPlans.map(pl =>
      pl.id!==planId ? pl : {...pl,rows:pl.rows.map(r=>r._id===rowId?{...r,...p}:r)}
    );
    save({...data,customPlans:plans});
  };
  const updateSettings = p => save({...data,settings:{...data.settings,...p}});
  const doExport = () => {
    exportBackup(data);
    save({...data,lastExportDate:new Date().toISOString()});
  };

  const TABS = [
    {k:"today",     l:"📅 Today"},
    {k:"dashboard", l:"📊 Dashboard"},
    {k:"plan",      l:"🗓 Plan"},
    {k:"flash",     l:"🧠 Flashcards"},
    {k:"resources", l:"📖 Resources"},
    {k:"projects",  l:"🚀 Projects"},
    {k:"goals",     l:"🎯 CV & Goals"},
    {k:"myplans",   l:"📂 My Plans"},
  ];

  const modalContent = {
    study: React.createElement(StudyModal, {form,sf:setForm,onSubmit:submitStudy,onClose:close}),
    gym:   React.createElement(GymModal,   {form,sf:setForm,onSubmit:submitGym,  onClose:close}),
    book:  React.createElement(BookModal,  {form,sf:setForm,onSubmit:submitBook, onClose:close}),
    card:  React.createElement(CardModal,  {form,sf:setForm,onSubmit:submitCard, onClose:close}),
  };

  return React.createElement("div", {className:"app-wrapper"},
    React.createElement("div", {className:"app-inner"},

      /* Nav / Sidebar */
      React.createElement("div", {className:"nav-sidebar"},
        React.createElement("div", {className:"nav-header"},
          React.createElement("div",{style:{fontFamily:"'Syne',sans-serif",fontSize:9,fontWeight:700,letterSpacing:"0.22em",color:"var(--muted)",textTransform:"uppercase"}},"University of Bradford · Applied AI"),
          React.createElement("div",{style:{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"var(--text)",marginBottom:8,marginTop:4}},"ML Tracker"),
          React.createElement(CloudBadge, {status:syncStatus})
        ),
        React.createElement("nav", {className:"nav-tabs", style:{marginTop:16}},
          TABS.map(t =>
            React.createElement("button",{
              key:t.k,
              className:`nav-tab${tab===t.k?" active":""}`,
              onClick:()=>setTab(t.k)
            }, t.l)
          )
        )
      ),

      /* Main area */
      React.createElement("div", {className:"main-area"},
        React.createElement("div", {className:"main-content fade-up", key:tab},
          tab==="today"     && React.createElement(TodayTab,    {tl,togglePrayer,open,updDaily,githubUsername:data.settings?.githubUsername,dailyLog:data.dailyLog}),
          tab==="dashboard" && React.createElement(DashTab,     {data,exportFn:doExport,updateSettings,importFn:importBackup}),
          tab==="plan"      && React.createElement(PlanTab,     {weeklyLog:data.weeklyLog,updWeek,dailyLog:data.dailyLog}),
          tab==="flash"     && React.createElement(FlashTab,    {flashcards:data.flashcards,save:cards=>save({...data,flashcards:cards}),open}),
          tab==="resources" && React.createElement(ResTab,      {resources:data.resources,updRes}),
          tab==="projects"  && React.createElement(ProjTab,     {projects:data.projects,updProj}),
          tab==="goals"     && React.createElement(GoalsTab,    {milestones:data.milestones,updMile}),
          tab==="myplans"   && React.createElement(MyPlansTab,  {customPlans:data.customPlans,addPlan,delPlan,updPlanRow}),
        )
      )
    ),

    /* Modal */
    modal && React.createElement("div", {className:"modal-overlay",onClick:close},
      React.createElement("div", {className:"modal-sheet",onClick:e=>e.stopPropagation()},
        React.createElement("div", {className:"modal-drag"}),
        modalContent[modal] || null
      )
    )
  );
}

/* ═══════════════════════════════════════════════════
   MOUNT
═══════════════════════════════════════════════════ */
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
