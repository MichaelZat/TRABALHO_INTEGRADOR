import Convenio from "../models/Convenio.js";

async function listar(req, res) {
    const dados = await Convenio.findAll({ order: [['nome', 'ASC']] });
    return res.json(dados);
}

async function relatorio(req, res) {
    return listar(req, res);
}

async function selecionar(req, res) {
    const dados = await Convenio.findByPk(req.params.id_convenio);
    return res.json(dados);
}

async function inserir(req, res) {
    const { nome, percentual_cobertura_plano, ativo } = req.body;
    const dados = await Convenio.create({ nome, percentual_cobertura_plano, ativo: ativo !== undefined ? ativo : true });
    return res.json(dados);
}

async function alterar(req, res) {
    const { nome, percentual_cobertura_plano, ativo } = req.body;
    const dados = await Convenio.update(
        { nome, percentual_cobertura_plano, ativo },
        { where: { id_convenio: req.params.id_convenio } }
    );
    return res.json(dados);
}

async function excluir(req, res) {
    const dados = await Convenio.destroy({ where: { id_convenio: req.params.id_convenio } });
    return res.json(dados);
}

export default { listar, relatorio, selecionar, inserir, alterar, excluir };
