export type Caixa = "loja" | "hospitalaria" | "mensalidades";
export type TipoLancamento = "credito" | "debito";
export type CategoriaLancamento =
  | "eventos_confraternizacao"
  | "despesas_da_loja"
  | "mensalidade_de_membro"
  | "taxas_glmmg_per_capta"
  | "taxas_glmmg_fam"
  | "taxas_da_loja"
  | "hospitalaria_repasse"
  | "fraternidade_feminina"
  | "doacoes_diversas"
  | "aplicacao_financeira"
  | "tronco_de_solidariedade"
  | "doacao_acoes_sociais"
  | "outras_hospitalaria"
  | "mensalidade"
  | "joia"
  | "taxa_administrativa";

export const CAIXA_LABELS: Record<Caixa, string> = {
  loja: "Livro Caixa",
  hospitalaria: "Hospitalária",
  mensalidades: "Mensalidades",
};

export const TIPO_LABELS: Record<TipoLancamento, string> = {
  credito: "Crédito",
  debito: "Débito",
};

export const CATEGORIAS_POR_CAIXA: Record<Caixa, CategoriaLancamento[]> = {
  loja: [
    "eventos_confraternizacao",
    "despesas_da_loja",
    "mensalidade_de_membro",
    "taxas_glmmg_per_capta",
    "taxas_glmmg_fam",
    "taxas_da_loja",
    "hospitalaria_repasse",
    "fraternidade_feminina",
    "doacoes_diversas",
    "aplicacao_financeira",
  ],
  hospitalaria: [
    "tronco_de_solidariedade",
    "doacao_acoes_sociais",
    "outras_hospitalaria",
  ],
  mensalidades: ["mensalidade", "joia", "taxa_administrativa"],
};

export const CATEGORIA_LABELS: Record<CategoriaLancamento, string> = {
  eventos_confraternizacao: "Eventos / Confraternização",
  despesas_da_loja: "Despesas da Loja",
  mensalidade_de_membro: "Mensalidade de Membro",
  taxas_glmmg_per_capta: "Taxas da GLMMG (Per Capta)",
  taxas_glmmg_fam: "Taxas da GLMMG (FAM)",
  taxas_da_loja: "Taxas da Loja",
  hospitalaria_repasse: "Hospitalária (Repasse)",
  fraternidade_feminina: "Fraternidade Feminina",
  doacoes_diversas: "Doações Diversas",
  aplicacao_financeira: "Aplicação Financeira",
  tronco_de_solidariedade: "Tronco de Solidariedade",
  doacao_acoes_sociais: "Doação / Ações Sociais",
  outras_hospitalaria: "Outras (Hospitalária)",
  mensalidade: "Mensalidade",
  joia: "Jóia",
  taxa_administrativa: "Taxa Administrativa",
};

export const ALL_CATEGORIAS = Object.keys(CATEGORIA_LABELS) as CategoriaLancamento[];

export const SALDO_INICIAL_FIELD: Record<Caixa, string> = {
  loja: "saldoInicialLoja",
  hospitalaria: "saldoInicialHospitalaria",
  mensalidades: "saldoInicialMensalidades",
};
