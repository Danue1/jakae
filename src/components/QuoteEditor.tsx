"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import type { Character, CharacterQuote } from "../core/model";
import { dispatchCommand } from "../store/worldviewStore";

export function QuoteEditor({ character }: { character: Character }) {
  const t = useTranslations();

  const addQuote = () =>
    dispatchCommand({
      type: "add-quote",
      characterId: character.id,
      quote: { id: crypto.randomUUID(), line: "", situation: "" },
    });

  const update = (quoteIndex: number, quote: CharacterQuote) =>
    dispatchCommand({ type: "set-quote", characterId: character.id, quoteIndex, quote });

  return (
    <div className="flex flex-col gap-2">
      {character.quotes.map((quote, quoteIndex) => (
        <div key={quote.id} className="group flex items-start gap-2">
          <span
            aria-hidden="true"
            className="select-none text-xl font-extrabold leading-none text-accent"
          >
            &ldquo;
          </span>
          <div className="flex-1 rounded-xl rounded-tl-sm bg-hover px-3 py-2">
            <Textarea
              className="min-h-0 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              rows={1}
              placeholder={t("quote.linePlaceholder")}
              value={quote.line}
              onChange={(event) =>
                update(quoteIndex, { ...quote, line: event.target.value })
              }
            />
            <Input
              className="h-auto border-0 bg-transparent p-0 text-xs text-muted shadow-none focus-visible:ring-0"
              placeholder={t("quote.situationPlaceholder")}
              value={quote.situation}
              onChange={(event) =>
                update(quoteIndex, { ...quote, situation: event.target.value })
              }
            />
          </div>
          <button
            aria-label={t("common.delete")}
            className="mt-1 text-muted opacity-60 hover:text-danger group-hover:opacity-100"
            onClick={() =>
              dispatchCommand({
                type: "remove-quote",
                characterId: character.id,
                quoteIndex,
              })
            }
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
      <button
        className="flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-sm text-accent hover:bg-hover"
        onClick={addQuote}
      >
        <Plus size={15} aria-hidden="true" />
        {t("quote.addQuote")}
      </button>
    </div>
  );
}
