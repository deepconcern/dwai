const DIE_REGEX = /(?<sign>-?)(?<count>\d+)d(?<faces>\d+)/;

export function rollDie(faces: number): number {
    return Math.floor(Math.random() * faces) + 1;
}

export function rollDice(...inputs: string[]): number {
    let result = 0;

    for (const input of inputs) {
        const match = input.match(DIE_REGEX);

        if (!match?.groups) {
            const n = Number(input);

            if (Number.isFinite(n)) {
                result += n;
                continue;
            }

            throw Error(`Invalid die input: ${input}`);
        }

        const count = Number(match.groups["count"]);
        const faces = Number(match.groups["faces"]);
        const sign = match.groups["sign"] === "-";

        for (let i = 0; i < count; i++) {
            const value = rollDie(faces);

            if (sign) {
                result -= value;
            } else {
                result += value;
            }
        }
    }

    return result;
}