"use client";

import { useMutation } from "@apollo/client/react";
import clsx from "clsx";
import { FC, useState } from "react";

import { MessageFragment } from "@/fragments/MessageFragment";
import { FragmentType, graphql, unmaskFragment } from "@/gql";
import { MessageFragmentFragment } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { bandLabel, formatBreakdown } from "@/lib/rolls";

const MARK_XP_MUTATION = graphql(`
  mutation MarkXpForMiss($id: ID!) {
    characters {
      adjustXp(delta: 1, id: $id) {
        id
        xp
      }
    }
  }
`);

/** The move's text for the band rolled, as a reminder. */
const outcomeText = (roll: NonNullable<MessageFragmentFragment["roll"]>) => {
  if (!roll.move || !roll.band) return null;

  switch (roll.band) {
    case "STRONG_HIT":
      return roll.move.on10;
    case "WEAK_HIT":
      return roll.move.on7to9;
    case "MISS":
      return roll.move.onMiss ?? "The GM makes a move.";
  }
};

const BAND_STYLES = {
  MISS: "bg-red-900",
  STRONG_HIT: "bg-green-900",
  WEAK_HIT: "bg-yellow-900",
};

export type ChatMessageProps = {
  message: FragmentType<typeof MessageFragment>;
};

/**
 * One line of the table chat: something said, a roll with its breakdown, or
 * a sheet change. A miss offers its roller a Mark XP button; nothing is
 * marked automatically.
 */
export const ChatMessage: FC<ChatMessageProps> = ({ message: fragment }) => {
  const message = unmaskFragment(MessageFragment, fragment);
  const [marked, setMarked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markXp, { loading }] = useMutation(MARK_XP_MUTATION);

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const roll = message.roll;

  const handleMarkXp = async () => {
    if (!message.characterId) return;
    setError(null);
    try {
      await markXp({ variables: { id: message.characterId } });
      setMarked(true);
    } catch (e) {
      setError(errorMessages(e).join(" "));
    }
  };

  if (message.kind === "ACTIVITY") {
    return (
      <li className="text-gray-400 text-sm">
        {message.characterName ?? "GM"} {message.body}
        {message.authorIsGm && message.characterName && " (by the GM)"}
        <span className="ml-2 text-gray-500 text-xs">· {time}</span>
      </li>
    );
  }

  const tags = [
    message.ooc && "out of character",
    message.whisperTo && `whisper to ${message.whisperTo}`,
    message.gmOnly && "GM only",
  ].filter(Boolean);

  return (
    <li
      className={clsx(
        "border-l-4 pl-2",
        message.whisperTo || message.gmOnly
          ? "border-purple-500"
          : message.authorIsGm
            ? "border-amber-500"
            : "border-blue-500",
        message.ooc && "italic text-gray-300",
      )}
    >
      <p className="text-sm">
        <span className="font-semibold">{message.authorName}</span>
        {tags.length > 0 && (
          <span className="ml-2 text-gray-400">({tags.join(", ")})</span>
        )}
        <span className="ml-2 text-gray-500 text-xs">{time}</span>
      </p>

      {message.kind === "CHAT" && (
        <p className="whitespace-pre-wrap">{message.body}</p>
      )}

      {roll && (
        <div
          aria-label={`${message.authorName} rolled ${roll.label}`}
          role="group"
        >
          <p>
            <span
              aria-label={roll.source === "APP" ? "app roll" : "physical dice"}
            >
              {roll.source === "APP" ? "🎲" : "✍️"}
            </span>{" "}
            {message.kind === "DAMAGE" ? "Damage " : ""}
            <span className="font-medium">{roll.label}</span>:{" "}
            {formatBreakdown(roll)}
            {roll.band && (
              <span
                className={clsx(
                  "ml-2 px-2 py-0.5 rounded text-sm",
                  BAND_STYLES[roll.band],
                )}
              >
                {bandLabel(roll.band)}
              </span>
            )}
          </p>
          {outcomeText(roll) && (
            <p className="text-gray-300 text-sm">{outcomeText(roll)}</p>
          )}
          {roll.band === "MISS" &&
            message.viewerIsAuthor &&
            message.characterId && (
              <p className="flex gap-2 items-center mt-1 text-sm">
                {marked ? (
                  <span className="text-gray-400">XP marked.</span>
                ) : (
                  <button
                    className="border hover:bg-neutral-800 px-2 py-0.5 rounded"
                    disabled={loading}
                    onClick={handleMarkXp}
                    type="button"
                  >
                    Mark XP
                  </button>
                )}
                {error && <span className="text-red-400">{error}</span>}
              </p>
            )}
        </div>
      )}
    </li>
  );
};
