import {
  ChangeEvent,
  FC,
  FormEvent,
  Fragment,
  useCallback,
  useState,
} from "react";

import { FragmentType, getFragmentData } from "../gql";
import { GENERIC_FLOW_CSS } from "../lib/styles";
import { SHORT_MOVE_TEMPLATE } from "../queries";

import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Container } from "./Container";
import { DefinitionList, DlDefinition, DlTerm } from "./DefinitionList";
import { Modal } from "./Modal";
import { Text } from "./Text";

export type ChooseMoveModalProps = {
  allowedChoices?: number | null;
  defaultValues?: string[] | null;
  onClose: () => void;
  onSubmit: (moveIds: string[]) => void;
  open?: boolean;
  selectableMoves: FragmentType<typeof SHORT_MOVE_TEMPLATE>[];
};

export const ChooseMoveModal: FC<ChooseMoveModalProps> = ({
  allowedChoices,
  defaultValues,
  onClose,
  onSubmit,
  open,
  selectableMoves,
}) => {
  allowedChoices = typeof allowedChoices === "number" ? allowedChoices : 1;

  const [selectedMoveIds, setSelectedMoveIds] = useState<string[]>(
    defaultValues || []
  );

  const handleMoveChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const { moveId } = (ev.target as HTMLInputElement).dataset;

      if (!moveId) return;

      setSelectedMoveIds((selectedMoveIds) => {
        if (selectedMoveIds.includes(moveId)) {
          return selectedMoveIds.filter((id) => id !== moveId);
        }

        if (selectedMoveIds.length === allowedChoices) return selectedMoveIds;

        return [...selectedMoveIds, moveId];
      });
    },
    [allowedChoices, setSelectedMoveIds]
  );

  const handleSubmit = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();

      if (!selectedMoveIds) return;

      onSubmit(selectedMoveIds);
    },
    [onSubmit, selectedMoveIds]
  );

  return (
    <Modal onClose={onClose} open={open} title="Race">
      <form css={GENERIC_FLOW_CSS} onSubmit={handleSubmit}>
        <Container title="Examples">
          <p>
            <Text variant="disabled">(Click on one to autofill)</Text>
          </p>
          <DefinitionList>
            {selectableMoves.map((s) => {
              const selectableMove = getFragmentData(SHORT_MOVE_TEMPLATE, s);

              return (
                <Fragment key={selectableMove.id}>
                  <DlTerm>
                    <Checkbox
                      checked={selectedMoveIds.includes(selectableMove.id)}
                      data-move-id={selectableMove.id}
                      label={selectableMove.name}
                      onChange={handleMoveChange}
                    />
                  </DlTerm>
                  <DlDefinition>{selectableMove.text}</DlDefinition>
                </Fragment>
              );
            })}
          </DefinitionList>
        </Container>
        <Button role="button" type="submit">
          Choose Move
        </Button>
      </form>
    </Modal>
  );
};
