import { Op } from "sequelize";
import Banco from "../Banco.js";
import Cobranca from "../models/Consulta.js";
import CobrancaItem from "../models/ConsultaLista.js";
import CobrancaDetalhada from "../models/CobrancaDetalhada.js";
import Convenio from "../models/Convenio.js";
import Paciente from "../models/Paciente.js";
import Pagamento from "../models/Pagamento.js";

async function listar(req, res) {
    const { id_paciente, data_inicio, data_fim, tipo_servico } = req.query;
    const where = {};
    if (id_paciente) where.id_paciente = id_paciente;
    if (data_inicio || data_fim) {
        where.data_cobranca = {};
        if (data_inicio) where.data_cobranca[Op.gte] = data_inicio;
        if (data_fim)    where.data_cobranca[Op.lte] = data_fim;
    }

    const include = [
        { model: Paciente, as: 'paciente', attributes: ['nome'] },
        { model: Convenio, as: 'convenio', attributes: ['nome'] },
    ];
    if (tipo_servico) {
        include.push({ model: CobrancaItem, as: 'itens', where: { tipo_servico }, required: true, attributes: [] });
    }

    const dados = await Cobranca.findAll({ include, where, order: [['data_cobranca', 'DESC']] });
    return res.json(dados.map(c => {
        const { paciente, convenio, itens, ...rest } = c.get({ plain: true });
        return { ...rest, nome_paciente: paciente?.nome || null, nome_convenio: convenio?.nome || null };
    }));
}

async function listarAguardando(req, res) {
    const dados = await Cobranca.findAll({
        include: [
            { model: Paciente, as: 'paciente', attributes: ['nome'] },
            { model: Convenio, as: 'convenio', attributes: ['nome'] },
            { model: Pagamento, as: 'pagamentos', where: { status: 'pendente' }, required: true },
        ],
        order: [[{ model: Pagamento, as: 'pagamentos' }, 'criado_em', 'DESC']],
    });
    return res.json(dados.map(c => {
        const { paciente, convenio, pagamentos, status, ...rest } = c.get({ plain: true });
        const pag = pagamentos?.[0] || {};
        return {
            ...rest,
            status_cobranca: status,
            nome_paciente: paciente?.nome || null,
            nome_convenio: convenio?.nome || null,
            id_pagamento: pag.id_pagamento,
            forma_pagamento: pag.forma_pagamento,
            valor_pago: pag.valor_pago,
            status_pagamento: pag.status,
            data_aprovacao: pag.criado_em,
        };
    }));
}

async function selecionar(req, res) {
    const { id } = req.params;

    const [cobrancaModel, itens, pagamento] = await Promise.all([
        Cobranca.findByPk(id, {
            include: [
                { model: Paciente, as: 'paciente', attributes: ['nome'] },
                { model: Convenio, as: 'convenio', attributes: ['nome', 'percentual_cobertura_plano'] },
            ],
        }),
        CobrancaDetalhada.findAll({ where: { id_cobranca: id }, order: [['id_cobranca_item', 'ASC']] }),
        Pagamento.findOne({ where: { id_cobranca: id }, order: [['criado_em', 'DESC']] }),
    ]);

    if (!cobrancaModel) return res.status(404).json({ mensagem: 'Cobrança não encontrada' });
    const { paciente, convenio, ...rest } = cobrancaModel.get({ plain: true });
    return res.json({
        cobranca: {
            ...rest,
            nome_paciente: paciente?.nome || null,
            nome_convenio: convenio?.nome || null,
            percentual_cobertura_plano: convenio?.percentual_cobertura_plano || null,
        },
        itens,
        pagamento,
    });
}

async function gerarCobranca(req, res) {
    const { id_paciente, id_convenio, id_consulta, itens } = req.body;

    if (!id_paciente || !itens?.length) {
        return res.status(400).json({ mensagem: 'Paciente e pelo menos um item são obrigatórios' });
    }

    if (id_consulta) {
        const jaExiste = await Cobranca.findOne({ where: { id_consulta } });
        if (jaExiste) {
            return res.status(400).json({ mensagem: 'Esta consulta já possui uma cobrança gerada.' });
        }
    }

    const valor_bruto = itens.reduce((acc, i) => acc + Number(i.quantidade) * Number(i.valor_unitario), 0);

    let valor_coberto_convenio = 0;
    if (id_convenio) {
        const convenio = await Convenio.findByPk(id_convenio);
        if (convenio?.ativo) {
            valor_coberto_convenio = valor_bruto * (Number(convenio.percentual_cobertura_plano) / 100);
        }
    }

    const valor_liquido = valor_bruto - valor_coberto_convenio;
    const data_cobranca = new Date().toISOString().slice(0, 10);

    const t = await Banco.transaction();
    try {
        const cobranca = await Cobranca.create({
            id_paciente,
            id_convenio: id_convenio || null,
            id_consulta: id_consulta || null,
            data_cobranca,
            status: 'aberta',
            valor_bruto: valor_bruto.toFixed(2),
            valor_desconto: '0.00',
            valor_coberto_convenio: valor_coberto_convenio.toFixed(2),
            valor_liquido: valor_liquido.toFixed(2),
        }, { transaction: t });

        for (const item of itens) {
            await CobrancaItem.create({
                id_cobranca: cobranca.id_cobranca,
                tipo_servico: item.tipo_servico,
                id_origem: item.id_origem || 0,
                descricao: item.descricao,
                quantidade: item.quantidade,
                valor_unitario: item.valor_unitario,
            }, { transaction: t });
        }

        await t.commit();
        return res.json(cobranca);
    } catch (error) {
        await t.rollback();
        return res.status(500).json({ mensagem: 'Erro ao gerar cobrança', erro: error.message });
    }
}

async function aprovarCobranca(req, res) {
    const { id } = req.params;
    const { forma_pagamento } = req.body;

    if (!forma_pagamento) return res.status(400).json({ mensagem: 'Forma de pagamento é obrigatória' });

    const cobranca = await Cobranca.findByPk(id);
    if (!cobranca) return res.status(404).json({ mensagem: 'Cobrança não encontrada' });

    const jaAprovada = await Pagamento.findOne({ where: { id_cobranca: id, status: 'pendente' } });
    if (jaAprovada) return res.status(400).json({ mensagem: 'Esta cobrança já foi aprovada e aguarda pagamento' });

    const pagamento = await Pagamento.create({
        id_cobranca: id,
        valor_pago: cobranca.valor_liquido,
        forma_pagamento,
        status: 'pendente',
    });
    return res.json(pagamento);
}

export default { listar, listarAguardando, selecionar, gerarCobranca, aprovarCobranca };
