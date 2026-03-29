"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Clock,
  Wallet,
  Notes,
  Copy,
  Check,
} from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LojaInfoData {
  nomeCompleto?: string | null;
  numero?: string | null;
  oriente?: string | null;
  potencia?: string | null;
  endereco?: string | null;
  cep?: string | null;
  cidade?: string | null;
  estado?: string | null;
  telefone?: string | null;
  email?: string | null;
  pixChave?: string | null;
  diasSessao?: string | null;
  horarioSessao?: string | null;
  observacoes?: string | null;
}

export function LodgeInfoForm({
  info,
  isAdmin,
}: {
  info: LojaInfoData;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);
    const form = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    form.forEach((v, k) => {
      data[k] = v.toString();
    });

    try {
      await fetch("/api/loja", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  }

  function copyPix() {
    if (!info.pixChave) return;
    navigator.clipboard.writeText(info.pixChave);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dados da Loja */}
      <Section
        icon={Building}
        title="Dados da Loja"
        description="Identificação e vínculo obediencial"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Nome Completo"
              name="nomeCompleto"
              value={info.nomeCompleto}
              disabled={!isAdmin}
              placeholder="Aug.'. e Resp.'. Loja Simb.'."
            />
          </div>
          <Field
            label="Número"
            name="numero"
            value={info.numero}
            disabled={!isAdmin}
            placeholder="003"
          />
          <Field
            label="Oriente"
            name="oriente"
            value={info.oriente}
            disabled={!isAdmin}
            placeholder="Cidade, Estado"
          />
          <div className="sm:col-span-2">
            <Field
              label="Potência / Obediência"
              name="potencia"
              value={info.potencia}
              disabled={!isAdmin}
              placeholder="Grande Oriente do Brasil"
            />
          </div>
        </div>
      </Section>

      {/* Endereco */}
      <Section
        icon={MapPin}
        title="Endereço"
        description="Localização do templo"
      >
        <div className="space-y-4">
          <Field
            label="Endereço completo"
            name="endereco"
            value={info.endereco}
            disabled={!isAdmin}
            placeholder="Rua, número, complemento"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="CEP"
              name="cep"
              value={info.cep}
              disabled={!isAdmin}
              placeholder="00000-000"
            />
            <Field
              label="Cidade"
              name="cidade"
              value={info.cidade}
              disabled={!isAdmin}
            />
            <Field
              label="Estado"
              name="estado"
              value={info.estado}
              disabled={!isAdmin}
              placeholder="UF"
            />
          </div>
        </div>
      </Section>

      {/* Contato & Sessoes */}
      <Section
        icon={Phone}
        title="Contato & Sessões"
        description="Formas de contato e horários"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Telefone"
            name="telefone"
            value={info.telefone}
            disabled={!isAdmin}
            placeholder="(00) 00000-0000"
            icon={Phone}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={info.email}
            disabled={!isAdmin}
            placeholder="loja@email.com"
            icon={Mail}
          />
          <Field
            label="Dias de Sessão"
            name="diasSessao"
            value={info.diasSessao}
            disabled={!isAdmin}
            placeholder="Ex: Quartas-feiras"
            icon={Clock}
          />
          <Field
            label="Horário"
            name="horarioSessao"
            value={info.horarioSessao}
            disabled={!isAdmin}
            placeholder="Ex: 19:30"
            icon={Clock}
          />
        </div>
      </Section>

      {/* PIX */}
      <Section
        icon={Wallet}
        title="PIX"
        description="Chave para contribuições"
      >
        <div className="space-y-3">
          <Field
            label="Chave PIX"
            name="pixChave"
            value={info.pixChave}
            disabled={!isAdmin}
            placeholder="CPF, email, telefone ou chave aleatoria"
          />
          {info.pixChave && (
            <button
              type="button"
              onClick={copyPix}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              {pixCopied ? (
                <>
                  <Check className="size-3.5 text-teal-500" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copiar chave
                </>
              )}
            </button>
          )}
        </div>
      </Section>

      {/* Observacoes */}
      <Section
        icon={Notes}
        title="Observações"
        description="Informações adicionais"
      >
        <Textarea
          name="observacoes"
          defaultValue={info.observacoes ?? ""}
          rows={4}
          disabled={!isAdmin}
          placeholder="Anotações gerais sobre a loja..."
          className="rounded-xl bg-neutral-50 border-neutral-200 text-[13px] focus:bg-white transition-all duration-200 dark:bg-white/5 dark:border-white/10 dark:focus:bg-white/10"
        />
      </Section>

      {/* Save */}
      {isAdmin && (
        <div className="flex items-center gap-3 pt-1">
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-xl transition-all duration-200"
          >
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
          {saved && (
            <span className="text-[13px] text-teal-600 font-medium animate-fade-in">
              Salvo com sucesso!
            </span>
          )}
        </div>
      )}
    </form>
  );
}

/* ── Section wrapper ── */

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--app-card)] rounded-2xl shadow-card overflow-hidden">
      <div className="px-6 pt-5 pb-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0">
          <Icon
            className="size-[18px] text-neutral-500 dark:text-neutral-400"
            strokeWidth={1.7}
          />
        </div>
        <div>
          <h3 className="font-display text-[15px] font-semibold text-[var(--app-card-fg)] tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] text-neutral-400">{description}</p>
        </div>
      </div>
      <div className="px-6 pb-6">{children}</div>
    </div>
  );
}

/* ── Field component ── */

function Field({
  label,
  name,
  value,
  type = "text",
  disabled,
  placeholder,
  icon: Icon,
}: {
  label: string;
  name: string;
  value?: string | null;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={name}
        className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400"
      >
        {label}
      </Label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="size-4 text-neutral-400" />
          </div>
        )}
        <Input
          id={name}
          name={name}
          type={type}
          defaultValue={value ?? ""}
          disabled={disabled}
          placeholder={placeholder}
          className={`h-11 rounded-xl bg-neutral-50 border-neutral-200 text-[13px] focus:bg-white transition-all duration-200 dark:bg-white/5 dark:border-white/10 dark:focus:bg-white/10 ${Icon ? "pl-10" : ""}`}
        />
      </div>
    </div>
  );
}
