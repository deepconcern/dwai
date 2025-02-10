import {
  ChangeEvent,
  FC,
  FormEvent,
  MouseEvent,
  useCallback,
  useState,
} from "react";

import { Alignment, FullCharacterClassFragment } from "../gql/graphql";
import { capitalize } from "../lib/capitalize";
import { GENERIC_FLOW_CSS } from "../lib/styles";

import { Button } from "./Button";
import { Container } from "./Container";
import { Field } from "./Field";
import { List } from "./List";
import { Modal } from "./Modal";
import { Select } from "./Select";
import { Text } from "./Text";
import { TextInput } from "./TextInput";

const ALIGNMENT_TYPES = ["chaotic", "evil", "good", "lawful", "neutral"];

export type AlignmentModalProps = {
  characterClass: FullCharacterClassFragment;
  onClose: () => void;
  onSubmit: (newAlignment: Pick<Alignment, "name" | "text">) => void;
  open?: boolean;
};

export const AlignmentModal: FC<AlignmentModalProps> = ({
  characterClass,
  onClose,
  onSubmit,
  open,
}) => {
  const [text, setText] = useState("");
  const [type, setType] = useState("");

  const handleAutofill = useCallback(
    (ev: MouseEvent<HTMLAnchorElement>) => {
      setText((ev.target as HTMLAnchorElement).dataset.alignmentText!);
      setType((ev.target as HTMLAnchorElement).dataset.alignmentType!);
    },
    [setText, setType]
  );

  const handleSubmit = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();

      onSubmit({
        name: capitalize(type),
        text,
      });
    },
    [onSubmit, text, type]
  );

  const handleTextChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setText(ev.target.value);
    },
    [setText]
  );

  const handleTypeChange = useCallback(
    (ev: ChangeEvent<HTMLSelectElement>) => {
      setType(ev.target.value);
    },
    [setType]
  );

  return (
    <Modal onClose={onClose} open={open} title="Alignment">
      <form css={GENERIC_FLOW_CSS} onSubmit={handleSubmit}>
        <Container css={{}} title="Examples">
          <p>
            <Text variant="disabled">(Click on one to autofill)</Text>
          </p>
          <List>
            {characterClass.alignmentTemplates.map((a) => (
              <li key={a.id}>
                <a
                  data-alignment-text={a.text}
                  data-alignment-type={a.name.toLocaleLowerCase()}
                  onClick={handleAutofill}
                >
                  {a.name}: {a.text}
                </a>
              </li>
            ))}
          </List>
        </Container>
        <Field>
          <label htmlFor="alignment-type">Alignment Type</label>
          <Select
            id="alignment-type"
            items={ALIGNMENT_TYPES.map((a) => ({
              key: a,
              label: capitalize(a),
            }))}
            onChange={handleTypeChange}
            placeholder="Select alignment type"
            value={type}
          />
        </Field>
        <Field>
          <label htmlFor="alignment-text">Alignment Text</label>
          <TextInput
            id="alignment-text"
            onChange={handleTextChange}
            placeholder="Enter alignment text"
            value={text}
          />
        </Field>
        <Button role="button" type="submit">
          Change Alignment
        </Button>
      </form>
    </Modal>
  );
};
