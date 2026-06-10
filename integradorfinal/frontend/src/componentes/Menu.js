import { useLocation } from 'react-router-dom';

function Menu() {
    const location = useLocation();

    const ativo = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/')
            ? 'nav-link active'
            : 'nav-link';

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container">
                <a className="navbar-brand fw-bold" href="/cobrancas">
                    Sistema de Cobranças
                </a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <a className={ativo('/pacientes')} href="/pacientes">
                                Pacientes
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={ativo('/consultas')} href="/consultas">
                                Consultas
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={ativo('/cobrancas')} href="/cobrancas">
                                Cobranças
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={ativo('/aguardando-pagamento')} href="/aguardando-pagamento">
                                Aguardando Pagamento
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={ativo('/convenios')} href="/convenios">
                                Convênios
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Menu;
