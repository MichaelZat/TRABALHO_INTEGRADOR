import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4001/'
});

export const obterMensagemErro = (error) => {
    return error.response?.data?.mensagem
        || error.response?.data?.erro
        || error.response?.data?.detalhe
        || error.message
        || String(error);
};

export const get = async (rota) => {
    try {
        const resposta = await api.get(rota);
        return resposta.data;
    }
    catch (error) {
        throw error;
    }
};

export const del = async (rota) => {
    try {
        const resposta = await api.delete(rota);
        return resposta.data;
    }
    catch (error) {
        throw error;
    }
};

export const post = async (rota, objeto) => {
    try {
        const resposta = await api.post(rota, objeto);
        return resposta.data;
    }
    catch (error) {
        throw error;
    }
};

export const put = async (rota, objeto) => {
    try {
        const resposta = await api.put(rota, objeto);
        return resposta.data;
    }
    catch (error) {
        throw error;
    }
};
