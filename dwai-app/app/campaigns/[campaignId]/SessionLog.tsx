import { FC } from "react";

import { Section } from "@/components/Section";

import { CampaignData } from "./types";

type Answer = { checked: boolean; reason?: string | null };

const GROUP_QUESTIONS = [
  ["learned", "Learned something new and important about the world"],
  ["overcame", "Overcame a notable monster or enemy"],
  ["looted", "Looted a memorable treasure"],
] as const;

/** "Yes: reason" or "No". */
const answer = ({ checked, reason }: Answer) =>
  checked ? `Yes: ${reason}` : "No";

export type SessionLogProps = {
  sessions: CampaignData["sessions"];
};

/**
 * Every End of Session, newest first: the group's answers and each
 * player's report, with the reasons they gave and the XP marked.
 */
export const SessionLog: FC<SessionLogProps> = ({ sessions }) => (
  <Section title="Session Log">
    {sessions.length === 0 ? (
      <p>No sessions yet.</p>
    ) : (
      <ol className="flex flex-col space-y-4">
        {sessions.map((session) => (
          <li aria-label={`Session ${session.number}`} key={session.id}>
            <h4 className="font-semibold">
              Session {session.number}{" "}
              <span className="font-normal text-gray-400">
                {new Date(session.createdAt).toLocaleDateString()}
              </span>
            </h4>
            <ul className="list-disc list-inside">
              {GROUP_QUESTIONS.map(([key, label]) => (
                <li key={key}>
                  {label}: {answer(session[key])}
                </li>
              ))}
            </ul>
            {session.reports.length > 0 && (
              <ul className="flex flex-col mt-2 space-y-1">
                {session.reports.map((report) => (
                  <li key={report.character.id}>
                    <span className="font-semibold">
                      {report.character.name}
                    </span>{" "}
                    marked {report.xpAwarded} XP
                    <ul className="list-disc list-inside ml-4">
                      <li>Alignment fulfilled: {answer(report.alignment)}</li>
                      {report.bond.checked && (
                        <li>
                          Resolved &quot;{report.resolvedBondText}&quot;:{" "}
                          {report.bond.reason}
                        </li>
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    )}
  </Section>
);
