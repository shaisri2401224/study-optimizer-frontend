import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { computeValue, SCORE_HISTORY, WEEK_SCHEDULE } from '../utils/store';
Chart.register(...registerables);

export default function AnalyticsPage({ subjects, result, strategy }) {
  const selSet = result ? new Set(result.selected) : new Set();

  return (
    <div style={S.page} className="fade-in">
      <div style={S.grid2}>
        <ValueBarChart subjects={subjects} selSet={selSet} strategy={strategy} />
        <ScoreLineChart />
      </div>
      <div style={S.grid2}>
        <EfficiencyChart subjects={subjects} strategy={strategy} />
        <WeeklyLoadChart />
      </div>
      <div style={S.grid3}>
        <CategoryPieChart subjects={subjects} />
        <HoursDistChart subjects={subjects} />
        <PriorityHeatmap subjects={subjects} />
      </div>
    </div>
  );
}

/* ── Bar: Value per subject ── */
function ValueBarChart({ subjects, selSet, strategy }) {
  const ref = useRef(); const chart = useRef();
  useEffect(() => {
    if (!subjects.length) return;
    if (chart.current) chart.current.destroy();
    const ctx = ref.current.getContext('2d');
    chart.current = new Chart(ctx, {
      type:'bar',
      data:{
        labels: subjects.map(s=>s.name.length>9?s.name.slice(0,8)+'…':s.name),
        datasets:[{
          label:'Value Score',
          data: subjects.map((s,i)=>computeValue(s,strategy)),
          backgroundColor: subjects.map((_,i)=>selSet.has(i)?'rgba(124,111,255,0.8)':'rgba(93,101,128,0.4)'),
          borderColor:     subjects.map((_,i)=>selSet.has(i)?'#7C6FFF':'#5D6580'),
          borderWidth:1, borderRadius:6,
        },{
          label:'Hours',
          data: subjects.map(s=>s.hours),
          backgroundColor:'rgba(0,212,170,0.3)',
          borderColor:'#00D4AA', borderWidth:1, borderRadius:6,
          yAxisID:'y1',
        }],
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ labels:{ color:'#9BA3B8', font:{size:11} } } },
        scales:{
          x:{ ticks:{color:'#5D6580',font:{size:11}}, grid:{color:'rgba(255,255,255,0.04)'} },
          y:{ ticks:{color:'#5D6580',font:{size:11}}, grid:{color:'rgba(255,255,255,0.04)'} },
          y1:{ position:'right', ticks:{color:'#00D4AA',font:{size:11}}, grid:{drawOnChartArea:false} },
        },
      },
    });
    return ()=>chart.current?.destroy();
  },[subjects,selSet,strategy]);
  return (
    <div className="card">
      <ChartTitle title="Value Score vs Hours" sub="Purple = selected by optimizer" />
      <div style={{ height:220, position:'relative' }}><canvas ref={ref}/></div>
    </div>
  );
}

/* ── Line: Score history ── */
function ScoreLineChart() {
  const ref = useRef(); const chart = useRef();
  useEffect(()=>{
    if(chart.current) chart.current.destroy();
    const ctx = ref.current.getContext('2d');
    chart.current = new Chart(ctx,{
      type:'line',
      data:{
        labels: SCORE_HISTORY.map(r=>r.week),
        datasets:[
          { label:'Math',      data:SCORE_HISTORY.map(r=>r.math),      borderColor:'#7C6FFF', backgroundColor:'rgba(124,111,255,.08)', tension:.4, fill:true, pointRadius:4, pointBackgroundColor:'#7C6FFF' },
          { label:'Physics',   data:SCORE_HISTORY.map(r=>r.physics),   borderColor:'#00D4AA', backgroundColor:'rgba(0,212,170,.05)',   tension:.4, fill:false, pointRadius:4, pointBackgroundColor:'#00D4AA' },
          { label:'Chemistry', data:SCORE_HISTORY.map(r=>r.chemistry), borderColor:'#FFB547', backgroundColor:'rgba(255,181,71,.05)',  tension:.4, fill:false, pointRadius:4, pointBackgroundColor:'#FFB547' },
          { label:'English',   data:SCORE_HISTORY.map(r=>r.english),   borderColor:'#FF6B8A', backgroundColor:'rgba(255,107,138,.05)', tension:.4, fill:false, pointRadius:4, pointBackgroundColor:'#FF6B8A' },
        ],
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ labels:{ color:'#9BA3B8', font:{size:11}, boxWidth:12 } } },
        scales:{
          x:{ ticks:{color:'#5D6580',font:{size:11}}, grid:{color:'rgba(255,255,255,0.04)'} },
          y:{ min:50, ticks:{color:'#5D6580',font:{size:11}}, grid:{color:'rgba(255,255,255,0.04)'} },
        },
      },
    });
    return()=>chart.current?.destroy();
  },[]);
  return (
    <div className="card">
      <ChartTitle title="Score Progress Trend" sub="6-week improvement tracking" />
      <div style={{ height:220, position:'relative' }}><canvas ref={ref}/></div>
    </div>
  );
}

