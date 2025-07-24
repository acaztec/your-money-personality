import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Assessment from './pages/Assessment';
import Dashboard from './pages/Dashboard';
import Topics from './pages/Topics';
import Mindfulness from './pages/Mindfulness';
import Investing from './pages/Investing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/mindfulness" element={<Mindfulness />} />
        <Route path="/investing" element={<Investing />} />
      </Routes>
    </Router>
  );
}

export default App;