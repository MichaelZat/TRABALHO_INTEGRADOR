import Banco from "../Banco.js";
import { DataTypes } from "sequelize";
import Paciente from "./Paciente.js";
import ConsultaAgendaItem from "./ConsultaAgendaItem.js";
import Cobranca from "./Consulta.js";

const ConsultaAgenda = Banco.define('consulta', {
    id_consulta: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    id_paciente: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    data_consulta: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'agendada',
    },
    observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

ConsultaAgenda.belongsTo(Paciente,         { foreignKey: 'id_paciente', as: 'paciente' });
ConsultaAgenda.hasMany(ConsultaAgendaItem, { foreignKey: 'id_consulta', as: 'itens' });
ConsultaAgenda.hasMany(Cobranca,           { foreignKey: 'id_consulta', as: 'cobrancas' });

export default ConsultaAgenda;
