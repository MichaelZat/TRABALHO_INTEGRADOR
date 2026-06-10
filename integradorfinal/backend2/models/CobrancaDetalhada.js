import Banco from "../Banco.js";
import { DataTypes } from "sequelize";

const CobrancaDetalhada = Banco.define('cobranca_detalhada', {
    id_cobranca_item: { 
        type: DataTypes.BIGINT, 
        primaryKey: true },
    id_cobranca:      { 
        type: DataTypes.BIGINT },
    tipo_servico:     { 
        type: DataTypes.STRING(30) },
    descricao_item:   { 
        type: DataTypes.TEXT },
    quantidade:       { 
        type: DataTypes.INTEGER },
    valor_unitario:   { 
        type: DataTypes.DECIMAL(10, 2) },
    valor_total_item: { 
        type: DataTypes.DECIMAL(10, 2) },
}, { timestamps: false, freezeTableName: true });

export default CobrancaDetalhada;
