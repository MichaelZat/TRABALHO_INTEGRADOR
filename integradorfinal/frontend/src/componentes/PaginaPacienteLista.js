import { useCallback, useEffect, useState } from "react";
import { get, del, obterMensagemErro } from "../servicos/api";

function PaginaPacienteLista() {
    const [pacientes, setPacientes] = useState([]);

    const listar = useCallback(async () => {
        try {
            const resposta = await get('paciente');
            setPacientes(resposta);
        } catch (error) {
            alert("Erro ao listar pacientes: " + obterMensagemErro(error));
        }
    }, []);

    const excluir = async (id) => {
        if (!window.confirm('Deseja excluir este paciente?')) return;
        try {
            await del('paciente/' + id);
            listar();
        } catch (error) {
            alert("Erro ao excluir paciente: " + obterMensagemErro(error));
        }
    };

    useEffect(() => {
        listar();
    }, [listar]);

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    };

    return (
        <div className="container my-5">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 text-primary">Pacientes Cadastrados</h4>
                    <a href="/paciente" className="btn btn-success">
                        + Novo Paciente
                    </a>
                </div>
                <div className="card-body p-0">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">ID</th>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>Nascimento</th>
                                <th>Convênio</th>
                                <th className="text-center">Desconto</th>
                                <th className="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pacientes.map((p) => (
                                <tr key={p.id_paciente}>
                                    <td className="ps-4">{p.id_paciente}</td>
                                    <td>{p.nome}</td>
                                    <td><code>{p.cpf}</code></td>
                                    <td>{formatarData(p.data_nascimento)}</td>
                                    <td>
                                        {p.nome_convenio || (
                                            <span className="text-muted">Sem convênio</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        {p.percentual_cobertura_plano > 0 ? (
                                            <span className="badge bg-success">
                                                {p.percentual_cobertura_plano}%
                                            </span>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <div className="btn-group">
                                            <a
                                                href={'/paciente/' + p.id_paciente}
                                                className="btn btn-sm btn-outline-warning"
                                            >
                                                Editar
                                            </a>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => excluir(p.id_paciente)}
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pacientes.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-5">
                                        Nenhum paciente cadastrado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default PaginaPacienteLista;
