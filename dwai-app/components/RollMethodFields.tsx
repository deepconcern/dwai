import { FC } from "react";

export type RollMethodFieldsProps = {
  /** Label for the total box, e.g. "Your 2d6 total". */
  manualLabel: string;
  manualMax: number;
  manualMin: number;
  manualTotal: string;
  method: "app" | "manual";
  onManualTotalChange: (total: string) => void;
  onMethodChange: (method: "app" | "manual") => void;
};

/**
 * The choice every roll dialog offers: let the app roll, or enter the total
 * of physical dice (shown in chat with a ✍️ instead of the dice).
 */
export const RollMethodFields: FC<RollMethodFieldsProps> = ({
  manualLabel,
  manualMax,
  manualMin,
  manualTotal,
  method,
  onManualTotalChange,
  onMethodChange,
}) => (
  <fieldset className="flex flex-col gap-1">
    <legend>Dice</legend>
    <label className="flex gap-2 items-center">
      <input
        checked={method === "app"}
        name="roll-method"
        onChange={() => onMethodChange("app")}
        type="radio"
      />
      Roll for me 🎲
    </label>
    <label className="flex gap-2 items-center">
      <input
        checked={method === "manual"}
        name="roll-method"
        onChange={() => onMethodChange("manual")}
        type="radio"
      />
      I rolled ✍️
    </label>
    {method === "manual" && (
      <label className="flex flex-col gap-1">
        {manualLabel}
        <input
          className="border px-3 py-2 rounded"
          max={manualMax}
          min={manualMin}
          onChange={(ev) => onManualTotalChange(ev.target.value)}
          required
          type="number"
          value={manualTotal}
        />
      </label>
    )}
  </fieldset>
);
