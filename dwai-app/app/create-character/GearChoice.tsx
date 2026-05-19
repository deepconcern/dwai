import { MouseEvent, useCallback, useMemo } from "react";

import { ItemTextDisplay } from "@/components/ItemTextDisplay";
import { SelectableArea } from "@/components/SelectableArea";
import { FragmentType } from "@/gql";
import { GearItemFragment } from "@/fragments/GearItemFragment";
import { List } from "@/components/List";

export type GearChoiceProps = {
  choiceIndex: number;
  choices: FragmentType<typeof GearItemFragment>[][];
  onChange?: (choiceIndex: number, selected: number[]) => void;
  pick: number;
  selected?: number[] | null;
};

export const GearChoice: React.FC<GearChoiceProps> = ({
  choiceIndex,
  choices,
  onChange,
  pick,
  selected,
}) => {
  onChange = useMemo(() => onChange || (() => {}), [onChange]);
  selected = useMemo(() => selected || [], [selected]);

  const handleToggle = useCallback(
    (ev: MouseEvent<HTMLDivElement>) => {
      const itemsIndex = parseInt(
        (ev.currentTarget as HTMLDivElement).dataset.itemsIndex || "",
        10,
      );

      if (isNaN(itemsIndex)) {
        return;
      }

      if (selected.includes(itemsIndex)) {
        onChange(
          choiceIndex,
          selected.filter((i) => i !== itemsIndex),
        );
      } else if (selected.length < pick) {
        onChange(choiceIndex, [...selected, itemsIndex]);
      }
    },
    [choiceIndex, onChange, pick, selected],
  );

  return (
    <div>
      <p className="mb-2">Choose {pick} from:</p>
      <div className="flex flex-col gap-2 ml-8">
        {choices.map((items, choiceIndex) => (
          <SelectableArea
            data-items-index={choiceIndex}
            key={choiceIndex}
            onClick={handleToggle}
            selected={!!selected?.includes(choiceIndex)}
          >
            <List
              items={items.map((i, j) => ({
                content: <ItemTextDisplay item={i} />,
                key: j,
              }))}
            />
          </SelectableArea>
        ))}
      </div>
    </div>
  );
};
