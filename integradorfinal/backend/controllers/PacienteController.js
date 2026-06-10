import Paciente from "../models/Paciente.js";
import Convenio from "../models/Convenio.js";

const INCLUDE_CONVENIO = [
    { model: Convenio, as: 'convenio', attributes: ['nome', 'percentual_cobertura_plano'] },
];

function flatten(p) {
    const { convenio, ...rest } = p.get({ plain: true });
    return {
        ...rest,
        nome_convenio: convenio?.nome || null,
        percentual_cobertura_plano: convenio?.percentual_cobertura_plano || null,
    };
}

async function listar(req, res) {
    const dados = await Paciente.findAll({ include: INCLUDE_CONVENIO, order: [['nome', 'ASC']] });
    return res.json(dados.map(flatten));
}

async function selecionar(req, res) {
    const dados = await Paciente.findByPk(req.params.id_paciente, { include: INCLUDE_CONVENIO });
    return res.json(dados ? flatten(dados) : null);
}

async function inserir(req, res) {
    const { nome, cpf, data_nascimento, id_convenio } = req.body;
    const dados = await Paciente.create({ nome, cpf, data_nascimento: data_nascimento || null, id_convenio: id_convenio || null });
    return res.json(dados);
}

async function alterar(req, res) {
    const { nome, cpf, data_nascimento, id_convenio } = req.body;
    const dados = await Paciente.update(
        { nome, cpf, data_nascimento: data_nascimento || null, id_convenio: id_convenio || null },
        { where: { id_paciente: req.params.id_paciente } }
    );
    return res.json(dados);
}

async function excluir(req, res) {
    const dados = await Paciente.destroy({ where: { id_paciente: req.params.id_paciente } });
    return res.json(dados);
}

export default { listar, selecionar, inserir, alterar, excluir };
