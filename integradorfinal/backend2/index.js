import Express from "express";
import Banco from "./Banco.js";
import CobrancaController from "./controllers/ConsultaController.js";
import PagamentoController from "./controllers/PagamentoController.js";
import PacienteController from "./controllers/PacienteController.js";
import ConvenioController from "./controllers/ConsultaListaController.js";
import ConsultaAgendaController from "./controllers/ConsultaAgendaController.js";

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


api.get('/consulta/realizadas', ConsultaAgendaController.listarRealizadas);
api.get('/consulta', ConsultaAgendaController.listar);
api.get('/consulta/:id', ConsultaAgendaController.selecionar);
api.post('/consulta', ConsultaAgendaController.inserir);
api.put('/consulta/:id', ConsultaAgendaController.alterar);
api.post('/consulta/:id/item', ConsultaAgendaController.adicionarItem);
api.delete('/consulta/:id/item/:id_item', ConsultaAgendaController.removerItem);

api.listen(4002, () => {
    console.log('Api rodando na porta 4002');
});
