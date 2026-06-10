import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get, put, obterMensagemErro } from "../servicos/api";

function PaginaCobrancaDetalhe() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cobranca, setCobranca] = useState(null);
    const [itens, setItens] = useState([]);
    const [pagamento, setPagamento] = useState(null);
    const [formaPagamento, setFormaPagamento] = useState('dinheiro');
    const [aprovando, setAprovando] = useState(false);
    const [erro, setErro] = useState('');

    const carregar = useCallback(async () => {
        setErro('');
        try {
            const resposta = await get('cobranca/' + id);
            setCobranca(resposta.cobranca);
            setItens(resposta.itens || []);
            setPagamento(resposta.pagamento || null);
        } catch (error) {
            setErro(obterMensagemErro(error));
        }
    }, [id]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const aprovar = async () => {
        if (!window.confirm('Confirma a aprovação desta cobrança?')) return;
        setAprovando(true);
        try {
            await put('cobranca/' + id + '/aprovar', { forma_pagamento: formaPagamento });
            alert('Cobrança aprovada! Redirecionando para Aguardando Pagamento.');
            navigate('/aguardando-pagamento');
        } catch (error) {
            alert("Erro ao aprovar cobrança: " + obterMensagemErro(error));
        } finally {
            setAprovando(false);
        }
    };

    const formatarMoeda = (valor) =>
        Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    };

    const badgeStatus = (status) => {
        const mapa = {
            aberta: 'warning text-dark',
            paga: 'success',
            recusada: 'danger',
            cancelada: 'secondary',
        };
        return <span className={`badge bg-${mapa[status] || 'secondary'}`}>{status}</span>;
    };

    const badgeTipo = (tipo) => {
        const mapa = { consulta: 'info', exame: 'primary', medicamento: 'success' };
        return <span className={`badge bg-${mapa[tipo] || 'secondary'}`}>{tipo}</span>;
    };

    if (erro) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger">
                    <strong>Erro ao carregar cobrança:</strong> {erro}
                </div>
                <a href="/cobrancas" className="btn btn-outline-secondary">Voltar</a>
            </div>
        );
    }

    if (!cobranca) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3 text-muted">Carregando cobrança...</p>
            </div>
        );
    }

    const podeAprovar = cobranca.status === 'aberta' && !pagamento;

    return (
        <div className="container my-5">
            
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 text-primary">Cobrança #{cobranca.id_cobranca}</h4>
                    <a href="/cobrancas" className="btn btn-outline-secondary btn-sm">Voltar</a>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <p className="text-muted small mb-1">Paciente</p>
                            <p className="fw-bold mb-3">{cobranca.nome_paciente}</p>
                            <p className="text-muted small mb-1">Data da Cobrança</p>
                            <p>{formatarData(cobranca.data_cobranca)}</p>
                        </div>
                        <div className="col-md-4">
                            <p className="text-muted small mb-1">Convênio</p>
                            <p className="mb-3">
                                {cobranca.nome_convenio || <span className="text-muted">Sem convênio</span>}
                                {cobranca.percentual_cobertura_plano > 0 && (
                                    <span className="ms-2 badge bg-info">
                                        {cobranca.percentual_cobertura_plano}% cobertura
                                    </span>
                                )}
                            </p>
                            <p className="text-muted small mb-1">Status</p>
                            <p>{badgeStatus(cobranca.status)}</p>
                        </div>
                        <div className="col-md-4">
                            <p className="text-muted small mb-1">Resumo Financeiro</p>
                            <table className="table table-sm table-borderless mb-0">
                                <tbody>
                                    <tr>
                                        <td className="text-muted">Valor Bruto</td>
                                        <td className="text-end">{formatarMoeda(cobranca.valor_bruto)}</td>
                                    </tr>
                                    {Number(cobranca.valor_coberto_convenio) > 0 && (
                                        <tr className="text-success">
                                            <td>Cob. Convênio</td>
                                            <td className="text-end">- {formatarMoeda(cobranca.valor_coberto_convenio)}</td>
                                        </tr>
                                    )}
                                    {Number(cobranca.valor_desconto) > 0 && (
                                        <tr className="text-warning">
                                            <td>Desconto</td>
                                            <td className="text-end">- {formatarMoeda(cobranca.valor_desconto)}</td>
                                        </tr>
                                    )}
                                    <tr className="fw-bold border-top">
                                        <td>Valor Líquido</td>
                                        <td className="text-end fs-6">{formatarMoeda(cobranca.valor_liquido)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0">Itens da Cobrança</h5>
                </div>
                <div className="card-body p-0">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">Tipo</th>
                                <th>Descrição</th>
                                <th className="text-center">Qtd</th>
                                <th className="text-end">Valor Unit.</th>
                                <th className="text-end pe-4">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itens.map((item) => (
                                <tr key={item.id_cobranca_item}>
                                    <td className="ps-4">{badgeTipo(item.tipo_servico)}</td>
                                    <td>{item.descricao_item}</td>
                                    <td className="text-center">{Number(item.quantidade)}</td>
                                    <td className="text-end">{formatarMoeda(item.valor_unitario)}</td>
                                    <td className="text-end pe-4"><strong>{formatarMoeda(item.valor_total_item)}</strong></td>
                                </tr>
                            ))}
                            {itens.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-4">
                                        Nenhum item registrado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

           
            {podeAprovar && (
                <div className="card shadow-sm border-0 border-start border-4 border-success">
                    <div className="card-body">
                        <h5 className="mb-3">Aprovar Cobrança</h5>
                        <p className="text-muted mb-3">
                            Selecione a forma de pagamento e clique em <strong>Aprovar</strong> para registrar
                            a cobrança como aguardando pagamento.
                        </p>
                        <div className="row align-items-end g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Forma de Pagamento</label>
                                <select
                                    className="form-select"
                                    value={formaPagamento}
                                    onChange={(e) => setFormaPagamento(e.target.value)}
                                >
                                    <option value="dinheiro">Dinheiro</option>
                                    <option value="cartao">Cartão</option>
                                    <option value="pix">PIX</option>
                                    <option value="boleto">Boleto</option>
                                    <option value="convenio">Convênio</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <button
                                    className="btn btn-success btn-lg px-5"
                                    onClick={aprovar}
                                    disabled={aprovando}
                                >
                                    {aprovando ? (
                                        <><span className="spinner-border spinner-border-sm me-2" />Aprovando...</>
                                    ) : (
                                        'Aprovar Cobrança'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!podeAprovar && pagamento && (
                <div className="alert alert-info mb-0">
                    Esta cobrança já foi aprovada e aguarda pagamento.{' '}
                    <a href="/aguardando-pagamento" className="alert-link">Ver em Aguardando Pagamento</a>
                </div>
            )}

            {!podeAprovar && !pagamento && cobranca.status !== 'aberta' && (
                <div className="alert alert-secondary mb-0">
                    Esta cobrança está com status <strong>{cobranca.status}</strong>.
                </div>
            )}
        </div>
    );
}

export default PaginaCobrancaDetalhe;
