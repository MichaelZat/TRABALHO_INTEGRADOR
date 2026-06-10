import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { get, post, put, obterMensagemErro } from "../servicos/api";

function PaginaPacienteCadastro() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [idConvenio, setIdConvenio] = useState('');
    const [convenios, setConvenios] = useState([]);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        get('convenio').then(setConvenios).catch(() => {});
    }, []);

    useEffect(() => {
        if (!id) return;
        get('paciente/' + id)
            .then((p) => {
                if (!p) return;
                setNome(p.nome || '');
                setCpf(p.cpf || '');
                setDataNascimento(p.data_nascimento || '');
                setIdConvenio(p.id_convenio ? String(p.id_convenio) : '');
            })
            .catch((error) => alert('Erro ao carregar paciente: ' + obterMensagemErro(error)));
    }, [id]);

    const convenioSelecionado = convenios.find((c) => String(c.id_convenio) === idConvenio);

    const salvar = async () => {
        if (!nome || !cpf) {
            alert('Preencha nome e CPF.');
            return;
        }
        setSalvando(true);
        try {
            const payload = {
                nome,
                cpf,
                data_nascimento: dataNascimento || null,
                id_convenio: idConvenio ? Number(idConvenio) : null,
            };
            if (id) {
                await put('paciente/' + id, payload);
            } else {
                await post('paciente', payload);
            }
            navigate('/pacientes');
        } catch (error) {
            alert('Erro ao salvar paciente: ' + obterMensagemErro(error));
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card shadow border-0">
                        <div className="card-header bg-primary text-white py-3">
                            <h5 className="mb-0">
                                {id ? 'Editar Paciente' : 'Novo Paciente'}
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Nome <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nome completo"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    CPF <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="000.000.000-00"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Data de Nascimento</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={dataNascimento}
                                    onChange={(e) => setDataNascimento(e.target.value)}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">Convênio</label>
                                <select
                                    className="form-select"
                                    value={idConvenio}
                                    onChange={(e) => setIdConvenio(e.target.value)}
                                >
                                    <option value="">Sem convênio</option>
                                    {convenios.map((c) => (
                                        <option key={c.id_convenio} value={c.id_convenio}>
                                            {c.nome}
                                        </option>
                                    ))}
                                </select>

                                {convenioSelecionado && (
                                    <div className="mt-2 p-2 bg-light rounded d-flex align-items-center gap-2">
                                        <span className="badge bg-success fs-6">
                                            {convenioSelecionado.percentual_cobertura_plano}%
                                        </span>
                                        <span className="text-muted small">
                                            de cobertura pelo plano
                                        </span>
                                    </div>
                                )}
                            </div>

                            <hr />
                            <div className="d-flex justify-content-between">
                                <button
                                    type="button"
                                    onClick={() => navigate('/pacientes')}
                                    className="btn btn-link text-muted"
                                >
                                    Voltar para a lista
                                </button>
                                <button
                                    onClick={salvar}
                                    className="btn btn-primary px-5"
                                    disabled={salvando}
                                >
                                    {salvando ? (
                                        <><span className="spinner-border spinner-border-sm me-2" />Salvando...</>
                                    ) : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaginaPacienteCadastro;
