import React from 'react';
import ReactDOM from 'react-dom/client';
import './theme/theme.css';
import './theme/components.css';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from './App';
import { ThemeProvider } from './theme/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App/>
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
