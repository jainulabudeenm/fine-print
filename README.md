# Fine Print

A Claude skill that audits a Figma component before it goes to an engineer, to Code Connect, or into a
design system release. It reads the fine print: the property names, the bindings, the layer tree, the
variants and the tokens. Then it says whether they form a contract that a machine and an engineer can
both read.

A component can look perfect on the canvas and still be a bad handover. The icon layer has a
different name in two variants, so an override silently disappears when someone switches size. A
boolean called `Show subtext` cannot be a variable name. One variant decides both the shape and which
icon appears, so half the combinations a team will want are impossible. None of this shows on screen.
It only shows when you read the structure.

## Install

In Claude Code, as a plugin:

```
/plugin marketplace add jainulabudeenm/fine-print
/plugin install fine-print
```

From npm, which also covers Claude.ai and anywhere outside Claude Code:

```
npx fine-print
```

It reads the component through the Figma MCP server (Dev Mode), so turn that on first.

## Use

Select a component or component set in Figma, then:

```
> audit this component
> is this card ready for Code Connect?
```

## How it works

**Six questions first.** Can a machine read it? Does one name mean one thing everywhere? Is every
changeable thing a property, and is every property bound to something? Does each property do exactly
one job? What will a consumer want next quarter that they cannot do today? What does the code need
that Figma can never show? These find the problems nobody has written a rule for yet.

**A name gate.** One agreed word per concept, and each word forbids its synonyms. `headingText`, never
`title`, `header` or `cardTitle`. `leadingIcon`, never `leftIcon`, because left breaks in
right-to-left languages. It reads your design system's `lexicon.json`, and if you do not have one,
it starts you on a starter set that you change to fit your system. It never adds a word without
asking.

**A rule catalogue as a safety net.** Rules for names, structure, contract completeness, tokens,
variants and the library, each with a severity and a detection method written against real Figma API
fields. Any rule can be overridden when a component has a good reason, and the report says which ones
were and why.

**What Figma cannot hold.** Callbacks, accessible names, required props, defaults, overflow, focus
order, reduced motion. Printed every run, because this list is the reason a Figma file is not a
handover.

## What you get

A report with blockers, warnings, lexicon proposals, rules it overrode, what passed, and the list of
things to put in the spec. After you fix the blockers, it can write two files: a `SPEC` for the
engineer, with no audit history in it, and an `AUDIT` record for the design system team, so the next
audit can see whether a rule keeps firing on the same component.

It never fixes the component for you and never renames anything without asking, because Code Connect
maps to node IDs and a rebuilt component breaks every mapping.

## License

MIT
