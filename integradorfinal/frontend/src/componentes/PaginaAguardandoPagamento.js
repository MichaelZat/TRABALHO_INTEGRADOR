import { useCallback, useEffect, useState } from "react";
import { get, put, obterMensagemErro } from "../servicos/api";

const LABELS_STATUS = {
    pendente: 'Aberta (Aguardando)',
    paga: 'Paga',
    recusada: 'Recusada',
    cancelada: 'Cancelada',
};

function PaginaAguardandoPagamento() {
    const [cobrancas, setCobrancas] = useState([]);
    const [statusEditando, setStatusEditando] = useState({});
    const [salvando, setSalvando] = useState({});
    const [carregando, setCarregando] = useState(false);

    const listar = useCallback(async () => {
        setCarregando(true);
        try {
            const resposta = await get('cobranca/aguardando');
            setCobrancas(resposta);

            const inicial = {};
            resposta.forEach((c) => {
                inicial[c.id_pagamento] = c.status_pagamento;
            });
            setStatusEditando(inicial);
        } catch (error) {
            alert("Erro ao carregar: " + obterMensagemErro(error));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        listar();
    }, [listar]);

    const salvar = async (id_pagamento) => {
        setSalvando((prev) => ({ ...prev, [id_pagamento]: true }));
        try {
            await put('pagamento/' + id_pagamento, { status: statusEditando[id_pagamento] });
            alert('Status atualizado com sucesso!');
            listar();
        } catch (error) {
            alert("Erro ao atualizar status: " + obterMensagemErro(error));
        } finally {
            setSalvando((prev) => ({ ...prev, [id_pagamento]: false }));
        }
    };

    const formatarMoeda = (valor) =>
        Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const formatarDataHora = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleString('pt-BR');
    };

    const badgeFormaPagamento = (forma) => {
        const mapa = {
            dinheiro: 'secondary',
            cartao: 'primary',
            pix: 'success',
            boleto: 'warning text-dark',
            convenio: 'info',
        };
        return <span className={`badge bg-${mapa[forma] || 'secondary'}`}>{forma}</span>;
    };

    return (
        <div className="container my-5">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 text-primary">Aguardando Pagamento</h4>
                    <a href="/cobrancas" className="btn btn-outline-secondary btn-sm">
                        Ver Todas as Cobranças
                    </a>
                </div>
                <div className="card-body p-0">
                    {carregando ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </div>
                    ) : (
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">ID</th>
                                    <th>Paciente</th>
                                    <th>Data Cobrança</th>
                                    <th>Aprovado em</th>
                                    <th>Forma Pgto</th>
                                    <th>Convênio</th>
                                    <th className="text-end">Valor Líquido</th>
                                    <th className="text-center" style={{ minWidth: 220 }}>
                                        Status
                                    </th>
                                    <th className="text-center">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cobrancas.map((c) => (
                                    <tr key={c.id_pagamento}>
                                        <td className="ps-4">{c.id_cobranca}</td>
                                        <td>{c.nome_paciente}</td>
                                        <td>{formatarData(c.data_cobranca)}</td>
                                        <td>
                                            <small className="text-muted">
                                                {formatarData(c.data_aprovacao)}
                                            </small>
                                        </td>
                                        <td>{badgeFormaPagamento(c.forma_pagamento)}</td>
                                        <td>
                                            {c.nome_convenio || (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td className="text-end fw-bold">
                                            {formatarMoeda(c.valor_liquido)}
                                        </td>
                                        <td className="text-center">
                                            <select
                                                className="form-select form-select-sm"
                                                value={statusEditando[c.id_pagamento] || 'pendente'}
                                                onChange={(e) =>
                                                    setStatusEditando((prev) => ({
                                                        ...prev,
                                                        [c.id_pagamento]: e.target.value,
                                                    }))
                                                }
                                            >
                                                {Object.entries(LABELS_STATUS).map(([valor, label]) => (
                                                    <option key={valor} value={valor}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => salvar(c.id_pagamento)}
                                                disabled={salvando[c.id_pagamento]}
                                            >
                                                {salvando[c.id_pagamento] ? (
                                                    <span className="spinner-border spinner-border-sm" />
                                                ) : (
                                                    'Salvar'
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {cobrancas.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="text-center text-muted py-5">
                                            Nenhuma cobrança aguardando pagamento
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PaginaAguardandoPagamento;
