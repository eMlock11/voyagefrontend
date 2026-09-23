import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Cadastro from './pages/User/Cadastro';
import Login from './pages/User/Login';
import EditarPerfil from './pages/User/EditarPerfil';
import UserDashboard from './pages/User/UserDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Company from './pages/Company/Company';
import Payment from './pages/Payment/Payment';
import AddressMap from './pages/AddressMap/AddressMap';
import Configuracoes from './pages/Configuracoes/Configuracoes';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="voyage-theme">
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

        {/* 1. Rotas do Cliente / Usuário Comum */}
        <Route element={<ProtectedRoute allowedRoles={['client']} />}>
          <Route path="/dashboard" element={<UserDashboard />} />
        </Route>

        {/* 2. Rotas do Proprietário / Dono de Estabelecimento */}
        <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
          <Route path="/company" element={<Company />} />
        </Route>

        {/* 3. Rotas do Administrador do Sistema */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* 4. Rotas Compartilhadas (Qualquer usuário logado) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/map" element={<AddressMap />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>

        {/* Redirecionamento Padrão */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
  );
}

export default App;

