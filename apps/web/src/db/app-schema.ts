import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  integer,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { user, organization } from "./auth-schema";

// ── Enums ──

export const grauEnum = pgEnum("grau", ["1", "2", "3"]);

export const cargoEnum = pgEnum("cargo", [
  "veneravel_mestre",
  "primeiro_vigilante",
  "segundo_vigilante",
  "orador",
  "secretario",
  "tesoureiro",
  "chanceler",
  "mestre_de_cerimonias",
  "primeiro_diacono",
  "segundo_diacono",
  "hospitaleiro",
  "cobridor_interno",
  "cobridor_externo",
  "primeiro_experto",
  "segundo_experto",
  "arquiteto",
  "bibliotecario",
  "porta_bandeira",
  "porta_estandarte",
  "porta_espada",
  "mestre_de_harmonia",
  "mestre_de_banquetes",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "folder",
  "pdf",
  "ppt",
  "doc",
  "image",
  "other",
]);

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "pendente",
  "em_andamento",
  "enviado",
  "aprovado",
  "recusado",
]);

export const notificationTargetEnum = pgEnum("notification_target", [
  "todos",
  "grau_1",
  "grau_2",
  "grau_3",
  "luz",
]);

export const accessRequestStatusEnum = pgEnum("access_request_status", [
  "pendente",
  "aprovado",
  "recusado",
]);

// ── Tables ──

export const memberProfile = pgTable(
  "member_profile",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    grau: grauEnum("grau").default("1").notNull(),
    cargo: cargoEnum("cargo"),
    telefone: text("telefone"),
    dataNascimento: timestamp("data_nascimento"),
    dataIniciacao: timestamp("data_iniciacao"),
    dataElevacao: timestamp("data_elevacao"),
    dataExaltacao: timestamp("data_exaltacao"),
    cim: text("cim"),
    ativo: boolean("ativo").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("memberProfile_userId_idx").on(t.userId),
    index("memberProfile_orgId_idx").on(t.organizationId),
    unique("memberProfile_org_cargo_uniq").on(t.organizationId, t.cargo),
  ],
);

export const memberHistory = pgTable("member_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  memberProfileId: text("member_profile_id")
    .notNull()
    .references(() => memberProfile.id, { onDelete: "cascade" }),
  campo: text("campo").notNull(),
  valorAnterior: text("valor_anterior"),
  valorNovo: text("valor_novo"),
  alteradoPor: text("alterado_por")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentos = pgTable(
  "documentos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    pastaPaiId: text("pasta_pai_id"),
    tipo: documentTypeEnum("tipo").notNull(),
    nome: text("nome").notNull(),
    descricao: text("descricao"),
    storageKey: text("storage_key"),
    mimeType: text("mime_type"),
    tamanho: integer("tamanho"),
    grauMinimo: grauEnum("grau_minimo").default("1").notNull(),
    criadoPor: text("criado_por")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("documentos_orgId_idx").on(t.organizationId),
    index("documentos_pastaId_idx").on(t.pastaPaiId),
  ],
);

export const eventos = pgTable(
  "eventos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    titulo: text("titulo").notNull(),
    descricao: text("descricao"),
    local: text("local"),
    dataInicio: timestamp("data_inicio").notNull(),
    dataFim: timestamp("data_fim"),
    diaInteiro: boolean("dia_inteiro").default(false).notNull(),
    grauMinimo: grauEnum("grau_minimo").default("1").notNull(),
    criadoPor: text("criado_por")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("eventos_orgId_idx").on(t.organizationId),
    index("eventos_dataInicio_idx").on(t.dataInicio),
  ],
);

export const lojaInfo = pgTable("loja_info", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: text("organization_id")
    .notNull()
    .unique()
    .references(() => organization.id, { onDelete: "cascade" }),
  nomeCompleto: text("nome_completo"),
  numero: text("numero"),
  oriente: text("oriente"),
  potencia: text("potencia"),
  endereco: text("endereco"),
  cep: text("cep"),
  cidade: text("cidade"),
  estado: text("estado"),
  telefone: text("telefone"),
  email: text("email"),
  pixChave: text("pix_chave"),
  pixQrCode: text("pix_qr_code"),
  diasSessao: text("dias_sessao"),
  horarioSessao: text("horario_sessao"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const socialLinks = pgTable(
  "social_links",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    plataforma: text("plataforma").notNull(),
    titulo: text("titulo").notNull(),
    url: text("url").notNull(),
    icone: text("icone"),
    ordem: integer("ordem").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("socialLinks_orgId_idx").on(t.organizationId)],
);

export const notificacoes = pgTable(
  "notificacoes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    titulo: text("titulo").notNull(),
    corpo: text("corpo").notNull(),
    publicoAlvo: notificationTargetEnum("publico_alvo")
      .default("todos")
      .notNull(),
    expiraEm: timestamp("expira_em"),
    enviarEmail: boolean("enviar_email").default(false).notNull(),
    criadoPor: text("criado_por")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("notificacoes_orgId_idx").on(t.organizationId)],
);

