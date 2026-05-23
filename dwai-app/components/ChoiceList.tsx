import { FC } from "react";

export type ChoiceListItem = {
  key: string;
  label: string;
};

export type ChoiceListProps = {
  items: ChoiceListItem[];
  onChange: (selected: string[]) => void;
  pick?: number | null;
  values: string[];
};

export const ChoiceList: FC<ChoiceListProps> = ({
  items,
  onChange,
  pick,
  values,
}) => (
  <ul>
    {items.map((item) => (
      <li key={item.key}>
        <label className="flex items-center gap-2">
          <input
            checked={values.includes(item.key)}
            onChange={() => {
              if (!values.includes(item.key)) {
                if (values.length >= (pick ?? Infinity)) return;
                onChange([...values, item.key]);
              } else {
                onChange(values.filter((v) => v !== item.key));
              }
            }}
            type="checkbox"
          />
          {item.label}
        </label>
      </li>
    ))}
  </ul>
);
