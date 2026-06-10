import Banco from "../Banco.js";
import { DataTypes } from "sequelize";
import Convenio from "./Convenio.js";

const Paciente = Banco.define('paciente', {
    id_paciente: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    cpf: {
        type: DataTypes.STRING(14),
        allowNull: false,
        unique: true,
    },
    data_nascimento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    id_convenio: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

Paciente.belongsTo(Convenio, { foreignKey: 'id_convenio', as: 'convenio' });

export default Paciente;
