import Express from "express";
import banco from "./Banco.js";
import convenio from "./controllers/ConvenioController.js";

try {
    await banco.authenticate();
    console.log('Banco conectado com sucesso.');
} catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
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

api.get('/teste', (req, res) => {
    res.send('Api funcionando');
});

api.get('/relatorio/convenios', convenio.relatorio);

api.get('/convenio', convenio.listar);
api.get('/convenio/:id_convenio', convenio.selecionar);
api.post('/convenio', convenio.inserir);
api.put('/convenio/:id_convenio', convenio.alterar);
api.delete('/convenio/:id_convenio', convenio.excluir);

api.listen(3003, () => { console.log('Api rodando na porta 3003...') });
