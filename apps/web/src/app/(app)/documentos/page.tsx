"use client";

import { useSearchParams } from "next/navigation";
import { useMember } from "@/hooks/use-member";
import { useFetch } from "@/hooks/use-fetch";
import { FileExplorer } from "@/components/documentos/file-explorer";

export default function DocumentosPage() {
  const { member } = useMember();
  const searchParams = useSearchParams();

  const pastaId = searchParams.get("pasta");
  const apiUrl = pastaId
    ? `/api/documentos?pastaId=${pastaId}`
    : `/api/documentos`;

  const { data: items, isLoading } = useFetch<any[]>(apiUrl);

  // Fetch folder details when inside a subfolder to get grauMinimo
  const { data: folderDoc } = useFetch<any>(
    pastaId ? `/api/documentos/${pastaId}` : null,
  );

  if (isLoading || !items) {
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
        <div className="flex items-center justify-center py-12 text-neutral-500 text-sm">
          Carregando documentos...
        </div>
      </div>
    );
  }

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
        items={items}
        breadcrumbs={[]}
        currentFolderId={pastaId ?? null}
        currentFolderGrau={folderDoc?.grauMinimo ?? null}
        isAdmin={member.isAdmin}
      />
    </div>
  );
}
