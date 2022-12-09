import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Success from './components/Success';
import Login from './components/Login';
import RequireAuth from './components/RequireAuth';
import { WebAuthProvider } from './hooks/useWebAuth';
import './App.scss';

const App: React.FC<{}> = () => {
  return (
    <WebAuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/success" element={<RequireAuth>
              <Success />
            </RequireAuth>}
            />
            <Route
              path="*"
              element={<Navigate to="/success" replace />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </WebAuthProvider>
  );
}

export default App;