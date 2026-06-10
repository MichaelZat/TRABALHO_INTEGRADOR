

CREATE TABLE paciente (
    id_paciente BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    id_convenio BIGINT NOT NULL,
);

CREATE TABLE convenio (
    id_convenio BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    percentual_cobertura_plano NUMERIC(5,2) NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cobranca (
    id_cobranca BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL,
    id_convenio BIGINT,
    data_cobranca DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'aberta',
    valor_bruto NUMERIC(10,2) NOT NULL DEFAULT 0,
    valor_desconto NUMERIC(10,2) NOT NULL DEFAULT 0,
    valor_coberto_convenio NUMERIC(10,2) NOT NULL DEFAULT 0,
    valor_liquido NUMERIC(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_cobranca_paciente
        FOREIGN KEY (id_paciente)
        REFERENCES paciente (id_paciente),

	CONSTRAINT fk_paciente_convenio
        FOREIGN KEY (id_convenio)
		REFERENCES convenio (id_convenio);

    CONSTRAINT fk_cobranca_convenio
        FOREIGN KEY (id_convenio)
        REFERENCES convenio (id_convenio),

    CONSTRAINT chk_cobranca_status
        CHECK (status IN (
            'aberta',
            'paga',
            'recusada',
            'cancelada'
        ))

);

CREATE TABLE cobranca_item (
    id_cobranca_item BIGSERIAL PRIMARY KEY,
    id_cobranca BIGINT NOT NULL,
    tipo_servico VARCHAR(30) NOT NULL,
    id_origem BIGINT NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    quantidade NUMERIC(10,2) NOT NULL DEFAULT 1,
    valor_unitario NUMERIC(10,2) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_item_cobranca
        FOREIGN KEY (id_cobranca)
        REFERENCES cobranca (id_cobranca)
        ON DELETE CASCADE,

    CONSTRAINT chk_tipo_servico
        CHECK (tipo_servico IN (
            'consulta',
            'exame',
            'medicamento'
        )),

    CONSTRAINT chk_quantidade_item
        CHECK (quantidade > 0),

    CONSTRAINT chk_valor_unitario_item
        CHECK (valor_unitario >= 0)

);

CREATE TABLE pagamento (
    id_pagamento BIGSERIAL PRIMARY KEY,
    id_cobranca BIGINT NOT NULL,
    valor_pago NUMERIC(10,2) NOT NULL,
    forma_pagamento VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pagamento_cobranca
        FOREIGN KEY (id_cobranca)
        REFERENCES cobranca (id_cobranca),

    CONSTRAINT chk_valor_pago
        CHECK (valor_pago >= 0),

    CONSTRAINT chk_forma_pagamento
        CHECK (forma_pagamento IN (
            'dinheiro',
            'cartao',
            'pix',
            'boleto',
            'convenio'
        )),

    CONSTRAINT chk_pagamento_status
        CHECK (status IN (
	    'pendente',
	    'paga',
	    'recusada',
	    'cancelada'
)));

INSERT INTO paciente (nome, cpf, data_nascimento) VALUES
('Ana Souza', '111.111.111-11', '1995-04-10'),
('Carlos Lima', '222.222.222-22', '1988-09-15'),
('Mariana Alves', '333.333.333-33', '2001-01-20'),
('Joao Pereira', '444.444.444-44', '1979-06-05'),
('Fernanda Rocha', '555.555.555-55', '1992-11-30');

INSERT INTO convenio (nome, percentual_cobertura_plano, ativo) VALUES
('Unimed', 70.00, TRUE),
('Saude Total', 80.00, TRUE),
('Plano Vida', 60.00, TRUE),
('Particular', 0.00, TRUE),
('Convenio Empresarial', 50.00, TRUE);

--Criação de 1 View que deve ser utilizada pelo sistema 
CREATE VIEW cobranca_detalhada AS
SELECT
    ci.id_cobranca_item,
    ci.id_cobranca,
    ci.tipo_servico,
    ci.descricao               AS descricao_item,
    ci.quantidade,
    ci.valor_unitario,
    ci.quantidade * ci.valor_unitario AS valor_total_item
FROM cobranca_item ci;
select * from cobranca_detalhada

--Criação de 1 Stored Procedure que deve ser utilizada pelo sistema 
CREATE OR REPLACE FUNCTION fn_atualizar_status_cobranca()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paga' THEN
        UPDATE cobranca
        SET status = 'paga'
        WHERE id_cobranca = NEW.id_cobranca;

    ELSIF NEW.status = 'recusada' THEN
        UPDATE cobranca
        SET status = 'recusada'
        WHERE id_cobranca = NEW.id_cobranca;

    ELSIF NEW.status = 'cancelada' THEN
        UPDATE cobranca
        SET status = 'cancelada'
        WHERE id_cobranca = NEW.id_cobranca;

    ELSIF NEW.status = 'pendente' THEN
        UPDATE cobranca
        SET status = 'aberta'
        WHERE id_cobranca = NEW.id_cobranca;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--Criação de 1 Trigger que deve ser utilizada pelo sistema 
CREATE TRIGGER trg_atualizar_status_cobranca
AFTER INSERT OR UPDATE OF status
ON pagamento
FOR EACH ROW
EXECUTE FUNCTION fn_atualizar_status_cobranca();


select * from
select * from
select * from
select * from


