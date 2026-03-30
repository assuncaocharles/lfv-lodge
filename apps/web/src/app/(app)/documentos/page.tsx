import { withAuth } from "@/lib/with-auth";
import { getFolderContents, getBreadcrumbs, getDocumentById } from "@/data/documentos";
import { FileExplorer } from "@/components/documentos/file-explorer";

async function DocumentosPage({
  user,
  orgId,
  member,
  searchParams,
}: {
  user: { id: string; name: string };
  orgId: string;
  member: { grau: string; role: string; profileId: string | null; isAdmin: boolean };
  searchParams: Promise<{ pasta?: string }>;
}) {
  const { pasta: pastaId } = await searchParams;
  const grau = member.grau as "1" | "2" | "3";

  const [items, breadcrumbs, currentFolder] = await Promise.all([
    getFolderContents(orgId, pastaId ?? null, grau),
    pastaId ? getBreadcrumbs(pastaId) : [],
    pastaId ? getDocumentById(orgId, pastaId) : null,
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
        currentFolderGrau={currentFolder?.grauMinimo ?? null}
        isAdmin={member.isAdmin}
      />
    </div>
  );
}

export default withAuth(DocumentosPage);
