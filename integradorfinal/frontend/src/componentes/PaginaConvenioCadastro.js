import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { get3, post3, put3, obterMensagemErro } from "../servicos/api3";

function PaginaConvenioCadastro() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [nome, setNome] = useState('');
    const [percentual, setPercentual] = useState('');
    const [ativo, setAtivo] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (!id) return;
        get3('convenio/' + id)
            .then((c) => {
                if (!c) return;
                setNome(c.nome || '');
                setPercentual(c.percentual_cobertura_plano ?? '');
                setAtivo(c.ativo !== false);
            })
            .catch((error) => alert('Erro ao carregar convênio: ' + obterMensagemErro(error)));
    }, [id]);

    const salvar = async () => {
        if (!nome) {
            alert('Preencha o nome do convênio.');
            return;
        }
        setSalvando(true);
        try {
            const payload = {
                nome,
                percentual_cobertura_plano: percentual !== '' ? Number(percentual) : 0,
                ativo,
            };
            if (id) {
                await put3('convenio/' + id, payload);
            } else {
                await post3('convenio', payload);
            }
            navigate('/convenios');
        } catch (error) {
            alert('Erro ao salvar convênio: ' + obterMensagemErro(error));
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
                                {id ? 'Editar Convênio' : 'Novo Convênio'}
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
                                    placeholder="Nome do convênio"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Percentual de Cobertura (%)
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={percentual}
                                    onChange={(e) => setPercentual(e.target.value)}
                                />
                            </div>

                            <div className="mb-4 form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="ativo"
                                    checked={ativo}
                                    onChange={(e) => setAtivo(e.target.checked)}
                                />
                                <label className="form-check-label fw-bold" htmlFor="ativo">
                                    Convênio ativo
                                </label>
                            </div>

                            <hr />
                            <div className="d-flex justify-content-between">
                                <button
                                    type="button"
                                    onClick={() => navigate('/convenios')}
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

export default PaginaConvenioCadastro;
