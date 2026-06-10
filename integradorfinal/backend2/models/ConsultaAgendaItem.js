import Banco from "../Banco.js";
import { DataTypes } from "sequelize";

const ConsultaAgendaItem = Banco.define('consulta_item', {
    id_consulta_item: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    id_consulta: {
        type: DataTypes.BIGINT,
        allowNull: false,
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

export default ConsultaAgendaItem;
