import Banco from "../Banco.js";
import { DataTypes } from "sequelize";

const Pagamento = Banco.define('pagamento', {
    id_pagamento: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    id_cobranca: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    valor_pago: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    forma_pagamento: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'pendente',
    },
    criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

export default Pagamento;
