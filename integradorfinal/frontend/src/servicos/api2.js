import axios from 'axios';


const api2 = axios.create({
    baseURL: 'http://localhost:4002/'
});

export const obterMensagemErro = (error) => {
    return error.response?.data?.mensagem
        || error.response?.data?.erro
        || error.response?.data?.detalhe
        || error.message
        || String(error);
};

export const get2 = async (rota) => {
    const resposta = await api2.get(rota);
    return resposta.data;
};

export const post2 = async (rota, objeto) => {
    const resposta = await api2.post(rota, objeto);
    return resposta.data;
};

export const put2 = async (rota, objeto) => {
    const resposta = await api2.put(rota, objeto);
    return resposta.data;
};

export const del2 = async (rota) => {
    const resposta = await api2.delete(rota);
    return resposta.data;
};
