import { ItemTextDisplay } from "@/components/ItemTextDisplay";
import { List } from "@/components/List";
import { SelectableArea } from "@/components/SelectableArea";
import { GearItemFragment } from "@/fragments/GearItemFragment";
import { FragmentType } from "@/gql";

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
}) => (
  <div>
    <p className="mb-2">Choose {pick} from:</p>
    <div className="flex flex-col gap-2 ml-8">
      {choices.map((items, itemIndex) => (
        <SelectableArea
          data-items-index={itemIndex}
          key={itemIndex}
          onDeselect={() => {
            if (!selected) return;

            if (!selected.includes(itemIndex)) return;

            onChange?.(
              choiceIndex,
              selected.filter((i) => i !== itemIndex),
            );
          }}
          onSelect={() => {
            if (!selected) return;

            if (selected.includes(itemIndex)) return;

            if (selected.length >= pick) return;

            onChange?.(choiceIndex, [...selected, itemIndex]);
          }}
          selected={!!selected?.includes(itemIndex)}
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