export const notificacoesLidas = pgTable(
  "notificacoes_lidas",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    notificacaoId: text("notificacao_id")
      .notNull()
      .references(() => notificacoes.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lidaEm: timestamp("lida_em").defaultNow().notNull(),
  },
  (t) => [
    unique("notificacoesLidas_uniq").on(t.notificacaoId, t.userId),
    index("notificacoesLidas_userId_idx").on(t.userId),
  ],
);

export const trabalhos = pgTable(
  "trabalhos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    titulo: text("titulo").notNull(),
    descricao: text("descricao"),
    prazo: timestamp("prazo"),
    status: assignmentStatusEnum("status").default("pendente").notNull(),
    atribuidoA: text("atribuido_a")
      .notNull()
      .references(() => user.id),
    criadoPor: text("criado_por")
      .notNull()
      .references(() => user.id),
    feedbackAdmin: text("feedback_admin"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("trabalhos_orgId_idx").on(t.organizationId),
    index("trabalhos_atribuidoA_idx").on(t.atribuidoA),
  ],
);

export const envios = pgTable(
  "envios",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    trabalhoId: text("trabalho_id")
      .notNull()
      .references(() => trabalhos.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    storageKey: text("storage_key").notNull(),
    nomeArquivo: text("nome_arquivo").notNull(),
    mimeType: text("mime_type"),
    tamanho: integer("tamanho"),
    comentario: text("comentario"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("envios_trabalhoId_idx").on(t.trabalhoId)],
);

export const accessRequests = pgTable(
  "access_requests",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mensagem: text("mensagem"),
    status: accessRequestStatusEnum("status").default("pendente").notNull(),
    resolvidoPor: text("resolvido_por").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    resolvidoEm: timestamp("resolvido_em"),
  },
  (t) => [
    index("accessRequests_userId_idx").on(t.userId),
    index("accessRequests_status_idx").on(t.status),
  ],
);

// ── Relations ──

export const accessRequestsRelations = relations(accessRequests, ({ one }) => ({
  user: one(user, {
    fields: [accessRequests.userId],
    references: [user.id],
  }),
}));

export const memberProfileRelations = relations(memberProfile, ({ one, many }) => ({
  user: one(user, {
    fields: [memberProfile.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [memberProfile.organizationId],
    references: [organization.id],
  }),
  history: many(memberHistory),
}));

export const memberHistoryRelations = relations(memberHistory, ({ one }) => ({
  memberProfile: one(memberProfile, {
    fields: [memberHistory.memberProfileId],
    references: [memberProfile.id],
  }),
  alteradoPorUser: one(user, {
    fields: [memberHistory.alteradoPor],
    references: [user.id],
  }),
}));

export const documentosRelations = relations(documentos, ({ one, many }) => ({
  organization: one(organization, {
    fields: [documentos.organizationId],
    references: [organization.id],
  }),
  pastaPai: one(documentos, {
    fields: [documentos.pastaPaiId],
    references: [documentos.id],
    relationName: "parentFolder",
  }),
  filhos: many(documentos, { relationName: "parentFolder" }),
  criadoPorUser: one(user, {
    fields: [documentos.criadoPor],
    references: [user.id],
  }),
}));

export const eventosRelations = relations(eventos, ({ one }) => ({
  organization: one(organization, {
    fields: [eventos.organizationId],
    references: [organization.id],
  }),
  criadoPorUser: one(user, {
    fields: [eventos.criadoPor],
    references: [user.id],
  }),
}));

export const lojaInfoRelations = relations(lojaInfo, ({ one }) => ({
  organization: one(organization, {
    fields: [lojaInfo.organizationId],
    references: [organization.id],
  }),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  organization: one(organization, {
    fields: [socialLinks.organizationId],
    references: [organization.id],
  }),
}));

export const notificacoesRelations = relations(notificacoes, ({ one, many }) => ({
  organization: one(organization, {
    fields: [notificacoes.organizationId],
    references: [organization.id],
  }),
  criadoPorUser: one(user, {
    fields: [notificacoes.criadoPor],
    references: [user.id],
  }),
  lidas: many(notificacoesLidas),
}));

export const notificacoesLidasRelations = relations(notificacoesLidas, ({ one }) => ({
  notificacao: one(notificacoes, {
    fields: [notificacoesLidas.notificacaoId],
    references: [notificacoes.id],
  }),
  user: one(user, {
    fields: [notificacoesLidas.userId],
    references: [user.id],
  }),
}));

export const trabalhosRelations = relations(trabalhos, ({ one, many }) => ({
  organization: one(organization, {
    fields: [trabalhos.organizationId],
    references: [organization.id],
  }),
  atribuidoAUser: one(user, {
    fields: [trabalhos.atribuidoA],
    references: [user.id],
  }),
  criadoPorUser: one(user, {
    fields: [trabalhos.criadoPor],
    references: [user.id],
  }),
  envios: many(envios),
}));

export const enviosRelations = relations(envios, ({ one }) => ({
  trabalho: one(trabalhos, {
    fields: [envios.trabalhoId],
    references: [trabalhos.id],
  }),
  user: one(user, {
    fields: [envios.userId],
    references: [user.id],
  }),
}));