/* ── Horizontal bar: Efficiency ── */
function EfficiencyChart({ subjects, strategy }) {
  const ref = useRef(); const chart = useRef();
  const sorted = [...subjects].sort((a,b)=>computeValue(b,strategy)/b.hours - computeValue(a,strategy)/a.hours);
  useEffect(()=>{
    if(!sorted.length) return;
    if(chart.current) chart.current.destroy();
    const ctx = ref.current.getContext('2d');
    chart.current = new Chart(ctx,{
      type:'bar',
      data:{
        labels: sorted.map(s=>s.name.length>10?s.name.slice(0,9)+'…':s.name),
        datasets:[{
          label:'Value / Hour',
          data: sorted.map(s=>+(computeValue(s,strategy)/s.hours).toFixed(2)),
          backgroundColor: sorted.map((_,i)=>{
            const colors=['rgba(124,111,255,.8)','rgba(0,212,170,.8)','rgba(255,181,71,.8)','rgba(255,107,138,.8)','rgba(77,158,255,.8)','rgba(82,229,160,.8)'];
            return colors[i%colors.length];
          }),
          borderRadius:6,
        }],
      },
      options:{
        indexAxis:'y', responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{
          x:{ ticks:{color:'#5D6580',font:{size:11}}, grid:{color:'rgba(255,255,255,0.04)'} },
          y:{ ticks:{color:'#9BA3B8',font:{size:11}}, grid:{display:false} },
        },
      },
    });
    return()=>chart.current?.destroy();
  },[subjects,strategy]);
  return (
    <div className="card">
      <ChartTitle title="Efficiency Ranking" sub="Value gained per hour studied" />
      <div style={{ height:220, position:'relative' }}><canvas ref={ref}/></div>
    </div>
  );
}

/* ── Weekly load bar ── */
function WeeklyLoadChart() {
  const ref = useRef(); const chart = useRef();
  useEffect(()=>{
    if(chart.current) chart.current.destroy();
    const ctx = ref.current.getContext('2d');
    chart.current = new Chart(ctx,{
      type:'bar',
      data:{
        labels: WEEK_SCHEDULE.map(d=>d.day),
        datasets:[{
          label:'Study Hours',
          data: WEEK_SCHEDULE.map(d=>d.hours),
          backgroundColor: WEEK_SCHEDULE.map((_,i)=>i===new Date().getDay()-1?'rgba(124,111,255,0.9)':'rgba(93,101,128,0.4)'),
          borderColor: WEEK_SCHEDULE.map((_,i)=>i===new Date().getDay()-1?'#7C6FFF':'#5D6580'),
          borderWidth:1, borderRadius:8,
        }],
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{
          x:{ ticks:{color:'#9BA3B8',font:{size:12}}, grid:{display:false} },
          y:{ ticks:{color:'#5D6580',font:{size:11}}, grid:{color:'rgba(255,255,255,0.04)'} },
        },
      },
    });
    return()=>chart.current?.destroy();
  },[]);
  return (
    <div className="card">
      <ChartTitle title="Weekly Study Load" sub="Today highlighted in purple" />
      <div style={{ height:220, position:'relative' }}><canvas ref={ref}/></div>
    </div>
  );
}

