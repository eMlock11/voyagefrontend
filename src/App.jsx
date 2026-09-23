import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Cadastro from './pages/User/Cadastro';
import Login from './pages/User/Login';
import EditarPerfil from './pages/User/EditarPerfil';
import Company from './pages/Company/Company';
import Payment from './pages/Payment/Payment';
import AddressMap from './pages/AddressMap/AddressMap';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas Protegidas (Requerem Login com Bearer Token) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/company" element={<Company />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />


          <Route path="/map" element={<AddressMap />} />
          <Route path="/payment" element={<Payment />} />
        </Route>

        {/* Rota padrão para /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
