---
name: fine-print
description: Use when auditing a Figma component or component set before handoff, Code Connect, or a design system release. Judges whether the component forms a contract a machine and an engineer can both read, using six questions plus a rule catalogue, and always lists what Figma structurally cannot hold.
---

# Fine Print

A Figma component is a handover only when its names, properties and bindings can be read by a
machine. This skill reads the fine print: the properties, the bindings, the layer tree, the
variants and the tokens, and says whether they form a contract.

## Posture. Read this before anything else.

**The six questions are the skill. The rule catalogue is evidence, not law.**

The rules below are findings that have already happened, written down so they are never missed
twice. They will not cover the next component. Every component has its own meaning, its own users
and its own constraints, and the interesting problems are the ones nobody has written a rule for
yet.

So:
- **Always run the six questions first**, against this component, thinking from scratch.
- **Then** run the catalogue as a safety net.
- **Report anything you find either way.** A finding with no rule ID is still a finding. Give it a
  name and say `NEW`.
- **Any rule can be wrong here.** If a rule fires but the component has a good reason, say the
  reason and pass it. Say which rule you overrode and why.
- Weigh by cost, not by severity label. A warning that will cost a migration beats a blocker
  nobody will ever hit.

---

# Part 1. The six questions

Run these on the actual component, in order. This is where the real findings come from.

### Q1. Can a machine read it?
Names legal in code, no Figma defaults, no `Frame 42`. Nothing that needs a human to interpret.
Figma's own guidance: *"A component called `Card/Product/Default` is immediately interpretable; a
component called `Frame 42 copy` is not."*

### Q2. Does one name mean one thing, everywhere?
The layer name, the property name and the code prop should be the same string. Track every concept
through all three places. Where they differ, someone has to translate, and translation rots.

### Q3. Is every changeable thing a property, and is every property bound to something?
Two directions. Something a consumer will want to change but cannot reach forces a detach. A
property bound to nothing sits in the panel doing nothing and still gets mapped in Code Connect.

### Q4. Does each property do exactly one job?
A property that changes shape **and** which child appears has welded two decisions together
because they happened to arrive on the same day. Every combination the designer did not happen to
draw is now impossible.

### Q5. What will a consumer want next quarter that they cannot do today?
Ask it about **this** component, not in general. Read the variants and ask which sensible
combination is missing. This is the question that finds the problems no rule covers.

### Q6. What does the code need that Figma can never show?
Callbacks, accessible names, required-ness, overflow, focus order, reduced motion. See Part 3.
**This section is printed every run, even when everything passes.**

---

# Part 1b. The name gate

**Find the design system's lexicon before judging any name.** It holds the agreed word for each
concept, what each word means, and which synonyms it forbids. Look in this order:

1. `lexicon.json` at the root of the current repo, or in its design system folder. A lexicon that
   lives with the components is one the whole team shares.
2. `~/.claude/fine-print/lexicon.json`.
3. Neither exists: copy `lexicon.starter.json` from this skill's folder to
   `~/.claude/fine-print/lexicon.json`, tell the designer it is a starter set of common words, and
   offer to move it into their repo. Its entries are marked `starter`: treat a clash with them as a
   question for the designer, not a blocker, until the team agrees each word.

A rule stops a bad name. Only a lexicon stops five good names for one thing. That is the harder
problem, and the one that actually kills a system.

For every property and layer name, in order:

1. **In the lexicon?** Use it. Stop.
2. **In some entry's `insteadOf` list?** 🔴 Blocker. Say the agreed word and where it is already
   used.
3. **In `bannedEverywhere`?** 🔴 Blocker. The reason is in the file. `left` and `right` are banned
   because they break in right-to-left languages such as Arabic.
4. **Same shape as something in the lexicon?** Follow the pattern in `conventions`. `has*` for
   booleans, `*Text` for text, `*Slot` for slots, camelCase throughout.
