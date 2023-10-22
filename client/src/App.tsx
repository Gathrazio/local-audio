import { Routes, Route, Navigate, BrowserRouter as Router } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import NavPage from './components/NavPage'
import AddPage from './components/AddPage'
import SearchPage from './components/SearchPage'
import Auth from './components/Auth'
import { useState } from 'react'

export default function App() {
  const [token, setToken] = useState('');

  const updateToken = (newToken: string): void => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
  }
  
  if (localStorage.getItem("token") != token) {
    setToken(localStorage.getItem("token") as string)
  }

  return (
    <div className="h-screen bg-gradient-to-r from-slate-700 to-slate-500">
      <Router>
        <Routes>
          <Route
            path="/"
            element={ token ? <Navigate to="/nav" /> : <Auth updateToken={updateToken}/>}
          />
          <Route
            path="/nav"
            element={
            <ProtectedRoute token={token} redirectTo="/">
              <NavPage updateToken={updateToken}/>
            </ProtectedRoute>}  
          />
          <Route
            path="/insert_document"
            element={
            <ProtectedRoute token={token} redirectTo="/">
              <AddPage />
            </ProtectedRoute>}  
          />
          <Route
            path="/search_documents"
            element={
            <ProtectedRoute token={token} redirectTo="/">
              <SearchPage />
            </ProtectedRoute>}  
          />
        </Routes>
      </Router>
    </div>
  )
}