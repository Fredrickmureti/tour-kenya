
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AdminAuthProvider } from './contexts/AdminAuthContext.tsx';

createRoot(document.getElementById("root")!).render(
  <AdminAuthProvider>
    <App />
  </AdminAuthProvider>
);
