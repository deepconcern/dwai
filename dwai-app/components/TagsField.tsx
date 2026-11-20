"use client";

import { FC, KeyboardEventHandler, useId, useState } from "react";

import { Button } from "./Button";
import { TextInput } from "./TextInput";

export type TagsFieldProps = {
  /** The field's label, e.g. "Tags". */
  label: string;
  onChange: (tags: string[]) => void;
  /** Tags to suggest as the user types. Any text is allowed. */
  suggestions: readonly string[];
  tags: string[];
};

/**
 * A list of free-text tags: each shows as a chip with a remove button, and
 * new ones are typed (with suggestions) and added with Enter or Add.
 */
export const TagsField: FC<TagsFieldProps> = ({
  label,
  onChange,
  suggestions,
  tags,
}) => {
  const [draft, setDraft] = useState("");
  const listId = useId();

  const add = () => {
    const tag = draft.trim();
    if (tag !== "" && !tags.includes(tag)) onChange([...tags, tag]);
    setDraft("");
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (ev) => {
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    add();
  };

  return (
    <fieldset className="flex flex-col gap-1">
      <legend>{label}</legend>
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <li
              className="bg-gray-800 flex gap-1 items-center px-2 rounded"
              key={tag}
            >
              {tag}
              <button
                aria-label={`Remove ${tag}`}
                className="text-gray-400 hover:text-white"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                type="button"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <TextInput
          aria-label={`Add to ${label.toLowerCase()}`}
          className="flex-1"
          list={listId}
          onChange={(ev) => setDraft(ev.target.value)}
          onKeyDown={handleKeyDown}
          value={draft}
        />
        <Button onClick={add} type="button">
          Add
        </Button>
      </div>
      <datalist id={listId}>
        {suggestions
          .filter((s) => !tags.includes(s))
          .map((s) => (
            <option key={s} value={s} />
          ))}
      </datalist>
    </fieldset>
  );
};
