import Menu from './componentes/Menu';
import './App.css';
import PaginaCobrancaLista from './componentes/PaginaCobrancaLista';
import PaginaCobrancaDetalhe from './componentes/PaginaCobrancaDetalhe';
import PaginaCobrancaCadastro from './componentes/PaginaCobrancaCadastro';
import PaginaAguardandoPagamento from './componentes/PaginaAguardandoPagamento';
import PaginaPacienteLista from './componentes/PaginaPacienteLista';
import PaginaPacienteCadastro from './componentes/PaginaPacienteCadastro';
import PaginaConsultaLista from './componentes/PaginaConsultaLista';
import PaginaConsultaCadastro from './componentes/PaginaConsultaCadastro';
import PaginaConvenioCadastro from './componentes/PaginaConvenioCadastro';
import PaginaConvenioLista from './componentes/PaginaConvenioLista';  
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Menu />
        <Routes>
          <Route path='/' element={<Navigate to='/cobrancas' replace />} />
          <Route path='/pacientes' element={<PaginaPacienteLista />} />
          <Route path='/paciente' element={<PaginaPacienteCadastro />} />
          <Route path='/paciente/:id' element={<PaginaPacienteCadastro />} />
          <Route path='/consultas' element={<PaginaConsultaLista />} />
          <Route path='/consulta' element={<PaginaConsultaCadastro />} />
          <Route path='/consulta/:id' element={<PaginaConsultaCadastro />} />
          <Route path='/cobrancas' element={<PaginaCobrancaLista />} />
          <Route path='/cobranca/nova' element={<PaginaCobrancaCadastro />} />
          <Route path='/cobranca/:id' element={<PaginaCobrancaDetalhe />} />
          <Route path='/aguardando-pagamento' element={<PaginaAguardandoPagamento />} />
          <Route path='/convenio' element={<PaginaConvenioCadastro />} />
          <Route path='/convenio/:id' element={<PaginaConvenioCadastro />} />
          <Route path='/convenios' element={<PaginaConvenioLista />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
