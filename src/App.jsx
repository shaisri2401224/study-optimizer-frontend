import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import OverviewPage from './pages/OverviewPage';
import OptimizerPage from './pages/OptimizerPage';
import SubjectsPage from './pages/SubjectsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SchedulePage from './pages/SchedulePage';
import AlgorithmPage from './pages/AlgorithmPage';
import { fetchSubjects, fetchHistory, saveHistory } from './utils/api';

export default function App() {
  const [page, setPage] = useState('overview');
  const [subjects, setSubjects] = useState([]);
  const [strategy, setStrategy] = useState('weighted');
  const [totalHours, setTotalHours] = useState(12);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadSubjects();
    loadHistory();
  }, []);

  async function loadSubjects() {
    try {
      const data = await fetchSubjects();
      setSubjects(data || []);
      console.log('Subjects:', data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  }

  async function loadHistory() {
    try {
      const data = await fetchHistory();
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }

  function navigate(p) {
    setPage(p);
  }

  async function addHistory(run) {
    const saved = await saveHistory(run);
    setHistory((prev) => [...prev, saved]);
    showToast('Optimal plan: ' + run.picked.length + ' subjects, value ' + run.totalValue);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar active={page} onChange={navigate} runCount={history.length} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar page={page} subjects={subjects} result={result} />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          {page === 'overview' && (
            <OverviewPage
              subjects={subjects}
              result={result}
              strategy={strategy}
              onNavigate={navigate}
            />
          )}

          {page === 'optimizer' && (
            <OptimizerPage
              subjects={subjects}
              strategy={strategy}
              setStrategy={setStrategy}
              totalHours={totalHours}
              setTotalHours={setTotalHours}
              result={result}
              setResult={setResult}
              onHistoryAdd={addHistory}
            />
          )}

          {page === 'subjects' && (
            <SubjectsPage
              subjects={subjects}
              setSubjects={setSubjects}
              reloadSubjects={loadSubjects}
            />
          )}

          {page === 'analytics' && (
            <AnalyticsPage
              subjects={subjects}
              result={result}
              strategy={strategy}
            />
          )}

          {page === 'schedule' && (
            <SchedulePage
              subjects={subjects}
              result={result}
            />
          )}

          {page === 'algorithm' && (
            <AlgorithmPage
              subjects={subjects}
              totalHours={totalHours}
              strategy={strategy}
            />
          )}
        </main>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: 'var(--surface)',
            border: '1px solid var(--purple)',
            borderRadius: 'var(--r)',
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--purple)',
            boxShadow: '0 4px 24px rgba(124,111,255,0.3)',
            animation: 'fadeUp .3s ease',
          }}
        >
          ◈ {toast}
        </div>
      )}
    </div>
  );
}