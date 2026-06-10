import { fn, col, literal, Op } from "sequelize";
import ConsultaAgenda from "../models/ConsultaAgenda.js";
import ConsultaAgendaItem from "../models/ConsultaAgendaItem.js";
import Paciente from "../models/Paciente.js";
import Convenio from "../models/Convenio.js";
import Cobranca from "../models/Consulta.js";

async function listar(req, res) {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const dados = await ConsultaAgenda.findAll({
        include: [{ model: Paciente, as: 'paciente', attributes: ['nome'] }],
        where,
        order: [['data_consulta', 'DESC'], ['criado_em', 'DESC']],
    });
    return res.json(dados.map(c => {
        const { paciente, ...rest } = c.get({ plain: true });
        return { ...rest, nome_paciente: paciente?.nome || null };
    }));
}

async function listarRealizadas(req, res) {

    const comCobranca = await Cobranca.findAll({
        attributes: ['id_consulta'],
        where: { id_consulta: { [Op.not]: null } },
    });
    const idsComCobranca = comCobranca.map(c => Number(c.id_consulta));

    const where = { status: 'realizada' };
    if (idsComCobranca.length > 0) {
        where.id_consulta = { [Op.notIn]: idsComCobranca };
    }

    const dados = await ConsultaAgenda.findAll({
        attributes: [
            'id_consulta',
            'id_paciente',
            'data_consulta',
            'observacoes',
            [fn('COUNT', col('itens.id_consulta_item')), 'total_itens'],
            [fn('COALESCE', fn('SUM', literal('"itens"."quantidade" * "itens"."valor_unitario"')), 0), 'valor_total'],
        ],
        include: [
            {
                model: Paciente,
                as: 'paciente',
                attributes: ['nome', 'id_convenio'],
                include: [{
                    model: Convenio,
                    as: 'convenio',
                    attributes: ['nome', 'percentual_cobertura_plano'],
                }],
            },
            { model: ConsultaAgendaItem, as: 'itens', attributes: [], required: false },
        ],
        where,
        group: [
            literal('"consulta"."id_consulta"'),
            literal('"consulta"."id_paciente"'),
            literal('"consulta"."data_consulta"'),
            literal('"consulta"."observacoes"'),
            literal('"paciente"."id_paciente"'),
            literal('"paciente"."nome"'),
            literal('"paciente"."id_convenio"'),
            literal('"paciente->convenio"."id_convenio"'),
            literal('"paciente->convenio"."nome"'),
            literal('"paciente->convenio"."percentual_cobertura_plano"'),
        ],
        subQuery: false,
        order: [['data_consulta', 'DESC']],
    });

    return res.json(dados.map(c => {
        const d = c.get({ plain: true });
        return {
            id_consulta: d.id_consulta,
            id_paciente: d.id_paciente,
            nome_paciente: d.paciente?.nome || null,
            id_convenio: d.paciente?.id_convenio || null,
            nome_convenio: d.paciente?.convenio?.nome || null,
            percentual_cobertura_plano: d.paciente?.convenio?.percentual_cobertura_plano || null,
            data_consulta: d.data_consulta,
            observacoes: d.observacoes,
            total_itens: d.total_itens,
            valor_total: d.valor_total,
        };
    }));
}

async function selecionar(req, res) {
    const { id } = req.params;

    const [consulta, itens] = await Promise.all([
        ConsultaAgenda.findByPk(id, {
            include: [{ model: Paciente, as: 'paciente', attributes: ['nome'] }],
        }),
        ConsultaAgendaItem.findAll({ where: { id_consulta: id }, order: [['criado_em', 'ASC']] }),
    ]);

    if (!consulta) return res.status(404).json({ mensagem: 'Consulta não encontrada' });
    const { paciente, ...rest } = consulta.get({ plain: true });
    return res.json({ consulta: { ...rest, nome_paciente: paciente?.nome || null }, itens });
}

async function inserir(req, res) {
    const { id_paciente, data_consulta, observacoes } = req.body;

    if (!id_paciente || !data_consulta) {
        return res.status(400).json({ mensagem: 'Paciente e data são obrigatórios' });
    }

    const dados = await ConsultaAgenda.create({
        id_paciente, data_consulta, status: 'agendada', observacoes: observacoes || null,
    });
    return res.json(dados);
}

async function alterar(req, res) {
    const { id } = req.params;
    const { status, observacoes } = req.body;

    const atual = await ConsultaAgenda.findByPk(id);
    if (!atual) return res.status(404).json({ mensagem: 'Consulta não encontrada' });
    if (atual.status === 'realizada') {
        return res.status(400).json({ mensagem: 'Consultas realizadas não podem ser alteradas.' });
    }

    const statusValidos = ['agendada', 'realizada', 'cancelada', 'faturada'];
    if (status && !statusValidos.includes(status)) {
        return res.status(400).json({ mensagem: 'Status inválido' });
    }

    const dados = await ConsultaAgenda.update({ status, observacoes }, { where: { id_consulta: id } });
    return res.json(dados);
}

async function adicionarItem(req, res) {
    const { id } = req.params;
    const { descricao, quantidade, valor_unitario } = req.body;

    if (!descricao || !valor_unitario) {
        return res.status(400).json({ mensagem: 'Descrição e valor unitário são obrigatórios' });
    }

    const consulta = await ConsultaAgenda.findByPk(id);
    if (!consulta) return res.status(404).json({ mensagem: 'Consulta não encontrada' });
    if (consulta.status === 'realizada') {
        return res.status(400).json({ mensagem: 'Consultas realizadas não podem ser alteradas.' });
    }

    const item = await ConsultaAgendaItem.create({
        id_consulta: id, descricao, quantidade: quantidade || 1, valor_unitario,
    });
    return res.json(item);
}

async function removerItem(req, res) {
    const item = await ConsultaAgendaItem.findByPk(req.params.id_item);
    if (!item) return res.status(404).json({ mensagem: 'Item não encontrado' });

    const consulta = await ConsultaAgenda.findByPk(item.id_consulta);
    if (consulta?.status === 'realizada') {
        return res.status(400).json({ mensagem: 'Consultas realizadas não podem ser alteradas.' });
    }

    const dados = await ConsultaAgendaItem.destroy({ where: { id_consulta_item: req.params.id_item } });
    return res.json(dados);
}

export default { listar, listarRealizadas, selecionar, inserir, alterar, adicionarItem, removerItem };