5. **Genuinely new?** Propose an entry. It must carry: the name, the type, what it means in one
   sentence, and **the synonyms it now forbids**. A new word that does not forbid its synonyms
   brings the drift straight back.

**Never add to the lexicon silently.** Show the proposed entry and let the designer say yes.

**N10 · Name not in the lexicon 🔴**
Detect: a property name absent from `names` and from `codeOnly`, with no proposal attached.

**N11 · Name is a forbidden synonym 🔴**
Detect: name appears in any entry's `insteadOf`, or as a key in `bannedEverywhere`.

The lexicon is data, not law. If a component has a real reason to break it, say the reason, pass
it, and list it under "Rules I overrode". Then propose the lexicon change.

---

# How to run it

1. **Structure.** MCP `get_context_for_code_connect` for properties, bindings and the descendant
   tree. MCP `get_metadata` for the full layer tree including frames. Plugin: walk
   `ComponentSetNode.children` and `componentPropertyDefinitions`.
2. **Tokens.** MCP `get_variable_defs`. Plugin: `boundVariables` per node.
3. **Lexicon.** Find it as Part 1b describes.
4. **Run Part 1, the name gate, then Part 2.** Do not stop at the first failure.
5. **Report** in the Part 4 format.
6. **Never fix silently.** Report, let the designer fix, then re-read.

## Never
- Never recreate the component to fix it. Node IDs change, and Code Connect maps to node IDs.
- Never rename on the designer's behalf without asking.
- Never move to Code Connect with a 🔴 open.

---

# Part 2. The rule catalogue

Each rule carries an ID, a severity and a detection method written against real API fields, so it
ports to a plugin without re-deriving anything.

## A. Names

**N1 · Illegal characters in a property name 🔴**
Detect: name fails `/^[A-Za-z_$][A-Za-z0-9_$]*$/`. Examples: `hasHeading?`,
`Show subtext`, `icon-left`, `2xl`.
Why: `?`, spaces and hyphens cannot be a variable name. Code Connect can map around it, but then
the designer and the engineer say different words and neither can grep the other's.

**N2 · Figma default property name 🔴**
Detect: matches `Instance`, `Property N`, `Boolean`, `Text`, `Variant`, `Component`.

**N3 · Property name does not match the layer it binds to 🔴**
Detect: compare each binding's property name with the bound node's name.
Why: the layer name is what Dev Mode shows.

**N4 · Mixed case conventions ⚠️**
Detect: classify every property and layer name as camelCase, PascalCase, kebab-case, snake_case or
Title Case. More than one class fails.
Figma's own words: *"Inconsistencies across your design library, such as using Size, Scale, and
Dimensions to describe the same property, can create unnecessary confusion."*

**N5 · Two words for one concept ⚠️**
Detect: synonym pairs inside one component. heading/title · subtext/supportingText/caption/
description · icon/glyph/symbol · close/dismiss · size/scale/dimensions · kind/type/variant/usage ·
modal/dialog · hover/hovered.

**N6 · Mixed boolean phrasing ⚠️**
Detect: boolean names use more than one of `has`, `show`, `is`, `with`, or none. Figma names this
decision explicitly: *"Boolean phrasing (Has Icon, Show Icon, Icon Visible)"*. Pick one per system.

**N7 · Duplicate names among siblings 🔴**
Why: overrides are matched by name. Duplicates make the match ambiguous.

**N8 · Unnamed wrapper ⚠️**
Detect: `Frame \d+`, `Group \d+`, `Rectangle \d+`, `Ellipse \d+`, `Component \d+`, or any name
ending ` copy`.

**N9 · Component name is not grouped ⚠️**
Detect: component or set name has no `/` segmentation.
Figma: *"A consistent naming pattern with forward slashes helps sort your components into more
manageable buckets"*, e.g. `Card/List/Default`.

## B. Structure

