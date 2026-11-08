---
aliases:
  - Full syntax
author: Notes team
version: 1
date: 2026-01-15
reminder: 2026-01-15T09:30
tags:
  - test
  - test/syntax
  - app/notes
---

Notes is a markdown notes app that stores every note as a `.md` file inside your folders.
This guide gathers **all the implemented syntax** so you can try it in the three modes: Read, Edit and Code.

## 1. Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

## 2. Text styles

Text in **bold**, in *italic*, in ***bold and italic***, ~~strikethrough~~ and `inline code`.

Also __bold with underscores__ and _italic with underscores_.

Text with ==highlight== and with ==highlight with **bold** inside==.

A hidden comment %%this is not shown in read mode%% sits in the middle of this sentence.

%%
Multi-line comment
that is not shown either.
%%

Inside code nothing is parsed: `==no highlight==` and `%%no comment%%`.

Escapes: \*not italic\*, \==not highlighted\==, \#not-a-tag.

## 3. Lists

- Item with a dash
- Another item
    - Nested level two
        - Nested level three

* Item with an asterisk
+ Item with a plus

1. First step
2. Second step
    1. Substep
    2. Another substep
3. Third step

### Tasks

- [ ] Pending task
- [x] Completed task
- [ ] Task with **formatting** and ==highlight==
    - [ ] Subtask
- [/] Custom status: in progress
- [-] Custom status: cancelled
- [>] Custom status: deferred

## 4. Quotes and callouts

> A simple quote.
> It continues on the second line.

> Quote with **formatting**
>
> > Nested quote

> [!note] Note
> Note callout with its own title.

> [!abstract] Abstract
> Abstract callout.

> [!info]
> Info callout without a title: it uses the type name.

> [!todo] Todo
> Todo callout.

> [!tip] Tip
> Tip callout with `code` and [[Linked note]].

> [!success] Success
> Success callout.

> [!question] Question
> Question callout.

> [!warning] Warning
> Warning callout.

> [!failure] Failure
> Failure callout.

> [!danger] Danger
> Danger callout.

> [!bug] Bug
> Bug callout.

> [!example] Example
> Example callout.

> [!quote] Quote
> Quote callout.

> [!summary] Abstract alias
> Aliases such as summary, hint, check or error use the style of their base type.

> [!hint]- Folded by default
> This content is hidden until it is expanded.

> [!faq]+ Expanded by default
> This content is shown and can be folded.

> [!unknown] Unknown type
> A type that does not exist uses the note style.

## 5. Links

- Web link: [Expo](https://expo.dev)
- Autolink: https://reactnative.dev
- Email: [Write](mailto:hello@example.com)
- Phone: [Call](tel:+5255555555)

### Internal links

- Link to a note: [[Linked note]]
- With alternative text: [[Linked note|this other note]]
- To a section: [[Linked note#Section one]]
- To a section ignoring case: [[Linked note#section one|with alias]]
- To a section that does not exist: [[Linked note#Missing section]]
- To a heading in this same note: [[#6. Embeds]]
- To a block: [[Linked note#^test-block]]
- To a list block: [[Linked note#^test-list]]
- To a block that does not exist: [[Linked note#^does-not-exist]]
- By the note alias: [[Test alias]]
- With a lowercase name: [[linked note]]
- Broken link: [[This note does not exist]]

## 6. Embeds

Embedded note:

![[Embed note]]

Embedded section (from its heading to the next one):

![[Linked note#Section one]]

Embedded block (only that paragraph):

![[Linked note#^test-block]]

Embedded block that does not exist:

![[Linked note#^does-not-exist]]

Embedded image:

![[syntax-sample.png]]

Image 120 px wide:

![[syntax-sample.png|120]]

Attachments (PDF, audio, video and text; the file must exist in your attachments):

- Link to a PDF: [[sample.pdf]]
- Link with an alias: [[sample.pdf|View document]]
- Page preview (enable it in Settings, Attachments): ![[sample.pdf#page=1]]
- Audio with a player (if it is not too large): ![[sample.wav]]
- Video with a player, 240 px wide: ![[sample.mp4|240]]
- Plain text: [[sample.txt]]
- Attachment that does not exist: [[missing-file.pdf]]

Broken embed:

![[Embed that does not exist]]

Block with its own id in this note, linkable from other notes. ^guide-block

## 7. Tags

Inline tags: #app #app/editor #app/editor/modes #test/syntax and #tag-with-dashes.

These are not tags: `#in-code`, a lone hash # or text like a#b.

Frontmatter tags (`test`, `test/syntax`, `app/notes`) are edited in the properties panel.

## 8. Tables

In edit mode, tap a cell to edit it and use the row and column handles (tap or long press) to insert, move, duplicate, align or delete.

| Feature | Mode | Status | Version | Platform | Priority | Owner | Notes |
| :--- | :---: | ---: | :---: | :--- | :---: | :--- | :--- |
| Highlight | Read and edit | Done | 1.0 | Android | High | Editor team | `==text==` |
| Callouts | Read and edit | Done | 1.1 | Android | Medium | Editor team | 13 types and aliases |
| Embeds | Read only | Done | 1.2 | Android | Medium | Links team | Notes, blocks and images |
| Tables | Edit | Done | 1.3 | Android | High | Editor team | Horizontal scrolling |
| Search with operators | Search | Done | 1.4 | Android | High | Search team | `tag:` `path:` `has:images` `is:pinned` |

## 9. Code

Block with a language:

```js
const greet = (name) => `Hello, ${name}`
console.log(greet("Notes"))
```

Block without a language:

```
plain text ==not highlighted== %%not hidden%% #not-a-tag
```

Block with tildes:

~~~json
{ "app": "notes", "modes": ["read", "edit", "code"] }
~~~

    Block indented with four spaces

## 10. Math

Inline: $E = mc^2$ and $\alpha + \beta = \gamma$.

Block:

$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## 11. Footnotes

This sentence has a footnote[^1] and another one[^long].

[^1]: Content of the first footnote.
[^long]: A footnote with **formatting** and a link to [[Linked note]].

Inline footnote^[It is written inside the text itself, without a separate definition.].

## 12. Separators

---

***

___

## 13. HTML

<div style="padding:12px;border:1px solid currentColor;border-radius:8px">Box with inline HTML</div>

<details><summary>Expandable details</summary>

Content inside a native `details`.

</details>

Text with <mark>mark</mark>, <sup>superscript</sup> and <sub>subscript</sub>.

## 14. Search

Plain words match the note content, title and path. Every word must appear in the same note.

- `"exact phrase"`, `/gu[il]de/` regex, `a OR b`, `(a OR b) c` and negation `-word` or `-(a b)`
- `tag:test` or `tag:#test/syntax`, `path:Folder 1`, `file:guide`, `content:text`
- `match-case:Notes` and `ignore-case:notes`, and the Match case button
- `line:(pending task)`, `block:(a b)`, `section:(a b)`
- `task:call`, `task-todo:call`, `task-done:call`
- `has:images`, `has:files` and `is:pinned`
- Properties `[author]`, `[author:Notes]`, `[author:null]`, `[rating:>3]` and `[status:draft OR done]`
- Sort, more context and the Filter button to add filters without typing

## 15. Long text and special characters

Accents and special letters: canción, pingüino, niño, über. Symbols: © ® ™ € £ ¥ → ← ↑ ↓ ✓ ✗.

Emoji: 📝 ✅ 🚀

Long line without spaces to test wrapping: abcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghij
