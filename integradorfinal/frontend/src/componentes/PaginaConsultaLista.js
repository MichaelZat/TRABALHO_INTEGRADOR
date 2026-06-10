import { useCallback, useEffect, useState } from "react";
import { get2, del2, obterMensagemErro } from "../servicos/api2";

function PaginaConsultaLista() {
    const [consultas, setConsultas] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState('');

    const listar = useCallback(async (status) => {
        setCarregando(true);
        try {
            const params = status ? `?status=${status}` : '';
            const dados = await get2('consulta' + params);
            setConsultas(dados);
        } catch (error) {
            alert('Erro ao listar consultas: ' + obterMensagemErro(error));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        listar('');
    }, [listar]);

    const handleFiltrar = () => listar(filtroStatus);

    const handleLimpar = () => {
        setFiltroStatus('');
        listar('');
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    };

    const badgeStatus = (status) => {
        const mapa = {
            agendada: 'warning text-dark',
            realizada: 'success',
            cancelada: 'secondary',
        };
        return (
            <span className={`badge bg-${mapa[status] || 'secondary'}`}>
                {status}
            </span>
        );
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
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="agendada">Agendada</option>
                                <option value="realizada">Realizada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>
                        <div className="col-md-3 d-flex gap-2">
                            <button className="btn btn-primary flex-fill" onClick={handleFiltrar}>
                                Filtrar
                            </button>
                            <button className="btn btn-outline-secondary flex-fill" onClick={handleLimpar}>
                                Limpar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

           
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 text-primary">Consultas</h4>
                    <a href="/consulta" className="btn btn-success">
                        + Nova Consulta
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
                                    <th>Data</th>
                                    <th>Status</th>
                                    <th>Observações</th>
                                    <th className="text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consultas.map((c) => (
                                    <tr key={c.id_consulta}>
                                        <td className="ps-4">{c.id_consulta}</td>
                                        <td>{c.nome_paciente}</td>
                                        <td>{formatarData(c.data_consulta)}</td>
                                        <td>{badgeStatus(c.status)}</td>
                                        <td className="text-muted small">
                                            {c.observacoes || '-'}
                                        </td>
                                        <td className="text-center">
                                            <a
                                                href={'/consulta/' + c.id_consulta}
                                                className={`btn btn-sm ${c.status === 'realizada' ? 'btn-outline-secondary' : 'btn-outline-warning'}`}
                                            >
                                                {c.status === 'realizada' ? 'Visualizar' : 'Editar'}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                                {consultas.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-5">
                                            Nenhuma consulta encontrada
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

export default PaginaConsultaLista;