**S1 · Layer names differ across variants 🔴 (the expensive one)**
Detect: for each variant, walk the tree and compare layer names at each position. A name present
in one variant and absent in another, same slot, fails.
Why: Figma matches overrides **by layer name**. A different name throws the override away on a
variant switch, and it does not come back. Nothing on screen shows this. Only a structure read
finds it.
Example: the icon layer is called `CloseIcon` in `size=small` and `Icon` in `size=large`, same
position.

**S2 · Hidden or orphan layer 🔴**
Detect: `visible === false` with no boolean bound to `visible`.

**S3 · Boolean bound too high ⚠️**
Detect: a boolean bound to a frame's `visible` where that frame also holds a node governed by a
different property.
Rule: bind to the smallest frame that holds only what the property names.
Example: `hasHeading` bound to a `headingContainer` that also holds the icon hides the icon too.

**S4 · Dead property ⚠️**
Detect: a property in `componentPropertyDefinitions` that no descendant references.

**S5 · No auto layout, or sizing not intentional ⚠️**
Detect: `layoutMode === "NONE"` on a container that plainly holds a row or stack. Or
`layoutSizingHorizontal`/`Vertical` left at a default that contradicts the intent. Missing
`minWidth`/`maxWidth` on text that can grow.
Figma: *"Auto layout tells agents how elements in a design are meant to be arranged and how they
should respond."*

## C. Contract completeness

**C1 · Text not exposed as a property 🔴**
Detect: a TEXT node whose `characters` is not bound to a TEXT property, and which is not
decoration.
Why: the text is then changed by double-clicking into the instance, so it is outside the contract
and Code Connect has nothing to map.

**C2 · Instance not exposed as instance swap 🔴**
Detect: an INSTANCE whose `mainComponent` is not bound to an INSTANCE_SWAP property, in a position
that is plainly a slot.
Why: nobody can change it, so teams detach the whole component to change one icon. High detach
counts usually mean a missing option, not bad discipline.

**C3 · Optional element with no boolean ⚠️**

**C4 · Instance swap with no preferred values ⚠️**
Detect: `preferredValues` empty. The designer is then offered every component in the file.

**C5 · No description on the component 🔴**
Detect: `description === ""` and `documentationLinks` empty.
Figma: *"Add descriptions to components, styles, and variables directly in Figma"* and *"Use
plain-text descriptions rather than canvas-based documentation."* The description is the only
documentation that reaches the insert panel, Dev Mode and an AI agent. A doc page on the canvas
reaches none of them.

**C6 · No description on the variables or styles it uses ⚠️**
Same reason, one level down.

## D. Tokens

**T1 · Raw value where a token belongs 🔴**
Detect: a fill, stroke, corner radius, spacing, font size, line height or font weight with no entry
in `boundVariables`.

**T2 · Token bound at the wrong tier ⚠️**
Detect: a component part bound straight to a primitive (`grey/500`) instead of a semantic role
(`color/text/secondary`).
Why: a primitive says what the colour is. A semantic token says what it is for. Only the second
survives a rebrand or a dark mode.
Figma: *"semantic naming: `color/surface/primary` communicate how a value should be used."*

## E. Variants

**V1 · One variant doing two jobs 🔴**
Detect: across the options of one variant property, more than one kind of thing changes. Shape
**and** which child is present. Size **and** colour.
Example: a `usage` variant that decides the corner radius **and** which icon appears.

**V2 · State drawn by the platform ⚠️**
Detect: option names matching `hover`, `hovered`, `focus`, `focused`, `pressed`, `active`,
`disabled`.
Why: the browser or the OS draws these. They are not props. They belong in the component as
documentation of what they look like, never as something a consumer passes in.
Note: `error`, `loading` and `filled` **are** real props. Do not flag them.

**V3 · Variant count ⚠️**
Detect: total variants over 20. Report the multiplication so the designer sees where it came from.
Example: LabelPosition (2) × Size (3) × State (8) = 48. Remove the six platform-drawn states and the
real code API is three props, one of which is not a prop at all.

