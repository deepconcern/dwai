import { getFragmentData } from "../gql";
import { FullCharacterFragment } from "../gql/graphql";
import { FULL_CHARACTER_MOVE } from "../queries";

export function hasClassMove(character: FullCharacterFragment, moveId: string): boolean {
    for (const fullMove of character.classMoves) {
        const move = getFragmentData(FULL_CHARACTER_MOVE, fullMove);

        if (move.id === moveId) return true;
    }

    return false;
}