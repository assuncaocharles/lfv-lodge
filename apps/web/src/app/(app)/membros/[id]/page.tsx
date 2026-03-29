import { notFound } from "next/navigation";
import { withAuth } from "@/lib/with-auth";
import { isLuz } from "@/lib/api-utils";
import { getMemberById, getMemberHistory } from "@/data/membros";
import { DegreeBadge } from "@/components/membros/degree-badge";
import { CARGO_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

async function MemberDetailPage({
  user,
  orgId,
  params,
}: {
  user: { name: string };
  orgId: string;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [member, history, admin] = await Promise.all([
    getMemberById(orgId, id),
    getMemberHistory(id),
    isLuz(),
  ]);

  if (!member) notFound();

  const initials = member.userName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isAdmin = member.role === "owner" || member.role === "admin";

  return (
    <div className="space-y-6 max-w-2xl animate-fade-up">
      <div className="flex items-center gap-4">
        <Avatar className="size-16 shadow-card">
          <AvatarImage src={member.userImage ?? undefined} />
          <AvatarFallback className="text-lg font-semibold bg-navy-900 text-gold-300">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
            {member.userName}
          </h1>
          <p className="text-[13px] text-neutral-500">{member.userEmail}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <DegreeBadge grau={member.grau} />
            {isAdmin && (
              <Badge
                variant="outline"
                className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-gold-600 border-gold-300 bg-gold-50"
              >
                Luz
              </Badge>
            )}
            {!member.ativo && (
              <Badge
                variant="destructive"
                className="rounded-lg px-2.5 py-1 text-[11px] font-semibold"
              >
                Inativo
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Card className="bg-white rounded-2xl shadow-card border-0">
        <CardHeader>
          <CardTitle className="font-display text-[15px] font-bold text-neutral-900 tracking-tight">
            Informações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Cargo" value={member.cargo ? CARGO_LABELS[member.cargo] ?? member.cargo : "Nenhum"} />
          <InfoRow label="CIM" value={member.cim ?? "\u2014"} />
          <InfoRow label="Telefone" value={member.telefone ?? "\u2014"} />
          <InfoRow label="Iniciação" value={member.dataIniciacao ? new Date(member.dataIniciacao).toLocaleDateString("pt-BR") : "\u2014"} />
          <InfoRow label="Elevação" value={member.dataElevacao ? new Date(member.dataElevacao).toLocaleDateString("pt-BR") : "\u2014"} />
          <InfoRow label="Exaltação" value={member.dataExaltacao ? new Date(member.dataExaltacao).toLocaleDateString("pt-BR") : "\u2014"} />
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card className="bg-white rounded-2xl shadow-card border-0">
          <CardHeader>
            <CardTitle className="font-display text-[15px] font-bold text-neutral-900 tracking-tight">
              Histórico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 text-[13px]">
                  <div className="size-2 rounded-full bg-gold-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-neutral-700">
                      <span className="font-medium capitalize">{entry.campo}</span>
                      {" alterado de "}
                      <span className="text-neutral-400">{entry.valorAnterior ?? "\u2014"}</span>
                      {" para "}
                      <span className="font-medium text-neutral-900">{entry.valorNovo ?? "\u2014"}</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      por {entry.alteradoPorNome} em{" "}
                      {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[13px]">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-900 font-medium">{value}</span>
    </div>
  );
}

export default withAuth(MemberDetailPage);
