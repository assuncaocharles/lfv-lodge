import { withAuth } from "@/lib/with-auth";
import { isLuz } from "@/lib/api-utils";
import { getSocialLinks } from "@/data/sociais";
import { SocialLinksGrid } from "@/components/sociais/social-links-grid";

async function SociaisPage({ user, orgId }: { user: { name: string }; orgId: string }) {
  const [links, admin] = await Promise.all([getSocialLinks(orgId), isLuz()]);

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
          Redes Sociais
        </h1>
        <p className="text-[13px] text-neutral-500 mt-1">
          Links e grupos da loja
        </p>
      </div>
      <SocialLinksGrid links={links} isAdmin={admin} />
    </div>
  );
}

export default withAuth(SociaisPage);
