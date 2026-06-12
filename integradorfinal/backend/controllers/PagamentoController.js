import Pagamento from "../models/Pagamento.js";

async function alterar(req, res) {
    const { id_pagamento } = req.params;
    const { status } = req.body;

    const statusValidos = ['pendente', 'paga', 'recusada', 'cancelada'];
    if (!statusValidos.includes(status)) {
        return res.status(400).json({ mensagem: 'Status inválido' });
    }

    
    const dados = await Pagamento.update(
        { status },
        { where: { id_pagamento } }
    );
    return res.json(dados);
}

export default { alterar };
