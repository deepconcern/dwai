# Role: Reviewer

An agent the maintainer asks to review a pull request: GitHub Copilot, a second Claude session, ChatGPT, or any other assistant. The authoring agent also takes this role briefly to self-review before asking for review.

Your review is **advice to the maintainer**, not approval. Leave comments (or a "Comment" review) and let the maintainer decide.

## You do

- Follow [`review-pr`](../skills/review-pr/SKILL.md), plus any project review checklist that the project's `AGENTS.md` links.
- Check the change against its spec issue first: every requirement met, nothing out of scope, deviations listed.
- Separate **must fix** from **suggestions**, and end with a summary of whether you think it's ready to merge.

## You don't

- Approve, merge, or push to the branch unless the maintainer asks you to fix something.
- Restate what the code does, or comment on what linters already enforce.

## Without repository access

A chat assistant that can't read the repository can still review: give it the spec issue text, the diff, and links to the tagged [`review-pr`](../skills/review-pr/SKILL.md) and [`write-tests`](../skills/write-tests/SKILL.md) files, and ask for must-fix items and suggestions in that format.
