import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // <-- correct relative path
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
