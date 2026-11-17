"use client";

import { FC, ReactNode } from "react";

import { CheckedReason, needsReason } from "@/lib/campaigns";

export type CheckedReasonFieldProps = {
  /** The checkbox's label: the question or claim being checked. */
  label: ReactNode;
  /** Called with the new checkbox and reason. */
  onChange: (value: CheckedReason) => void;
  /** The reason field's accessible name, e.g. "Alignment reason". */
  reasonLabel: string;
  /** The current checkbox and reason. */
  value: CheckedReason;
};

/**
 * An End of Session checkbox. Checking it reveals a required reason field,
 * because every checked item is logged with why.
 */
export const CheckedReasonField: FC<CheckedReasonFieldProps> = ({
  label,
  onChange,
  reasonLabel,
  value,
}) => (
  <div className="flex flex-col gap-2">
    <label className="flex gap-2 items-start">
      <input
        checked={value.checked}
        className="mt-1"
        onChange={(ev) => onChange({ ...value, checked: ev.target.checked })}
        type="checkbox"
      />
      <span>{label}</span>
    </label>
    {value.checked && (
      <textarea
        aria-invalid={needsReason(value)}
        aria-label={reasonLabel}
        className="border ml-6 px-3 py-2 rounded"
        onChange={(ev) => onChange({ ...value, reason: ev.target.value })}
        placeholder="Why? (required)"
        required
        rows={2}
        value={value.reason}
      />
    )}
  </div>
);
