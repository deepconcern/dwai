import {
  ChangeEvent,
  FC,
  FormEvent,
  Fragment,
  useCallback,
  useState,
} from "react";

import { FullCharacterClassFragment } from "../gql/graphql";
import { GENERIC_FLOW_CSS } from "../lib/styles";

import { Button } from "./Button";
import { Container } from "./Container";
import { Text } from "./Text";
import { getFragmentData } from "../gql";
import { SHORT_MOVE_TEMPLATE } from "../queries";
import { DefinitionList, DlDefinition, DlTerm } from "./DefinitionList";
import { Checkbox } from "./Checkbox";
import { Modal } from "./Modal";

export type RaceMoveModalProps = {
  characterClass: FullCharacterClassFragment;
  defaultValue?: string | null;
  onClose: () => void;
  onSubmit: (newRaceMoveId: string) => void;
  open?: boolean;
};

export const RaceMoveModal: FC<RaceMoveModalProps> = ({
  characterClass,
  defaultValue,
  onClose,
  onSubmit,
  open,
}) => {

  const [selectedRaceMoveId, setSelectedRaceMoveId] = useState<string | null | undefined>(defaultValue);

  const handleRaceMoveChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const el = ev.target as HTMLInputElement;

      setSelectedRaceMoveId(selectedRaceMoveId => {
        if (selectedRaceMoveId === el.dataset.raceMoveId) return null;

        return el.dataset.raceMoveId!;
      });
    },
    [setSelectedRaceMoveId]
  );

  const handleSubmit = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();

      if (!selectedRaceMoveId) return;

      onSubmit(selectedRaceMoveId);
    },
    [onSubmit, selectedRaceMoveId]
  );

  return (
    <Modal onClose={onClose} open={open} title="Race">
      <form css={GENERIC_FLOW_CSS} onSubmit={handleSubmit}>
      <Container title="Examples">
        <p>
          <Text variant="disabled">(Click on one to autofill)</Text>
        </p>
        <DefinitionList>
          {characterClass.raceMoves.map((r) => {
            const raceMove = getFragmentData(SHORT_MOVE_TEMPLATE, r);

            return (
              <Fragment key={raceMove.id}>
                <DlTerm>
                  <Checkbox
                    checked={selectedRaceMoveId === raceMove.id}
                    data-race-move-id={raceMove.id}
                    label={raceMove.name}
                    onChange={handleRaceMoveChange}
                  />
                </DlTerm>
                <DlDefinition>{raceMove.text}</DlDefinition>
              </Fragment>
            );
          })}
        </DefinitionList>
      </Container>
      <Button role="button" type="submit">
        Change Race
      </Button>
    </form>
    </Modal>
  );
};
