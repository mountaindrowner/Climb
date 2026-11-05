# 0001 — Ship as a web page with no build step

**Context.** The prototype was a single self-contained page that ran well on a phone. The team is small and iterates by playing on a phone over the local network.

**Decision.** Keep the game as ES modules served statically, with three.js vendored. No bundler, no transpiler, no package install to play.

**Consequences.** Anyone can play from a checkout. Tests use Node's built-in runner and Playwright. Moving to an engine (Godot, Unity) stays an open question in the direction doc; the modular layout keeps the design and tuning data portable if that happens.
