import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Cadastro from './Cadastro';
import Login from './Login';
import EditarPerfil from './EditarPerfil';
import Company from './pages/Company';
import Payment from './pages/payment/Payment';
import AddressMap from './pages/AddressMap/AddressMap';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        <Route path="/perfil/editar" element={<EditarPerfil />} />
        <Route path="/company" element={<Company />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/address" element={<AddressMap />} />
        <Route path="/map" element={<AddressMap />} />
        
        {/* Rota padrão para /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
