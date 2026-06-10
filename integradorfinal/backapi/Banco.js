import { Sequelize } from "sequelize";

const Banco = new Sequelize('integrador', 'postgres', '17221993', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    define: {
        timestamps: false,
        freezeTableName: true,
    },
});

export default Banco;