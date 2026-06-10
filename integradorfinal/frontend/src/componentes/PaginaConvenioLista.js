import { useCallback, useEffect, useState } from "react";
import { get3, del3, obterMensagemErro } from "../servicos/api3";

function PaginaConvenioLista() {
    const [convenios, setConvenios] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [filtroAtivo, setFiltroAtivo] = useState('');

    const listar = useCallback(async (ativo) => {
        setCarregando(true);
        try {
            const params = ativo !== '' ? `?ativo=${ativo}` : '';
            const dados = await get3('convenio' + params);
            setConvenios(dados);
        } catch (error) {
            alert('Erro ao listar convênios: ' + obterMensagemErro(error));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        listar('');
    }, [listar]);

    const handleFiltrar = () => listar(filtroAtivo);

    const handleLimpar = () => {
        setFiltroAtivo('');
        listar('');
    };

    const badgeAtivo = (ativo) => (
        <span className={`badge bg-${ativo ? 'success' : 'secondary'}`}>
            {ativo ? 'Ativo' : 'Inativo'}
        </span>
    );

    return (
        <div className="container my-5">
           
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0 text-secondary">Filtros</h5>
                </div>
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label">Situação</label>
                            <select
                                className="form-select"
                                value={filtroAtivo}
                                onChange={(e) => setFiltroAtivo(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="true">Ativos</option>
                                <option value="false">Inativos</option>
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
                    <h4 className="mb-0 text-primary">Convênios</h4>
                    <a href="/convenio" className="btn btn-success">
                        + Novo Convênio
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
                                    <th>Nome</th>
                                    <th>Cobertura</th>
                                    <th>Situação</th>
                                    <th className="text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {convenios.map((c) => (
                                    <tr key={c.id_convenio}>
                                        <td className="ps-4">{c.id_convenio}</td>
                                        <td>{c.nome}</td>
                                        <td>{c.percentual_cobertura_plano}%</td>
                                        <td>{badgeAtivo(c.ativo)}</td>
                                        <td className="text-center">
                                            <a
                                                href={'/convenio/' + c.id_convenio}
                                                className="btn btn-sm btn-outline-warning"
                                            >
                                                Editar
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                                {convenios.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-5">
                                            Nenhum convênio encontrado
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

export default PaginaConvenioLista;
