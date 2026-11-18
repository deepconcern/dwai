"use client";

import { useMutation, useQuery, useSubscription } from "@apollo/client/react";
import {
  FC,
  FormEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { Section } from "@/components/Section";
import { MessageFragment } from "@/fragments/MessageFragment";
import { graphql, unmaskFragment } from "@/gql";
import { GetCampaignMessagesQuery } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { onReconnected } from "@/lib/reconnect";

import { ChatMessage } from "./ChatMessage";
import { CampaignData } from "./types";

const GET_CAMPAIGN_MESSAGES_QUERY = graphql(`
  query GetCampaignMessages($before: ID, $id: ID!) {
    campaigns {
      byId(id: $id) {
        id
        messages(before: $before) {
          hasMore
          messages {
            id
            ...MessageFragment
          }
        }
      }
    }
  }
`);

const CAMPAIGN_MESSAGES_SUBSCRIPTION = graphql(`
  subscription CampaignMessages($campaignId: ID!) {
    campaignMessages(campaignId: $campaignId) {
      id
      ...MessageFragment
    }
  }
`);

const POST_MESSAGE_MUTATION = graphql(`
  mutation PostMessage($id: ID!, $input: MessageInput!) {
    campaigns {
      postMessage(id: $id, input: $input) {
        id
      }
    }
  }
`);

type MessagePage = GetCampaignMessagesQuery["campaigns"]["byId"]["messages"];

/** Adds messages to a page, oldest first, skipping ones already there. */
const mergeMessages = (
  page: MessagePage,
  older: MessagePage["messages"],
  newer: MessagePage["messages"],
): MessagePage["messages"] => {
  const seen = new Set(page.messages.map((m) => m.id));
  const fresh = (list: MessagePage["messages"]) =>
    list.filter((m) => !seen.has(m.id));

  return [...fresh(older), ...page.messages, ...fresh(newer)];
};

export type ChatPanelProps = {
  campaign: CampaignData;
};

/**
 * The campaign's table chat: messages, rolls, and activity lines, live over
 * a subscription. Players post as their character (or out of character) and
 * can whisper to the GM; the GM can whisper to one player. Older messages
 * load on request.
 */
export const ChatPanel: FC<ChatPanelProps> = ({ campaign }) => {
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [ooc, setOoc] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [whisperTo, setWhisperTo] = useState("");
  const listRef = useRef<HTMLOListElement>(null);
  const stickToBottom = useRef(true);
  const subscriptionFailed = useRef(false);

  const variables = { id: campaign.id };
  const { client, data, fetchMore, loading, refetch } = useQuery(
    GET_CAMPAIGN_MESSAGES_QUERY,
    { fetchPolicy: "network-only", variables },
  );
  const [postMessage, { loading: posting }] = useMutation(
    POST_MESSAGE_MUTATION,
  );

  const { restart } = useSubscription(CAMPAIGN_MESSAGES_SUBSCRIPTION, {
    // The API ends the subscription of a reader who fell too far behind.
    // Start again and reload what was missed, unless it ended in an error
    // (such as being removed from the campaign), which a retry won't fix.
    onComplete: () => {
      if (subscriptionFailed.current) return;
      restart();
      void refetch();
    },
    onData: ({ data: { data: received } }) => {
      if (!received) return;
      client.cache.updateQuery(
        { query: GET_CAMPAIGN_MESSAGES_QUERY, variables },
        (previous) =>
          previous && {
            ...previous,
            campaigns: {
              ...previous.campaigns,
              byId: {
                ...previous.campaigns.byId,
                messages: {
                  ...previous.campaigns.byId.messages,
                  messages: mergeMessages(
                    previous.campaigns.byId.messages,
                    [],
                    [received.campaignMessages],
                  ),
                },
              },
            },
          },
      );
    },
    onError: () => {
      subscriptionFailed.current = true;
    },
    variables: { campaignId: campaign.id },
  });

  // Reload what was missed while the connection was down.
  useEffect(() => onReconnected(() => void refetch()), [refetch]);

  const page = data?.campaigns.byId.messages;
  const messages = (page?.messages ?? []).filter(
    (m) =>
      showActivity || unmaskFragment(MessageFragment, m).kind !== "ACTIVITY",
  );

  // Follow new messages, unless the reader has scrolled up.
  useEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  const handleScroll = () => {
    const list = listRef.current;
    if (list) {
      stickToBottom.current =
        list.scrollHeight - list.scrollTop - list.clientHeight < 40;
    }
  };

  const handleLoadOlder = () => {
    if (!page || page.messages.length === 0) return;
    stickToBottom.current = false;
    void fetchMore({
      updateQuery: (previous, { fetchMoreResult }) => ({
        ...previous,
        campaigns: {
          ...previous.campaigns,
          byId: {
            ...previous.campaigns.byId,
            messages: {
              hasMore: fetchMoreResult.campaigns.byId.messages.hasMore,
              messages: mergeMessages(
                previous.campaigns.byId.messages,
                fetchMoreResult.campaigns.byId.messages.messages,
                [],
              ),
            },
          },
        },
      }),
      variables: { before: page.messages[0].id },
    });
  };

  const send = async () => {
    if (body.trim() === "") return;
    setErrors([]);
    try {
      await postMessage({
        variables: {
          id: campaign.id,
          input: {
            body,
            ooc,
            ...(whisperTo === "GM"
              ? { whisperToGm: true }
              : whisperTo
                ? { whisperToCharacterId: whisperTo }
                : {}),
          },
        },
      });
      setBody("");
      stickToBottom.current = true;
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault();
    void send();
  };

  // Enter sends; Shift+Enter starts a new line.
  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (ev) => {
    if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      void send();
    }
  };

  const whisperOptions = campaign.isGm
    ? campaign.characters.map((c) => ({ label: c.name, value: c.id }))
    : [{ label: "the GM", value: "GM" }];

  return (
    <Section aria-label="Table chat" className="h-full" title="Table">
      <div className="flex flex-col gap-2">
        <label className="flex gap-2 items-center self-end text-sm">
          <input
            checked={showActivity}
            onChange={(ev) => setShowActivity(ev.target.checked)}
            type="checkbox"
          />
          Show sheet activity
        </label>

        <ol
          aria-label="Messages"
          aria-live="polite"
          className="flex flex-col gap-2 h-[32rem] overflow-y-auto pr-2"
          onScroll={handleScroll}
          ref={listRef}
        >
          {page?.hasMore && (
            <li className="self-center">
              <Button onClick={handleLoadOlder} type="button">
                Load older messages
              </Button>
            </li>
          )}
          {loading && !page && <li>Loading...</li>}
          {page && page.messages.length === 0 && (
            <li className="text-gray-400">
              Nothing yet. Say hello, or roll something.
            </li>
          )}
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
        </ol>

        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <textarea
            aria-label="Message"
            className="border px-3 py-2 rounded"
            maxLength={2000}
            onChange={(ev) => setBody(ev.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              campaign.isGm ? "Speak as the GM..." : "Say something..."
            }
            rows={2}
            value={body}
          />
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex gap-2 items-center">
              <input
                checked={ooc}
                onChange={(ev) => setOoc(ev.target.checked)}
                type="checkbox"
              />
              Out of character
            </label>
            <label className="flex gap-2 items-center">
              To
              <select
                className="border px-2 py-1 rounded"
                onChange={(ev) => setWhisperTo(ev.target.value)}
                value={whisperTo}
              >
                <option className="bg-black" value="">
                  everyone
                </option>
                {whisperOptions.map((o) => (
                  <option className="bg-black" key={o.value} value={o.value}>
                    {o.label} (whisper)
                  </option>
                ))}
              </select>
            </label>
            <Button className="ml-auto" disabled={posting} type="submit">
              Send
            </Button>
          </div>
          <ErrorList errors={errors} />
        </form>
      </div>
    </Section>
  );
};
