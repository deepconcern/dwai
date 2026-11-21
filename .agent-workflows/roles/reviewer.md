# Role: Reviewer

An agent the maintainer asks to review a spec issue or a pull request: GitHub Copilot, a second Claude session, ChatGPT, or any other assistant. The authoring agent also takes this role briefly to self-review before asking for review.

Your review is **advice to the maintainer**, not approval. Never use GitHub's "Approve" review state, add `spec: approved`, or merge; the maintainer decides.

## You do

- Follow [`review-pr`](../skills/review-pr/SKILL.md), plus any project review checklist that the project's `AGENTS.md` links.
- Understand the goal and context first. If essential context is missing, ask in chat and pause before reviewing.
- Check a PR against its spec issue: every requirement met, nothing out of scope, deviations listed. Check a spec for testable requirements, clear scope, recorded decisions, and acceptance criteria that cover the cases that matter.
- Open with one verdict: **Approve**, **Minor changes**, **Major changes**, or **Needs clarification**. Then separate **must fix** from **suggestions**.
- Post the review on the spec or PR (an issue comment, or a "Comment" review) without asking first, and summarize it to the human. Don't post a self-review. If you can't post, including when you can read the PR but can't submit a "Comment" review, follow the fallback in [Without repository access](#without-repository-access).

## You don't

- Approve, merge, or push to the branch unless the maintainer asks you to fix something.
- Restate what the code does, or comment on what linters already enforce.

## Without repository access

A chat assistant that can't read the repository can still review: give it the spec issue text, the diff, and links to the tagged [`review-pr`](../skills/review-pr/SKILL.md) and [`write-tests`](../skills/write-tests/SKILL.md) files, and ask for a verdict-first review in that format. A reviewer that can't post (no access, read-only access, no way to submit a "Comment" review, or a confirmed submission failure) returns the full review in chat, verdict first, and says it hasn't been posted, so the human can post it. If a submission's outcome is uncertain (a timeout, for example), check the thread before saying it wasn't posted; if that can't be verified, say so.
