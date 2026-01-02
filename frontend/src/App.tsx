import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ClinicalInput from './components/ClinicalInput';
import Dashboard from './components/Dashboard';
import BDHVisualizer from './components/BDHVisualizer';
import Comparison from './components/Comparison';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ClinicalInput />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/internals" element={<BDHVisualizer />} />
          <Route path="/comparison" element={<Comparison />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