**V4 · Variant used where a boolean would do ⚠️**
Detect: two variant options that differ only by one element being present.
Figma: *"if a design system contains buttons with and without an icon, instead of creating variants
for each state, apply a boolean property to the icon's layer visibility."*

## F. Library

**L1 · Library not published ⚠️**
Figma: *"Your library must be published"* for agents to reference it. An unpublished component
cannot be inserted, measured, or read by a tool.

**L2 · No example usage ⚠️**
Detect: no frame or page carrying `_example`, no Examples page.
Why: an example is how both a new designer and an agent learn what the component is for.

---

# Part 3. What Figma cannot hold

Not failures. These exist only in code, so Figma will never show them missing. **Print this every
run.** It is the reason a Figma file is not a handover.

| Thing | Example | Why it matters |
|---|---|---|
| Callbacks | `onIconPress`, `onClose` | Figma has no events. The component tells the parent; it never acts on itself. |
| Accessible names | `iconLabel`, required when an icon shows | A generic icon slot carries no meaning. A screen reader reads nothing useful. |
| Children | `children: ReactNode` | A Figma slot is a shape. In code it is anything. |
| Required vs optional | `children` required, `icon` not | Figma has no idea. |
| Defaults | `size = "medium"` | A Figma default value is a drawing, not a contract. |
| Overflow | slot taller than the card: scroll or grow | Never visible in a static frame. |
| Focus order | is the icon reachable by Tab | Not expressible. |
| Reduced motion | what happens when animation is turned down | Not expressible. |
| Loading and error | what the component shows while waiting | Usually drawn, rarely specified. |

---

# Part 4. Report format

```
## Judgment pass (Q1 to Q6)
What this component is for, who uses it, and what I found by reading it rather than by rule.
Anything with no rule ID gets a name and is marked NEW.

## 🔴 Blockers
ID or NEW · layer or property · what is wrong · the exact fix

## ⚠️ Warnings
same shape

## Lexicon proposals
name · type · means · insteadOf  (nothing is added until the designer says yes)

## Rules I overrode
ID · why this component is a good reason to ignore it

## ✅ Passed
one line per group

## Figma cannot hold these. Put them in the spec.
prop · type · why
```

Close with: **"Fix the blockers and say done. I will read the file again."**

---

# Part 5. Outputs. Two files, two readers.

After the report, offer to write both. **Never write either without asking.**

## 5a. `SPEC-<component>.md`, for the engineer

What to build. No history, no findings, no audit language. An engineer reading this must not have
to know the component was ever wrong.

Sections, in this order:
1. **What it is.** Two or three sentences. Include what it is **not**, when a reader could confuse
   it with something stricter (a card is not a dialog).
2. **Anatomy.** The layer tree, with each boolean marked against the layer it hides.
3. **The API.** Prop, type, default, required, what it is. Then, **below the table**, every rule a
   table cannot hold: conditional requirements, and any property forbidden from taking on a second
   job.
4. **Behaviour.** A when-then table. Include the keyboard row. Mark undecided rows ❓.
5. **Tokens.** Name and today's value, with the line: read the name, not the value.
6. **Edge cases.** Long text, largest text size, a right-to-left language, empty, and every failure
   case.
7. **Figma names for Code Connect.** Two columns, same string. Rows with no Figma side are marked
   "Figma cannot hold this". This is Part 3, made concrete for one component.
8. **Open questions for the engineer.**

**Every unknown is a ❓ and stays a ❓.** Never invent a default, a behaviour, or a problem
statement. An invented spec is worse than a missing one, because it gets built.

## 5b. `AUDIT-<component>-<date>.md`, for the system team

What was wrong and what changed. Carries the rule ID for every row, what was found, and what was
done. Then a "still open" table, then what passed.

Keep it. The next audit reads it to see whether a rule keeps firing on the same component, which
means the rule is wrong or the component needs splitting.

## Writing rule

The spec is generated from the component, so **regenerate it after the fixes, never before.** A
spec written from a component with open blockers describes a thing that is about to change.
