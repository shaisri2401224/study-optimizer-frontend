// store.js — shared state across all dashboards

export const DEFAULT_SUBJECTS = [
  { id:1, name:'Mathematics',  hours:4, priority:9, score:90, urgency:2.0, category:'Science',   completed:false, sessions:3 },
  { id:2, name:'Physics',      hours:3, priority:8, score:80, urgency:1.6, category:'Science',   completed:false, sessions:2 },
  { id:3, name:'Chemistry',    hours:2, priority:7, score:70, urgency:1.3, category:'Science',   completed:true,  sessions:4 },
  { id:4, name:'English',      hours:2, priority:5, score:60, urgency:1.0, category:'Language',  completed:false, sessions:1 },
  { id:5, name:'History',      hours:3, priority:6, score:65, urgency:1.3, category:'Humanities',completed:false, sessions:2 },
  { id:6, name:'Biology',      hours:2, priority:7, score:75, urgency:1.6, category:'Science',   completed:false, sessions:3 },
  { id:7, name:'Economics',    hours:2, priority:6, score:72, urgency:1.0, category:'Humanities',completed:true,  sessions:2 },
];

export const URGENCY_MAP = { 1.0:'Low', 1.3:'Medium', 1.6:'High', 2.0:'Critical' };
export const URGENCY_COLOR = { 1.0:'pill-gray', 1.3:'pill-blue', 1.6:'pill-amber', 2.0:'pill-rose' };
export const CATEGORY_COLORS = {
  'Science':   { bg:'var(--purple-bg)', color:'var(--purple)' },
  'Language':  { bg:'var(--teal-bg)',   color:'var(--teal)'   },
  'Humanities':{ bg:'var(--amber-bg)',  color:'var(--amber)'  },
  'Math':      { bg:'var(--blue-bg)',   color:'var(--blue)'   },
  'Other':     { bg:'var(--bg4)',       color:'var(--text2)'  },
};

export function computeValue(subject, strategy='weighted') {
  const { priority, score, urgency } = subject;
  if (strategy === 'score')    return +(score * urgency).toFixed(1);
  if (strategy === 'priority') return +(priority * urgency * 10).toFixed(1);
  return +(priority * score * urgency / 10).toFixed(1);
}

export function knapsack(items, W, strategy='weighted') {
  const n = items.length;
  const dp = Array.from({length:n+1}, () => new Array(W+1).fill(0));
  for (let i=1;i<=n;i++) {
    const w = items[i-1].hours;
    const v = computeValue(items[i-1], strategy);
    for (let c=0;c<=W;c++) {
      dp[i][c] = dp[i-1][c];
      if (c>=w && dp[i-1][c-w]+v > dp[i][c]) dp[i][c] = dp[i-1][c-w]+v;
    }
  }
  const selected = [];
  let c = W;
  for (let i=n;i>=1;i--) {
    if (dp[i][c] !== dp[i-1][c]) { selected.push(i-1); c -= items[i-1].hours; }
  }
  return { dp, selected, totalValue: dp[n][W] };
}

export function efficiency(s, strategy) {
  return s.hours > 0 ? (computeValue(s,strategy)/s.hours).toFixed(2) : 0;
}

export const WEEK_SCHEDULE = [
  { day:'Mon', hours:3 }, { day:'Tue', hours:5 }, { day:'Wed', hours:2 },
  { day:'Thu', hours:6 }, { day:'Fri', hours:4 }, { day:'Sat', hours:7 }, { day:'Sun', hours:1 },
];

export const SCORE_HISTORY = [
  { week:'W1', math:62, physics:55, chemistry:70, english:80 },
  { week:'W2', math:68, physics:60, chemistry:72, english:78 },
  { week:'W3', math:71, physics:66, chemistry:75, english:82 },
  { week:'W4', math:75, physics:70, chemistry:78, english:84 },
  { week:'W5', math:80, physics:74, chemistry:80, english:83 },
  { week:'W6', math:85, physics:79, chemistry:82, english:86 },
];
