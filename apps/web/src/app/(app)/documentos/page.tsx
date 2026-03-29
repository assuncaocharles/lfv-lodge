import { withAuth } from "@/lib/with-auth";
import { isLuz } from "@/lib/api-utils";
import { getMemberByUserId } from "@/data/membros";
import { getFolderContents, getBreadcrumbs } from "@/data/documentos";
import { FileExplorer } from "@/components/documentos/file-explorer";

async function DocumentosPage({
  user,
  orgId,
  searchParams,
}: {
  user: { id: string; name: string };
  orgId: string;
  searchParams: Promise<{ pasta?: string }>;
}) {
  const { pasta: pastaId } = await searchParams;
  const [member, admin] = await Promise.all([
    getMemberByUserId(orgId, user.id),
    isLuz(),
  ]);
  const grau = (member?.grau ?? "1") as "1" | "2" | "3";

  const [items, breadcrumbs] = await Promise.all([
    getFolderContents(orgId, pastaId ?? null, grau),
    pastaId ? getBreadcrumbs(pastaId) : [],
  ]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
          Documentos
        </h1>
        <p className="text-[13px] text-neutral-500 mt-1">
          Acesse documentos e atas da loja
        </p>
      </div>
      <FileExplorer
        items={items as any}
        breadcrumbs={breadcrumbs}
        currentFolderId={pastaId ?? null}
        isAdmin={admin}
      />
    </div>
  );
}

export default withAuth(DocumentosPage);
