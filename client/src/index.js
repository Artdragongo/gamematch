import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LangProvider } from './i18n/LangContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <LangProvider>
    <App />
  </LangProvider>
);
