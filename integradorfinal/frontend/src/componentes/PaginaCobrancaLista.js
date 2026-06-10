import { useEffect, useState } from "react";
import { get, obterMensagemErro } from "../servicos/api";

function PaginaCobrancaLista() {
    const [cobrancas, setCobrancas] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [filtros, setFiltros] = useState({
        id_paciente: '',
        data_inicio: '',
        data_fim: '',
        tipo_servico: '',
    });

    
    const [modalDetalhes, setModalDetalhes] = useState(null);
    const [itensDetalhes, setItensDetalhes] = useState([]);
    const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

    const listar = async (filtrosAtuais) => {
        setCarregando(true);
        try {
            const params = new URLSearchParams();
            if (filtrosAtuais.id_paciente) params.append('id_paciente', filtrosAtuais.id_paciente);
            if (filtrosAtuais.data_inicio) params.append('data_inicio', filtrosAtuais.data_inicio);
            if (filtrosAtuais.data_fim) params.append('data_fim', filtrosAtuais.data_fim);
            if (filtrosAtuais.tipo_servico) params.append('tipo_servico', filtrosAtuais.tipo_servico);
            const resposta = await get('cobranca?' + params.toString());
            setCobrancas(resposta);
        } catch (error) {
            alert('Erro ao listar cobranças: ' + obterMensagemErro(error));
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        get('paciente').then(setPacientes).catch(() => {});
        listar({ id_paciente: '', data_inicio: '', data_fim: '', tipo_servico: '' });
    }, []);

    const handleFiltrar = () => listar(filtros);
    const handleLimpar = () => {
        const limpo = { id_paciente: '', data_inicio: '', data_fim: '', tipo_servico: '' };
        setFiltros(limpo);
        listar(limpo);
    };

    const abrirDetalhes = async (cobranca) => {
        setModalDetalhes(cobranca);
        setItensDetalhes([]);
        setCarregandoDetalhes(true);
        try {
            const dados = await get('cobranca/' + cobranca.id_cobranca);
            setItensDetalhes(dados.itens || []);
        } catch (error) {
            alert('Erro ao carregar itens: ' + obterMensagemErro(error));
        } finally {
            setCarregandoDetalhes(false);
        }
    };

    const formatarMoeda = (valor) =>
        Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    };

    const badgeStatus = (status) => {
        const mapa = { aberta: 'warning text-dark', paga: 'success', recusada: 'danger', cancelada: 'secondary' };
        return <span className={`badge bg-${mapa[status] || 'secondary'}`}>{status}</span>;
    };

    const badgeTipo = (tipo) => {
        const mapa = { consulta: 'info', exame: 'primary', medicamento: 'success' };
        return <span className={`badge bg-${mapa[tipo] || 'secondary'}`}>{tipo}</span>;
    };

    return (
        <div className="container my-5">
            
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0 text-secondary">Filtros</h5>
                </div>
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label">Paciente</label>
                            <select
                                className="form-select"
                                value={filtros.id_paciente}
                                onChange={(e) => setFiltros({ ...filtros, id_paciente: e.target.value })}
                            >
                                <option value="">Todos</option>
                                {pacientes.map((p) => (
                                    <option key={p.id_paciente} value={p.id_paciente}>{p.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Data Início</label>
                            <input type="date" className="form-control" value={filtros.data_inicio}
                                onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Data Fim</label>
                            <input type="date" className="form-control" value={filtros.data_fim}
                                onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Tipo de Serviço</label>
                            <select className="form-select" value={filtros.tipo_servico}
                                onChange={(e) => setFiltros({ ...filtros, tipo_servico: e.target.value })}>
                                <option value="">Todos</option>
                                <option value="consulta">Consulta</option>
                                <option value="exame">Exame</option>
                                <option value="medicamento">Medicamento</option>
                            </select>
                        </div>
                        <div className="col-md-3 d-flex gap-2">
                            <button className="btn btn-primary flex-fill" onClick={handleFiltrar}>Filtrar</button>
                            <button className="btn btn-outline-secondary flex-fill" onClick={handleLimpar}>Limpar</button>
                        </div>
                    </div>
                </div>
            </div>

           
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 text-primary">Cobranças</h4>
                    <div className="d-flex gap-2">
                        <a href="/aguardando-pagamento" className="btn btn-outline-warning">
                            Aguardando Pagamento
                        </a>
                        <a href="/cobranca/nova" className="btn btn-success">
                            Nova Cobrança
                        </a>
                    </div>
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
                                    <th>Status</th>
                                    <th>Valor Bruto</th>
                                    <th>Cob. Convênio</th>
                                    <th>Valor Líquido</th>
                                    <th>Convênio</th>
                                    <th className="text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cobrancas.map((c) => (
                                    <tr key={c.id_cobranca}>
                                        <td className="ps-4">{c.id_cobranca}</td>
                                        <td>{c.nome_paciente}</td>
                                        <td>{formatarData(c.data_cobranca)}</td>
                                        <td>{badgeStatus(c.status)}</td>
                                        <td>{formatarMoeda(c.valor_bruto)}</td>
                                        <td className="text-success">
                                            {Number(c.valor_coberto_convenio) > 0
                                                ? `- ${formatarMoeda(c.valor_coberto_convenio)}`
                                                : '-'}
                                        </td>
                                        <td><strong>{formatarMoeda(c.valor_liquido)}</strong></td>
                                        <td>{c.nome_convenio || <span className="text-muted">-</span>}</td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => abrirDetalhes(c)}
                                            >
                                                Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {cobrancas.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="text-center text-muted py-5">
                                            Nenhuma cobrança encontrada
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            
            {modalDetalhes && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Detalhes da Cobrança #{modalDetalhes.id_cobranca}
                                    <span className="ms-2 text-muted small">
                                        — {modalDetalhes.nome_paciente}
                                    </span>
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setModalDetalhes(null)}
                                />
                            </div>
                            <div className="modal-body p-0">
                                {carregandoDetalhes ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" />
                                    </div>
                                ) : (
                                    <table className="table align-middle mb-0">
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
                                            {itensDetalhes.map((item) => (
                                                <tr key={item.id_cobranca_item}>
                                                    <td className="ps-4">{badgeTipo(item.tipo_servico)}</td>
                                                    <td>{item.descricao_item}</td>
                                                    <td className="text-center">{Number(item.quantidade)}</td>
                                                    <td className="text-end">{formatarMoeda(item.valor_unitario)}</td>
                                                    <td className="text-end pe-4 fw-semibold">
                                                        {formatarMoeda(item.valor_total_item)}
                                                    </td>
                                                </tr>
                                            ))}
                                            {itensDetalhes.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="text-center text-muted py-4">
                                                        Nenhum item registrado
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {itensDetalhes.length > 0 && (
                                            <tfoot className="table-light">
                                                <tr>
                                                    <td colSpan="4" className="text-end fw-bold pe-3">
                                                        Valor Líquido
                                                    </td>
                                                    <td className="text-end pe-4 fw-bold text-primary">
                                                        {formatarMoeda(modalDetalhes.valor_liquido)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setModalDetalhes(null)}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaginaCobrancaLista;
