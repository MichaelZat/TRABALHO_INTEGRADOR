import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get2, post2, put2, del2, obterMensagemErro } from "../servicos/api2";
import { get } from "../servicos/api";

const ITEM_VAZIO = { descricao: '', quantidade: 1, valor_unitario: '' };

function PaginaConsultaCadastro() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [pacientes, setPacientes] = useState([]);
    const [idPaciente, setIdPaciente] = useState('');
    const [dataConsulta, setDataConsulta] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [status, setStatus] = useState('agendada');
    const [statusOriginal, setStatusOriginal] = useState('agendada');
    const [observacoes, setObservacoes] = useState('');
    const [itens, setItens] = useState([]);
    const [salvando, setSalvando] = useState(false);
    const [removendoItem, setRemovendoItem] = useState(null);
    const [adicionandoItem, setAdicionandoItem] = useState(false);
    const [novoItem, setNovoItem] = useState({ ...ITEM_VAZIO });

    
    useEffect(() => {
        get('paciente').then(setPacientes).catch(() => {});
    }, []);

    const carregar = useCallback(async () => {
        if (!id) return;
        try {
            const dados = await get2('consulta/' + id);
            const c = dados.consulta;
            setIdPaciente(String(c.id_paciente));
            setDataConsulta(c.data_consulta);
            setStatus(c.status);
            setStatusOriginal(c.status);
            setObservacoes(c.observacoes || '');
            setItens(dados.itens || []);
        } catch (error) {
            alert('Erro ao carregar consulta: ' + obterMensagemErro(error));
        }
    }, [id]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const salvar = async () => {
        if (!idPaciente || !dataConsulta) {
            alert('Selecione o paciente e a data.');
            return;
        }
        setSalvando(true);
        try {
            if (id) {
                await put2('consulta/' + id, { status, observacoes });
                if (status === 'realizada') {
                    navigate('/cobranca/nova');
                } else {
                    navigate('/consultas');
                }
            } else {
                await post2('consulta', {
                    id_paciente: Number(idPaciente),
                    data_consulta: dataConsulta,
                    observacoes: observacoes || null,
                });
                navigate('/consultas');
            }
        } catch (error) {
            alert('Erro ao salvar consulta: ' + obterMensagemErro(error));
        } finally {
            setSalvando(false);
        }
    };

    const adicionarItem = async () => {
        if (!novoItem.descricao || !novoItem.valor_unitario) {
            alert('Preencha descrição e valor unitário.');
            return;
        }
        setAdicionandoItem(true);
        try {
            await post2('consulta/' + id + '/item', {
                descricao: novoItem.descricao,
                quantidade: Number(novoItem.quantidade),
                valor_unitario: Number(novoItem.valor_unitario),
            });
            setNovoItem({ ...ITEM_VAZIO });
            await carregar();
        } catch (error) {
            alert('Erro ao adicionar item: ' + obterMensagemErro(error));
        } finally {
            setAdicionandoItem(false);
        }
    };

    const removerItem = async (idItem) => {
        if (!window.confirm('Deseja remover este item?')) return;
        setRemovendoItem(idItem);
        try {
            await del2('consulta/' + id + '/item/' + idItem);
            await carregar();
        } catch (error) {
            alert('Erro ao remover item: ' + obterMensagemErro(error));
        } finally {
            setRemovendoItem(null);
        }
    };

    const formatarMoeda = (valor) =>
        Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const totalItens = itens.reduce(
        (acc, i) => acc + Number(i.quantidade) * Number(i.valor_unitario),
        0
    );

    const modoEdicao = Boolean(id);
    const bloqueado = modoEdicao && statusOriginal === 'realizada';

    return (
        <div className="container my-5">
            <div className="card shadow border-0 mb-4">
                <div className={`card-header py-3 d-flex justify-content-between align-items-center ${bloqueado ? 'bg-secondary' : 'bg-primary'} text-white`}>
                    <h5 className="mb-0">
                        {bloqueado ? 'Consulta Realizada — somente leitura' : modoEdicao ? 'Editar Consulta' : 'Nova Consulta'}
                    </h5>
                    <a href="/consultas" className="btn btn-light btn-sm">Voltar</a>
                </div>
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">
                                Paciente <span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-select"
                                value={idPaciente}
                                onChange={(e) => setIdPaciente(e.target.value)}
                                disabled={modoEdicao}
                            >
                                <option value="">Selecione o paciente</option>
                                {pacientes.map((p) => (
                                    <option key={p.id_paciente} value={p.id_paciente}>
                                        {p.nome} — {p.cpf}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold">
                                Data <span className="text-danger">*</span>
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                value={dataConsulta}
                                onChange={(e) => setDataConsulta(e.target.value)}
                                disabled={modoEdicao}
                            />
                        </div>
                        {modoEdicao && (
                            <div className="col-md-3">
                                <label className="form-label fw-bold">Status</label>
                                <select
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    disabled={bloqueado}
                                >
                                    <option value="agendada">Agendada</option>
                                    <option value="realizada">Realizada</option>
                                    <option value="cancelada">Cancelada</option>
                                </select>
                            </div>
                        )}
                        <div className="col-12">
                            <label className="form-label fw-bold">Observações</label>
                            <textarea
                                className="form-control"
                                rows={2}
                                placeholder="Observações opcionais..."
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                disabled={bloqueado}
                            />
                        </div>
                    </div>

                    <hr />
                    <div className="d-flex justify-content-between">
                        <a href="/consultas" className="btn btn-link text-muted">
                            {bloqueado ? 'Voltar' : 'Cancelar'}
                        </a>
                        {!bloqueado && (
                            <button
                                onClick={salvar}
                                className="btn btn-primary px-5"
                                disabled={salvando}
                            >
                                {salvando ? (
                                    <><span className="spinner-border spinner-border-sm me-2" />Salvando...</>
                                ) : 'Salvar'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            
            {modoEdicao && (
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            Itens da Consulta
                            {itens.length > 0 && (
                                <span className="ms-2 badge bg-primary">{itens.length}</span>
                            )}
                        </h5>
                        {totalItens > 0 && (
                            <span className="fw-semibold text-success">
                                Total: {formatarMoeda(totalItens)}
                            </span>
                        )}
                    </div>
                    <div className="card-body p-0">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">Descrição</th>
                                    <th style={{ width: 100 }}>Qtd</th>
                                    <th style={{ width: 150 }}>Valor Unit.</th>
                                    <th style={{ width: 150 }} className="text-end">Total</th>
                                    <th style={{ width: 60 }} />
                                </tr>
                            </thead>
                            <tbody>
                                {itens.map((item) => (
                                    <tr key={item.id_consulta_item}>
                                        <td className="ps-4">{item.descricao}</td>
                                        <td>{Number(item.quantidade)}</td>
                                        <td>{formatarMoeda(item.valor_unitario)}</td>
                                        <td className="text-end fw-semibold">
                                            {formatarMoeda(
                                                Number(item.quantidade) * Number(item.valor_unitario)
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {!bloqueado && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => removerItem(item.id_consulta_item)}
                                                    disabled={removendoItem === item.id_consulta_item}
                                                >
                                                    {removendoItem === item.id_consulta_item
                                                        ? <span className="spinner-border spinner-border-sm" />
                                                        : '×'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                
                                {bloqueado && itens.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-3">
                                            Nenhum item registrado.
                                        </td>
                                    </tr>
                                )}
                                {!bloqueado && <tr className="table-light">
                                    <td className="ps-4">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Descrição do procedimento"
                                            value={novoItem.descricao}
                                            onChange={(e) =>
                                                setNovoItem({ ...novoItem, descricao: e.target.value })
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            min="1"
                                            step="1"
                                            value={novoItem.quantidade}
                                            onChange={(e) =>
                                                setNovoItem({ ...novoItem, quantidade: e.target.value })
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            min="0"
                                            step="0.01"
                                            placeholder="0,00"
                                            value={novoItem.valor_unitario}
                                            onChange={(e) =>
                                                setNovoItem({ ...novoItem, valor_unitario: e.target.value })
                                            }
                                        />
                                    </td>
                                    <td className="text-end fw-semibold text-muted">
                                        {novoItem.valor_unitario
                                            ? formatarMoeda(
                                                Number(novoItem.quantidade) *
                                                    Number(novoItem.valor_unitario)
                                            )
                                            : '-'}
                                    </td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={adicionarItem}
                                            disabled={adicionandoItem}
                                            title="Adicionar item"
                                        >
                                            {adicionandoItem
                                                ? <span className="spinner-border spinner-border-sm" />
                                                : '+'}
                                        </button>
                                    </td>
                                </tr>}
                                {!bloqueado && itens.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-3">
                                            Nenhum item adicionado. Use a linha acima para incluir procedimentos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaginaConsultaCadastro;
