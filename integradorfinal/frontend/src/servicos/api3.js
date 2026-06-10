import axios from 'axios';


const api3 = axios.create({
    baseURL: 'http://localhost:3003/'
});

export const obterMensagemErro = (error) => {
    return error.response?.data?.mensagem
        || error.response?.data?.erro
        || error.response?.data?.detalhe
        || error.message
        || String(error);
};

export const get3 = async (rota) => {
    const resposta = await api3.get(rota);
    return resposta.data;
};

export const post3 = async (rota, objeto) => {
    const resposta = await api3.post(rota, objeto);
    return resposta.data;
};

export const put3 = async (rota, objeto) => {
    const resposta = await api3.put(rota, objeto);
    return resposta.data;
};

export const del3 = async (rota) => {
    const resposta = await api3.delete(rota);
    return resposta.data;
};
