"use client";

import {
  ChevronDown,
  ChevronUp,
  Globe,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  createFieldOption,
  defaultFieldConfig,
  type FieldConfig,
  type FieldDefinition,
  type FieldType,
  type Worldview,
} from "@/core/model";
import { isLocale, LOCALES } from "@/locales";
import {
  FIELD_PRESET_CATEGORIES,
  fieldDefinitionFromPreset,
  getFieldPresets,
  type FieldPreset,
  type FieldPresetCategory,
} from "@/locales/fieldPresets";
import { guardedKeyDownHandler } from "@/react/inputGuards";
import { dispatchCommand } from "@/store/worldviewStore";

const FIELD_TYPES: FieldType[] = ["text", "number", "select", "date"];

function typeLabelKey(type: FieldType) {
  return {
    text: "field.typeText",
    number: "field.typeNumber",
    select: "field.typeSelect",
    date: "field.typeDate",
  }[type] as
    | "field.typeText"
    | "field.typeNumber"
    | "field.typeSelect"
    | "field.typeDate";
}

function optionSummary(preset: FieldPreset): string {
  const labels = preset.optionLabels ?? [];
  const head = labels.slice(0, 3).join(" · ");
  return labels.length > 3 ? `${head} …` : head;
}

// 선택 필드의 옵션 목록 편집기 — 옵션은 configure-field로 통째 교체한다.
function OptionsEditor({
  fieldDefinition,
}: {
  fieldDefinition: FieldDefinition;
}) {
  const t = useTranslations();
  const [newOption, setNewOption] = useState("");
  const { config } = fieldDefinition;

  const commit = (options: FieldConfig["options"]) =>
    dispatchCommand({
      type: "configure-field",
      fieldDefinitionId: fieldDefinition.id,
      config: { ...config, options },
    });

  const addOption = () => {
    const label = newOption.trim();
    setNewOption("");
    if (!label) return;
    commit([...config.options, createFieldOption(label)]);
  };

  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold text-muted">
        {t("field.optionsLabel")}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {config.options.map((option) => (
          <Badge key={option.id} className="py-1 text-sm">
            {option.label}
            <button
              aria-label={`${option.label} · ${t("common.delete")}`}
              className="-my-2 -mr-2 p-2 opacity-60 hover:opacity-100"
              onClick={() =>
                commit(config.options.filter((existing) => existing.id !== option.id))
              }
            >
              <X size={13} aria-hidden="true" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <Input
          className="bg-hover"
          placeholder={t("field.optionPlaceholder")}
          value={newOption}
          onChange={(event) => setNewOption(event.target.value)}
          onKeyDown={guardedKeyDownHandler({ Enter: addOption })}
        />
        <Button size="sm" variant="subtle" onClick={addOption}>
          <Plus size={15} aria-hidden="true" />
          {t("field.addOption")}
        </Button>
      </div>
    </div>
  );
}

// 필드의 타입·세부 제한 편집기 (인라인 확장).
function FieldConfigEditor({
  fieldDefinition,
}: {
  fieldDefinition: FieldDefinition;
}) {
  const t = useTranslations();
  const { config } = fieldDefinition;

  const update = (patch: Partial<FieldConfig>) =>
    dispatchCommand({
      type: "configure-field",
      fieldDefinitionId: fieldDefinition.id,
      config: { ...config, ...patch },
    });

  const changeType = (type: FieldType) => {
    if (type === config.type) return;
    const next = defaultFieldConfig();
    next.type = type;
    next.required = config.required;
    if (type === "select") next.options = config.options;
    dispatchCommand({
      type: "configure-field",
      fieldDefinitionId: fieldDefinition.id,
      config: next,
    });
    // 텍스트가 아니면 언어별 값은 의미가 없으므로 함께 끈다.
    if (type !== "text" && fieldDefinition.localized) {
      dispatchCommand({
        type: "set-field-localized",
        fieldDefinitionId: fieldDefinition.id,
        localized: false,
      });
    }
  };

  const numberValue = (value: number | null) => (value === null ? "" : String(value));
  const parseNumber = (raw: string): number | null => {
    if (raw.trim() === "") return null;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? null : parsed;
  };

  return (
    <div className="mt-1.5 rounded-xl border border-line bg-hover p-3">
      <div className="mb-1.5 text-xs font-semibold text-muted">
        {t("field.typeLabel")}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {FIELD_TYPES.map((type) => (
          <button
            key={type}
            aria-pressed={config.type === type}
            onClick={() => changeType(type)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              config.type === type
                ? "border-accent bg-accent-soft font-semibold text-accent"
                : "border-line bg-ground text-muted hover:text-ink",
            )}
          >
            {t(typeLabelKey(type))}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        {config.type === "select" && (
          <>
            <OptionsEditor fieldDefinition={fieldDefinition} />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-accent"
                checked={config.multiple}
                onChange={(event) => update({ multiple: event.target.checked })}
              />
              {t("field.multiple")}
            </label>
          </>
        )}

        {config.type === "number" && (
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold text-muted">
                {t("field.unitLabel")}
              </span>
              <Input
                className="w-24 bg-ground"
                placeholder={t("field.unitPlaceholder")}
                value={config.unit}
                onChange={(event) => update({ unit: event.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold text-muted">
                {t("field.minLabel")}
              </span>
              <Input
                type="number"
                className="w-24 bg-ground"
                placeholder={t("field.rangePlaceholder")}
                value={numberValue(config.min)}
                onChange={(event) => update({ min: parseNumber(event.target.value) })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold text-muted">
                {t("field.maxLabel")}
              </span>
              <Input
                type="number"
                className="w-24 bg-ground"
                placeholder={t("field.rangePlaceholder")}
                value={numberValue(config.max)}
                onChange={(event) => update({ max: parseNumber(event.target.value) })}
              />
            </label>
          </div>
        )}

        {config.type === "text" && (
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-muted">
              {t("field.maxLengthLabel")}
            </span>
            <Input
              type="number"
              className="w-32 bg-ground"
              placeholder={t("field.maxLengthPlaceholder")}
              value={numberValue(config.maxLength)}
              onChange={(event) =>
                update({ maxLength: parseNumber(event.target.value) })
              }
            />
          </label>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-accent"
            checked={config.required}
            onChange={(event) => update({ required: event.target.checked })}
          />
          {t("field.required")}
        </label>
      </div>
    </div>
  );
}

function FieldRow({
  fieldDefinition,
  fieldIndex,
  total,
  expanded,
  onToggleExpand,
  onDelete,
}: {
  fieldDefinition: FieldDefinition;
  fieldIndex: number;
  total: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations();
  return (
    <div className="border-b border-line py-1.5">
      <div className="flex items-center gap-1.5">
        <div className="flex flex-col">
          <button
            aria-label={t("settings.moveUp")}
            disabled={fieldIndex === 0}
            className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30"
            onClick={() =>
              dispatchCommand({
                type: "move-field-definition",
                fieldDefinitionId: fieldDefinition.id,
                targetIndex: fieldIndex - 1,
              })
            }
          >
            <ChevronUp size={15} aria-hidden="true" />
          </button>
          <button
            aria-label={t("settings.moveDown")}
            disabled={fieldIndex === total - 1}
            className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30"
            onClick={() =>
              dispatchCommand({
                type: "move-field-definition",
                fieldDefinitionId: fieldDefinition.id,
                targetIndex: fieldIndex + 1,
              })
            }
          >
            <ChevronDown size={15} aria-hidden="true" />
          </button>
        </div>
        <Input
          value={fieldDefinition.label}
          placeholder={t("settings.fieldNamePlaceholder")}
          onChange={(event) =>
            dispatchCommand({
              type: "rename-field-definition",
              fieldDefinitionId: fieldDefinition.id,
              label: event.target.value,
            })
          }
        />
        <Badge className="shrink-0 py-1">
          {t(typeLabelKey(fieldDefinition.config.type))}
        </Badge>
        {fieldDefinition.config.type === "text" && (
          <Button
            variant="subtle"
            size="icon"
            aria-label={t("settings.localizedToggle")}
            aria-pressed={fieldDefinition.localized}
            title={t("settings.localizedToggle")}
            className={cn(fieldDefinition.localized && "text-accent")}
            onClick={() =>
              dispatchCommand({
                type: "set-field-localized",
                fieldDefinitionId: fieldDefinition.id,
                localized: !fieldDefinition.localized,
              })
            }
          >
            <Globe size={16} aria-hidden="true" />
          </Button>
        )}
        <Button
          variant="subtle"
          size="icon"
          aria-label={t("field.editRules")}
          aria-pressed={expanded}
          title={t("field.editRules")}
          className={cn(expanded && "text-accent")}
          onClick={onToggleExpand}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
        </Button>
        <Button variant="danger" size="sm" onClick={onDelete}>
          {t("common.delete")}
        </Button>
      </div>
      {expanded && <FieldConfigEditor fieldDefinition={fieldDefinition} />}
    </div>
  );
}

// 프리셋 팔레트 — 자주 쓰는 필드를 골라 바로 추가하거나 빈 필드부터 구성한다.
function PresetPalette({
  onAdded,
}: {
  onAdded: (fieldDefinitionId: string) => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [category, setCategory] = useState<FieldPresetCategory | "all">("all");
  const presetLocale = isLocale(locale) ? locale : LOCALES[0];
  const presets = getFieldPresets(presetLocale).filter(
    (preset) => category === "all" || preset.category === category,
  );

  const addPreset = (preset: FieldPreset) => {
    const fieldDefinition = fieldDefinitionFromPreset(preset);
    dispatchCommand({ type: "add-field-definition", fieldDefinition });
    onAdded(fieldDefinition.id);
  };

  const addBlank = () => {
    const fieldDefinition: FieldDefinition = {
      id: crypto.randomUUID(),
      label: "",
      localized: false,
      config: defaultFieldConfig(),
    };
    dispatchCommand({ type: "add-field-definition", fieldDefinition });
    onAdded(fieldDefinition.id);
  };

  const categoryLabelKey = {
    all: "field.categoryAll",
    basic: "field.categoryBasic",
    body: "field.categoryBody",
    personality: "field.categoryPersonality",
    relation: "field.categoryRelation",
  } as const;

  return (
    <div className="mt-3 rounded-2xl border border-line p-3.5">
      <p className="mb-3 text-xs text-muted">{t("field.presetHint")}</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["all", ...FIELD_PRESET_CATEGORIES] as const).map((value) => (
          <button
            key={value}
            aria-pressed={category === value}
            onClick={() => setCategory(value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              category === value
                ? "border-ink bg-ink font-semibold text-ground"
                : "border-line bg-ground text-muted hover:text-ink",
            )}
          >
            {t(categoryLabelKey[value])}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {presets.map((preset) => (
          <button
            key={preset.key}
            onClick={() => addPreset(preset)}
            className="rounded-xl border border-line bg-ground p-3 text-left hover:border-accent hover:bg-accent-soft/40"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">{preset.label}</span>
              <Plus size={16} aria-hidden="true" className="text-accent" />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
              <Badge className="py-0.5">{t(typeLabelKey(preset.type))}</Badge>
              {preset.type === "select" && optionSummary(preset)}
              {preset.type === "number" && preset.unit}
            </div>
          </button>
        ))}
        <button
          onClick={addBlank}
          className="rounded-xl border border-dashed border-accent bg-ground p-3 text-left hover:bg-accent-soft/40"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-accent">{t("field.blankPreset")}</span>
            <Plus size={16} aria-hidden="true" className="text-accent" />
          </div>
          <div className="mt-1 text-xs text-muted">{t("field.blankPresetHint")}</div>
        </button>
      </div>
    </div>
  );
}

export function FieldsSection({ worldview }: { worldview: Worldview }) {
  const t = useTranslations();
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);
  const [pendingDeleteField, setPendingDeleteField] =
    useState<FieldDefinition | null>(null);

  return (
    <>
      <div className="mt-2">
        {worldview.fieldDefinitions.map((fieldDefinition, fieldIndex) => (
          <FieldRow
            key={fieldDefinition.id}
            fieldDefinition={fieldDefinition}
            fieldIndex={fieldIndex}
            total={worldview.fieldDefinitions.length}
            expanded={expandedFieldId === fieldDefinition.id}
            onToggleExpand={() =>
              setExpandedFieldId((current) =>
                current === fieldDefinition.id ? null : fieldDefinition.id,
              )
            }
            onDelete={() => setPendingDeleteField(fieldDefinition)}
          />
        ))}
      </div>

      <PresetPalette onAdded={setExpandedFieldId} />

      <AlertDialog
        open={pendingDeleteField !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteField(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>
            {t("settings.deleteFieldTitle", {
              label: pendingDeleteField?.label ?? "",
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("settings.deleteFieldDescription")}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger"
              onClick={() => {
                if (pendingDeleteField)
                  dispatchCommand({
                    type: "delete-field-definition",
                    fieldDefinitionId: pendingDeleteField.id,
                  });
                setPendingDeleteField(null);
              }}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
