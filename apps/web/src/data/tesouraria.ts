import { eq, and, gte, lt, desc, sql, asc } from "drizzle-orm";
import { db } from "@/db";
import { lancamentos, saldosMensais, lojaInfo, memberProfile } from "@/db/app-schema";
import { user } from "@/db/auth-schema";
import type { Caixa, CategoriaLancamento, TipoLancamento } from "@/lib/tesouraria-constants";

// ── Helpers ──

function monthStart(mes: string): Date {
  return new Date(`${mes}-01T00:00:00`);
}

function nextMonthStart(mes: string): Date {
  const d = new Date(`${mes}-01T00:00:00`);
  d.setMonth(d.getMonth() + 1);
  return d;
}

// ── Queries ──

export interface LancamentoFilters {
  caixa?: Caixa;
  mes?: string;
  categoria?: CategoriaLancamento;
  tipo?: TipoLancamento;
  membroId?: string;
  limit?: number;
  offset?: number;
}

export async function getLancamentos(orgId: string, filters: LancamentoFilters = {}) {
  const conditions = [eq(lancamentos.organizationId, orgId)];

  if (filters.caixa) conditions.push(eq(lancamentos.caixa, filters.caixa));
  if (filters.categoria) conditions.push(eq(lancamentos.categoria, filters.categoria));
  if (filters.tipo) conditions.push(eq(lancamentos.tipo, filters.tipo));
  if (filters.membroId) conditions.push(eq(lancamentos.membroId, filters.membroId));
  if (filters.mes) {
    conditions.push(gte(lancamentos.data, monthStart(filters.mes)));
    conditions.push(lt(lancamentos.data, nextMonthStart(filters.mes)));
  }

  const rows = await db
    .select({
      id: lancamentos.id,
      caixa: lancamentos.caixa,
      data: lancamentos.data,
      valor: lancamentos.valor,
      tipo: lancamentos.tipo,
      categoria: lancamentos.categoria,
      descricao: lancamentos.descricao,
      membroId: lancamentos.membroId,
      mesReferencia: lancamentos.mesReferencia,
      criadoPor: lancamentos.criadoPor,
      criadoPorNome: user.name,
      createdAt: lancamentos.createdAt,
    })
    .from(lancamentos)
    .innerJoin(user, eq(lancamentos.criadoPor, user.id))
    .where(and(...conditions))
    .orderBy(desc(lancamentos.data), desc(lancamentos.createdAt))
    .limit(filters.limit ?? 200)
    .offset(filters.offset ?? 0);

  return rows;
}

