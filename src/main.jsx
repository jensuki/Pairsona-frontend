import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import './styles/index.css';
// import App from './App.jsx';

// const root = ReactDOM.createRoot(document.getElementById('root'));

// root.render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// );