/* ── Doughnut: Category breakdown ── */
function CategoryPieChart({ subjects }) {
  const ref = useRef(); const chart = useRef();
  const cats = [...new Set(subjects.map(s=>s.category))];
  const COLORS = ['#7C6FFF','#00D4AA','#FFB547','#FF6B8A','#4D9EFF','#52E5A0'];
  useEffect(()=>{
    if(!subjects.length) return;
    if(chart.current) chart.current.destroy();
    const ctx = ref.current.getContext('2d');
    chart.current = new Chart(ctx,{
      type:'doughnut',
      data:{
        labels: cats,
        datasets:[{ data: cats.map(c=>subjects.filter(s=>s.category===c).length), backgroundColor:cats.map((_,i)=>COLORS[i%COLORS.length]), borderWidth:0, hoverOffset:6 }],
      },
      options:{
        responsive:true, maintainAspectRatio:false, cutout:'65%',
        plugins:{ legend:{ position:'bottom', labels:{ color:'#9BA3B8', font:{size:11}, boxWidth:12, padding:12 } } },
      },
    });
    return()=>chart.current?.destroy();
  },[subjects]);
  return (
    <div className="card">
      <ChartTitle title="By Category" sub="Subject distribution" />
      <div style={{ height:200, position:'relative' }}><canvas ref={ref}/></div>
    </div>
  );
}

/* ── Hours distribution ── */
function HoursDistChart({ subjects }) {
  const ref = useRef(); const chart = useRef();
  useEffect(()=>{
    if(!subjects.length) return;
    if(chart.current) chart.current.destroy();
    const ctx = ref.current.getContext('2d');
    const bins = [0,0,0,0]; // 1-2h, 3-4h, 5-6h, 7+h
    subjects.forEach(s=>{ if(s.hours<=2) bins[0]++; else if(s.hours<=4) bins[1]++; else if(s.hours<=6) bins[2]++; else bins[3]++; });
    chart.current = new Chart(ctx,{
      type:'bar',
      data:{
        labels:['1-2h','3-4h','5-6h','7+h'],
        datasets:[{ label:'Subjects', data:bins, backgroundColor:['rgba(124,111,255,.8)','rgba(0,212,170,.8)','rgba(255,181,71,.8)','rgba(255,107,138,.8)'], borderRadius:6 }],
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{
          x:{ ticks:{color:'#9BA3B8',font:{size:11}}, grid:{display:false} },
          y:{ ticks:{color:'#5D6580',font:{size:11},stepSize:1}, grid:{color:'rgba(255,255,255,0.04)'} },
        },
      },
    });
    return()=>chart.current?.destroy();
  },[subjects]);
  return (
    <div className="card">
      <ChartTitle title="Hours Distribution" sub="How long each subject takes" />
      <div style={{ height:200, position:'relative' }}><canvas ref={ref}/></div>
    </div>
  );
}

/* ── Priority heatmap (simple grid) ── */
function PriorityHeatmap({ subjects }) {
  return (
    <div className="card">
      <ChartTitle title="Priority Matrix" sub="Hours vs Priority score" />
      <div style={{ height:200, position:'relative', paddingTop:10 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:4, alignContent:'flex-start' }}>
          {subjects.map(s=>{
            const size = 10 + s.hours * 5;
            const opacity = 0.3 + (s.priority/10)*0.7;
            return (
              <div key={s.id} title={`${s.name}: P${s.priority}, ${s.hours}h`} style={{
                width:size, height:size, borderRadius:4,
                background:`rgba(124,111,255,${opacity})`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:9, color:'#fff', fontWeight:700, cursor:'default',
                transition:'transform .2s',
              }} onMouseEnter={e=>e.target.style.transform='scale(1.3)'} onMouseLeave={e=>e.target.style.transform='scale(1)'}>
                {s.priority}
              </div>
            );
          })}
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text3)' }}>
          <span>Size = hours</span><span>Opacity = priority</span>
        </div>
      </div>
    </div>
  );
}

function ChartTitle({ title, sub }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:13, fontWeight:700, color:'var(--text1)' }}>{title}</div>
      <div style={{ fontSize:11, color:'var(--text3)' }}>{sub}</div>
    </div>
  );
}

const S = {
  page:  { padding:'1.5rem 1.75rem', display:'flex', flexDirection:'column', gap:'1rem' },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' },
  grid3: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' },
};