export async function getLancamentoById(orgId: string, id: string) {
  const rows = await db
    .select()
    .from(lancamentos)
    .where(and(eq(lancamentos.organizationId, orgId), eq(lancamentos.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createLancamento(data: {
  organizationId: string;
  caixa: Caixa;
  data: Date;
  valor: number;
  tipo: TipoLancamento;
  categoria: CategoriaLancamento;
  descricao?: string;
  membroId?: string;
  mesReferencia?: string;
  criadoPor: string;
}) {
  const [row] = await db.insert(lancamentos).values(data).returning();
  return row;
}

export async function updateLancamento(
  id: string,
  data: Partial<{
    data: Date;
    valor: number;
    tipo: TipoLancamento;
    categoria: CategoriaLancamento;
    descricao: string | null;
    membroId: string | null;
    mesReferencia: string | null;
  }>,
) {
  const [row] = await db
    .update(lancamentos)
    .set(data)
    .where(eq(lancamentos.id, id))
    .returning();
  return row;
}

export async function deleteLancamento(id: string) {
  await db.delete(lancamentos).where(eq(lancamentos.id, id));
}

export async function getResumoFinanceiro(
  orgId: string,
  caixa: Caixa | undefined,
  mes: string,
) {
  const conditions = [eq(lancamentos.organizationId, orgId)];
  if (caixa) conditions.push(eq(lancamentos.caixa, caixa));
  conditions.push(gte(lancamentos.data, monthStart(mes)));
  conditions.push(lt(lancamentos.data, nextMonthStart(mes)));

  const rows = await db
    .select({
      categoria: lancamentos.categoria,
      tipo: lancamentos.tipo,
      total: sql<number>`sum(${lancamentos.valor})::int`,
    })
    .from(lancamentos)
    .where(and(...conditions))
    .groupBy(lancamentos.categoria, lancamentos.tipo);

  return rows;
}

export async function getSaldoInicial(orgId: string, caixa: Caixa): Promise<number> {
  const fieldMap = {
    loja: lojaInfo.saldoInicialLoja,
    hospitalaria: lojaInfo.saldoInicialHospitalaria,
    mensalidades: lojaInfo.saldoInicialMensalidades,
  } as const;

  const rows = await db
    .select({ valor: fieldMap[caixa] })
    .from(lojaInfo)
    .where(eq(lojaInfo.organizationId, orgId))
    .limit(1);

  return rows[0]?.valor ?? 0;
}

export async function getSaldoAnterior(orgId: string, caixa: Caixa, mes: string): Promise<number> {
  const inicial = await getSaldoInicial(orgId, caixa);

  const rows = await db
    .select({
      tipo: lancamentos.tipo,
      total: sql<number>`sum(${lancamentos.valor})::int`,
    })
    .from(lancamentos)
    .where(
      and(
        eq(lancamentos.organizationId, orgId),
        eq(lancamentos.caixa, caixa),
        lt(lancamentos.data, monthStart(mes)),
      ),
    )
    .groupBy(lancamentos.tipo);

  let saldo = inicial;
  for (const row of rows) {
    if (row.tipo === "credito") saldo += row.total;
    else saldo -= row.total;
  }
  return saldo;
}

export async function getSaldoAtual(orgId: string, caixa: Caixa): Promise<number> {
  const inicial = await getSaldoInicial(orgId, caixa);

  const rows = await db
    .select({
      tipo: lancamentos.tipo,
      total: sql<number>`sum(${lancamentos.valor})::int`,
    })
    .from(lancamentos)
    .where(
      and(
        eq(lancamentos.organizationId, orgId),
        eq(lancamentos.caixa, caixa),
      ),
    )
    .groupBy(lancamentos.tipo);

  let saldo = inicial;
  for (const row of rows) {
    if (row.tipo === "credito") saldo += row.total;
    else saldo -= row.total;
  }
  return saldo;
}

export async function getTotaisMes(orgId: string, caixa: Caixa | undefined, mes: string) {
  const conditions = [eq(lancamentos.organizationId, orgId)];
  if (caixa) conditions.push(eq(lancamentos.caixa, caixa));
  conditions.push(gte(lancamentos.data, monthStart(mes)));
  conditions.push(lt(lancamentos.data, nextMonthStart(mes)));

  const rows = await db
    .select({
      tipo: lancamentos.tipo,
      total: sql<number>`sum(${lancamentos.valor})::int`,
    })
    .from(lancamentos)
    .where(and(...conditions))
    .groupBy(lancamentos.tipo);

  let creditos = 0;
  let debitos = 0;
  for (const row of rows) {
    if (row.tipo === "credito") creditos = row.total;
    else debitos = row.total;
  }
  return { creditos, debitos };
}

export async function getStatusMensalidades(orgId: string, mesReferencia: string) {
  const membros = await db
    .select({
      id: memberProfile.id,
      userId: memberProfile.userId,
      nome: user.name,
      ativo: memberProfile.ativo,
    })
    .from(memberProfile)
    .innerJoin(user, eq(memberProfile.userId, user.id))
    .where(
      and(
        eq(memberProfile.organizationId, orgId),
        eq(memberProfile.ativo, true),
      ),
    )
    .orderBy(asc(user.name));

  const pagamentos = await db
    .select({
      membroId: lancamentos.membroId,
      valor: lancamentos.valor,
      data: lancamentos.data,
      id: lancamentos.id,
    })
    .from(lancamentos)
    .where(
      and(
        eq(lancamentos.organizationId, orgId),
        eq(lancamentos.caixa, "mensalidades"),
        eq(lancamentos.categoria, "mensalidade"),
        eq(lancamentos.mesReferencia, mesReferencia),
      ),
    );

  const pagamentoMap = new Map(pagamentos.map((p) => [p.membroId, p]));

  return membros.map((m) => {
    const pagamento = pagamentoMap.get(m.id);
    return {
      membroId: m.id,
      nome: m.nome,
      pago: !!pagamento,
      valor: pagamento?.valor ?? null,
      data: pagamento?.data ?? null,
      lancamentoId: pagamento?.id ?? null,
    };
  });
}

export async function getLancamentosParaExport(orgId: string, filters: LancamentoFilters = {}) {
  return getLancamentos(orgId, { ...filters, limit: 10000, offset: 0 });
}
