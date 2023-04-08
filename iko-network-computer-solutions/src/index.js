import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Navbar from './client/components/scripts/navbar';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Navbar/>
    <App />
  </React.StrictMode>
);

reportWebVitals();
