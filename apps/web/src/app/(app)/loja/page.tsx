import { withAuth } from "@/lib/with-auth";
import { getLojaInfo } from "@/data/loja";
import { LodgeInfoForm } from "@/components/loja/lodge-info-form";

async function LojaPage({
  user,
  orgId,
  member,
}: {
  user: { name: string };
  orgId: string;
  member: { grau: string; role: string; profileId: string | null; isAdmin: boolean };
}) {
  const info = await getLojaInfo(orgId);

  return (
    <div className="animate-fade-up max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--app-card-fg)] tracking-tight">
          Informações da Loja
        </h1>
        <p className="text-[13px] text-neutral-500 mt-1">
          Dados e configurações da loja
        </p>
      </div>

      {/* Lodge identity header */}
      <div className="bg-[var(--app-card)] rounded-2xl shadow-card overflow-hidden">
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-white/5 dark:to-white/[0.02] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/20 shrink-0">
              <img
                src="/logo-small.png"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                {info?.nomeCompleto || "Labor, Força e Virtude"}
              </h2>
              <p className="text-[13px] text-white/50 mt-0.5">
                {[info?.numero && `N.o ${info.numero}`, info?.oriente]
                  .filter(Boolean)
                  .join(" · ") || "N.o 003"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <LodgeInfoForm info={info ?? {}} isAdmin={member.isAdmin} />
    </div>
  );
}

export default withAuth(LojaPage);
