import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Home from './components/Home';
import Test from './components/Test';
import HomePage from './pages/HomePage.jsx';

function App() {
  return (
    <BrowserRouter>
      {/* Navigation */}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}



export default App
