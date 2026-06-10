import Express from "express";
import Banco from "./Banco.js";
import CobrancaController from "./controllers/CobrancaController.js";
import PagamentoController from "./controllers/PagamentoController.js";
import PacienteController from "./controllers/PacienteController.js";
import ConvenioController from "./controllers/ConvenioController.js";

try {
    await Banco.authenticate();
    console.log('Banco conectado com sucesso');
} catch (error) {
    console.error('Erro ao conectar ao banco:', error);
}

const api = Express();
api.use(Express.json());
api.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// /aguardando deve vir antes de /:id para não ser capturado como parâmetro
api.get('/cobranca', CobrancaController.listar);
api.get('/cobranca/aguardando', CobrancaController.listarAguardando);
api.get('/cobranca/:id', CobrancaController.selecionar);
api.post('/cobranca', CobrancaController.gerarCobranca);
api.put('/cobranca/:id/aprovar', CobrancaController.aprovarCobranca);

api.put('/pagamento/:id_pagamento', PagamentoController.alterar);

api.get('/paciente', PacienteController.listar);
api.get('/paciente/:id_paciente', PacienteController.selecionar);
api.post('/paciente', PacienteController.inserir);
api.put('/paciente/:id_paciente', PacienteController.alterar);
api.delete('/paciente/:id_paciente', PacienteController.excluir);

api.get('/convenio', ConvenioController.listar);
api.get('/convenio/:id_convenio', ConvenioController.selecionar);
api.post('/convenio', ConvenioController.inserir);
api.put('/convenio/:id_convenio', ConvenioController.alterar);
api.delete('/convenio/:id_convenio', ConvenioController.excluir);

api.listen(4001, () => {
    console.log('Api rodando na porta 4001');
});
