import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Cadastro from './Cadastro.jsx'
import Login from './Login.jsx'
import EditarPerfil from './EditarPerfil.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        <Route path="/perfil/editar" element={<EditarPerfil />} />
        <Route path="/" element={<Navigate to="/cadastro" replace />} />
        <Route path="*" element={<Navigate to="/cadastro" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
