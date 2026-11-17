"use client";

import { FC } from "react";

import { Dropdown } from "@/components/Dropdown";
import { fillBondTemplate } from "@/lib/campaigns";

/** A bond being written: who it's about and what it says. */
export type BondDraft = {
  targetId: string;
  text: string;
};

export type BondFieldsProps = {
  /** The class's bond templates, with blanks for a name. */
  templates: string[];
  /** The characters the bond can be about. */
  targets: { id: string; name: string }[];
  /** Called with the edited bond. */
  onChange: (value: BondDraft) => void;
  /** The bond being written. */
  value: BondDraft;
};

/**
 * Fields for writing a bond: pick a party member, optionally start from one
 * of the class's templates (the blank is filled with their name), and edit
 * the text freely.
 */
export const BondFields: FC<BondFieldsProps> = ({
  onChange,
  targets,
  templates,
  value,
}) => {
  const targetName = targets.find((t) => t.id === value.targetId)?.name;

  return (
    <div className="flex flex-col gap-2">
      <Dropdown
        aria-label="Bond with"
        items={targets.map((t) => ({ label: t.name, value: t.id }))}
        onChange={(ev) => onChange({ ...value, targetId: ev.target.value })}
        placeholder="Bond with…"
        required
        value={value.targetId}
      />
      <Dropdown
        aria-label="Start from a template"
        items={templates.map((t) => ({
          label: targetName ? fillBondTemplate(t, targetName) : t,
          value: t,
        }))}
        onChange={(ev) =>
          ev.target.value &&
          onChange({
            ...value,
            text: fillBondTemplate(ev.target.value, targetName ?? "___"),
          })
        }
        placeholder="Start from a class template (optional)"
        value=""
      />
      <textarea
        aria-label="Bond text"
        className="border px-3 py-2 rounded"
        maxLength={500}
        onChange={(ev) => onChange({ ...value, text: ev.target.value })}
        placeholder="Write the bond"
        required
        rows={2}
        value={value.text}
      />
    </div>
  );
};
