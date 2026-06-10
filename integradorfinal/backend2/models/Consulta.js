import Banco from "../Banco.js";
import { DataTypes } from "sequelize";
import Paciente from "./Paciente.js";
import Convenio from "./Convenio.js";
import CobrancaItem from "./ConsultaLista.js";
import Pagamento from "./Pagamento.js";

const Cobranca = Banco.define('cobranca', {
    id_cobranca: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    id_paciente: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    id_convenio: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    id_consulta: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    data_cobranca: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'aberta',
    },
    valor_bruto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    valor_desconto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    valor_coberto_convenio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    valor_liquido: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
});

Cobranca.belongsTo(Paciente,   { foreignKey: 'id_paciente', as: 'paciente' });
Cobranca.belongsTo(Convenio,   { foreignKey: 'id_convenio', as: 'convenio' });
Cobranca.hasMany(CobrancaItem, { foreignKey: 'id_cobranca', as: 'itens' });
Cobranca.hasMany(Pagamento,    { foreignKey: 'id_cobranca', as: 'pagamentos' });

export default Cobranca;
