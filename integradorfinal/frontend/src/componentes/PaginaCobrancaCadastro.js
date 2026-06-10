import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { post, put, obterMensagemErro } from "../servicos/api";
import { get2 } from "../servicos/api2";

function PaginaCobrancaCadastro() {
    const navigate = useNavigate();
    const [consultasRealizadas, setConsultasRealizadas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [consultaSelecionada, setConsultaSelecionada] = useState(null);
    const [itens, setItens] = useState([]);

    // Modal de pagamento
    const [modalPagamento, setModalPagamento] = useState(false);
    const [formaPagamento, setFormaPagamento] = useState('dinheiro');
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        get2('consulta/realizadas')
            .then(setConsultasRealizadas)
            .catch(() => {})
            .finally(() => setCarregando(false));
    }, []);

    const selecionarConsulta = async (consulta) => {
        try {
            const dados = await get2('consulta/' + consulta.id_consulta);
            setConsultaSelecionada(consulta);
            setItens(
                (dados.itens || []).map((i) => ({
                    tipo_servico: 'consulta',
                    id_origem: i.id_consulta_item,
                    descricao: i.descricao,
                    quantidade: Number(i.quantidade),
                    valor_unitario: Number(i.valor_unitario),
                }))
            );
        } catch (error) {
            alert('Erro ao carregar itens da consulta: ' + obterMensagemErro(error));
        }
    };

    const atualizarItem = (index, campo, valor) => {
        const novos = [...itens];
        novos[index] = { ...novos[index], [campo]: valor };
        setItens(novos);
    };

    const removerItem = (index) => {
        if (itens.length === 1) return;
        setItens(itens.filter((_, i) => i !== index));
    };

    const percentualCobertura = consultaSelecionada
        ? Number(consultaSelecionada.percentual_cobertura_plano || 0)
        : 0;

    const valorBruto = itens.reduce(
        (acc, i) => acc + Number(i.quantidade || 0) * Number(i.valor_unitario || 0),
        0
    );
    const valorCoberto = valorBruto * (percentualCobertura / 100);
    const valorLiquido = valorBruto - valorCoberto;

    const formatarMoeda = (valor) =>
        Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    };

    const abrirModalPagamento = () => {
        if (!consultaSelecionada) {
            alert('Selecione uma consulta.');
            return;
        }
        if (itens.length === 0 || itens.some((i) => !i.descricao || !i.valor_unitario)) {
            alert('A consulta precisa ter pelo menos um item com descrição e valor.');
            return;
        }
        
        setFormaPagamento(
            Number(consultaSelecionada.percentual_cobertura_plano) === 100 ? 'convenio' : 'dinheiro'
        );
        setModalPagamento(true);
    };

    const confirmarCobranca = async () => {
        setSalvando(true);
        try {
            
            const cobranca = await post('cobranca', {
                id_paciente: Number(consultaSelecionada.id_paciente),
                id_convenio: consultaSelecionada.id_convenio
                    ? Number(consultaSelecionada.id_convenio)
                    : null,
                id_consulta: Number(consultaSelecionada.id_consulta),
                itens: itens.map((i) => ({
                    tipo_servico: i.tipo_servico,
                    id_origem: i.id_origem || 0,
                    descricao: i.descricao,
                    quantidade: Number(i.quantidade),
                    valor_unitario: Number(i.valor_unitario),
                })),
            });
            
            await put('cobranca/' + cobranca.id_cobranca + '/aprovar', {
                forma_pagamento: formaPagamento,
            });
            setModalPagamento(false);
            alert('Cobrança gerada e confirmada com sucesso!');
            navigate('/aguardando-pagamento');
        } catch (error) {
            alert('Erro ao gerar cobrança: ' + obterMensagemErro(error));
        } finally {
            setSalvando(false);
        }
    };

    
    if (!consultaSelecionada) {
        return (
            <div className="container my-5">
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h4 className="mb-0 text-primary">Nova Cobrança — Selecionar Consulta</h4>
                        <a href="/cobrancas" className="btn btn-outline-secondary btn-sm">Voltar</a>
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
                                        <th>Data</th>
                                        <th>Convênio</th>
                                        <th className="text-center">Itens</th>
                                        <th className="text-end">Valor Total</th>
                                        <th className="text-center">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consultasRealizadas.map((c) => (
                                        <tr key={c.id_consulta}>
                                            <td className="ps-4">{c.id_consulta}</td>
                                            <td>{c.nome_paciente}</td>
                                            <td>{formatarData(c.data_consulta)}</td>
                                            <td>
                                                {c.nome_convenio ? (
                                                    <>
                                                        {c.nome_convenio}
                                                        <span className="ms-1 badge bg-info">
                                                            {c.percentual_cobertura_plano}%
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-muted">Sem convênio</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <span className="badge bg-secondary">
                                                    {c.total_itens}
                                                </span>
                                            </td>
                                            <td className="text-end fw-semibold">
                                                {formatarMoeda(c.valor_total)}
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => selecionarConsulta(c)}
                                                >
                                                    Selecionar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {consultasRealizadas.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted py-5">
                                                Nenhuma consulta realizada pendente de cobrança
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

    
    return (
        <div className="container my-5">
            
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 text-primary">Nova Cobrança</h4>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => { setConsultaSelecionada(null); setItens([]); }}
                    >
                        Trocar Consulta
                    </button>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <p className="text-muted small mb-1">Paciente</p>
                            <p className="fw-bold">{consultaSelecionada.nome_paciente}</p>
                        </div>
                        <div className="col-md-4">
                            <p className="text-muted small mb-1">Data da Consulta</p>
                            <p>{formatarData(consultaSelecionada.data_consulta)}</p>
                        </div>
                        <div className="col-md-4">
                            <p className="text-muted small mb-1">Convênio</p>
                            <p>
                                {consultaSelecionada.nome_convenio || (
                                    <span className="text-muted">Sem convênio</span>
                                )}
                                {percentualCobertura > 0 && (
                                    <span className="ms-2 badge bg-info">
                                        {percentualCobertura}% cobertura
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0">Itens da Cobrança</h5>
                </div>
                <div className="card-body p-0">
                    <table className="table align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4" style={{ width: 150 }}>Tipo</th>
                                <th>Descrição</th>
                                <th style={{ width: 110 }}>Qtd</th>
                                <th style={{ width: 150 }}>Valor Unit. (R$)</th>
                                <th style={{ width: 130 }} className="text-end">Total</th>
                                <th style={{ width: 60 }} />
                            </tr>
                        </thead>
                        <tbody>
                            {itens.map((item, index) => (
                                <tr key={index}>
                                    <td className="ps-4">
                                        <select
                                            className="form-select form-select-sm"
                                            value={item.tipo_servico}
                                            onChange={(e) =>
                                                atualizarItem(index, 'tipo_servico', e.target.value)
                                            }
                                        >
                                            <option value="consulta">Consulta</option>
                                            <option value="exame">Exame</option>
                                            <option value="medicamento">Medicamento</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={item.descricao}
                                            onChange={(e) =>
                                                atualizarItem(index, 'descricao', e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            min="1"
                                            value={item.quantidade}
                                            onChange={(e) =>
                                                atualizarItem(index, 'quantidade', e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            min="0"
                                            step="0.01"
                                            value={item.valor_unitario}
                                            onChange={(e) =>
                                                atualizarItem(index, 'valor_unitario', e.target.value)
                                            }
                                        />
                                    </td>
                                    <td className="text-end fw-semibold">
                                        {formatarMoeda(
                                            Number(item.quantidade || 0) *
                                                Number(item.valor_unitario || 0)
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removerItem(index)}
                                            disabled={itens.length === 1}
                                        >
                                            &times;
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="row justify-content-end">
                        <div className="col-md-4">
                            <table className="table table-sm table-borderless">
                                <tbody>
                                    <tr>
                                        <td className="text-muted">Valor Bruto</td>
                                        <td className="text-end">{formatarMoeda(valorBruto)}</td>
                                    </tr>
                                    {percentualCobertura > 0 && (
                                        <tr className="text-success">
                                            <td>Cobertura ({percentualCobertura}%)</td>
                                            <td className="text-end">- {formatarMoeda(valorCoberto)}</td>
                                        </tr>
                                    )}
                                    <tr className="fw-bold border-top fs-5">
                                        <td>Valor Líquido</td>
                                        <td className="text-end">{formatarMoeda(valorLiquido)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
                <a href="/cobrancas" className="btn btn-outline-secondary px-4">Cancelar</a>
                <button
                    className="btn btn-success px-5"
                    onClick={abrirModalPagamento}
                >
                    Gerar Cobrança
                </button>
            </div>

            
            {modalPagamento && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirmar Forma de Pagamento</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setModalPagamento(false)}
                                    disabled={salvando}
                                />
                            </div>
                            <div className="modal-body">
                                <p className="mb-1">
                                    <span className="text-muted">Paciente:</span>{' '}
                                    <strong>{consultaSelecionada.nome_paciente}</strong>
                                </p>
                                <p className="mb-3">
                                    <span className="text-muted">Valor líquido:</span>{' '}
                                    <strong className="text-primary fs-5">
                                        {formatarMoeda(valorLiquido)}
                                    </strong>
                                </p>
                                <label className="form-label fw-semibold">Forma de Pagamento</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {['dinheiro', 'cartao', 'pix', 'boleto'].map((forma) => (
                                        <button
                                            key={forma}
                                            type="button"
                                            className={`btn ${formaPagamento === forma ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setFormaPagamento(forma)}
                                            disabled={salvando}
                                        >
                                            {forma.charAt(0).toUpperCase() + forma.slice(1)}
                                        </button>
                                    ))}
                                    {Number(consultaSelecionada.percentual_cobertura_plano) === 100 && (
                                        <button
                                            type="button"
                                            className={`btn ${formaPagamento === 'convenio' ? 'btn-success' : 'btn-outline-success'}`}
                                            onClick={() => setFormaPagamento('convenio')}
                                            disabled={salvando}
                                        >
                                            Convênio (100%)
                                        </button>
                                    )}
                                </div>
                                {Number(consultaSelecionada.percentual_cobertura_plano) === 100 && (
                                    <p className="mt-2 text-muted small">
                                        Plano com cobertura total — pagamento via convênio disponível.
                                    </p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setModalPagamento(false)}
                                    disabled={salvando}
                                >
                                    Voltar
                                </button>
                                <button
                                    className="btn btn-success px-4"
                                    onClick={confirmarCobranca}
                                    disabled={salvando}
                                >
                                    {salvando ? (
                                        <><span className="spinner-border spinner-border-sm me-2" />Gerando...</>
                                    ) : 'Confirmar e Gerar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaginaCobrancaCadastro;
