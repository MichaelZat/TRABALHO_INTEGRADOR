import Banco from "../Banco.js";
import { DataTypes } from "sequelize";

const CobrancaItem = Banco.define('cobranca_item', {
    id_cobranca_item: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    id_cobranca: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    tipo_servico: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    id_origem: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
    },
    descricao: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    quantidade: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1,
    },
    valor_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

export default CobrancaItem;
