<p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/aralroca/diff-dom-streaming/assets/13313058/ca678952-6232-4db4-aff2-c4bedade4f9a" width="128">
      <img src="https://github.com/aralroca/diff-dom-streaming/assets/13313058/6d544ef2-651e-4907-a246-abc6c859ab5c" width="128">
    </picture>
        <h1 align="center">Diff DOM Streaming</h1>
</p>

[![npm version](https://badge.fury.io/js/diff-dom-streaming.svg)](https://badge.fury.io/js/diff-dom-streaming)
![npm](https://img.shields.io/npm/dw/diff-dom-streaming)
![size](https://img.shields.io/bundlephobia/minzip/diff-dom-streaming)
[![PRs Welcome][badge-prwelcome]][prwelcome]
<a href="https://github.com/aralroca/diff-dom-streaming/actions?query=workflow%3ATest" alt="Tests status">
<img src="https://github.com/aralroca/diff-dom-streaming/workflows/Test/badge.svg" /></a>
<a href="https://twitter.com/intent/follow?screen_name=aralroca">
<img src="https://img.shields.io/twitter/follow/aralroca?style=social&logo=x"
            alt="follow on Twitter"></a>

</div>

[badge-prwelcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prwelcome]: http://makeapullrequest.com

The Diff DOM (Document Object Model) algorithm is used to compare two versions of the DOM, such as before and after an update on a web page. It aims to efficiently identify the changes between both DOMs, minimizing the number of manipulations required to update the user interface.

The Diff DOM Streaming library extends the traditional Diff DOM algorithm by introducing support for comparing a DOM node with a streaming reader. This enables the library to process the changes incrementally as they occur during the diff process.

## Getting started

### NPM

Install:

```sh
bun install diff-dom-streaming
```

Then import it:

```ts
import diff from "diff-dom-streaming";
```

### JSR

Install:

```sh
bunx jsr add @aralroca/diff-dom-streaming
```

Then import it:

```ts
import diff from "@aralroca/diff-dom-streaming";
```

### UNPKG

Just import it:

```tsx
import diff from "https://unpkg.com/diff-dom-streaming@latest";
```

## Using it

```ts
const res = await fetch(/* some url */);

// Diff between the current document and the reader:
await diff(document, res.body.getReader());
```

## API

`diff(oldNode: Node, reader: ReadableStreamDefaultReader, callback?: Callback)`

This function performs a diffing operation between the `oldNode` and the DOM tree streamed through `reader`. It applies the necessary changes to update the `oldNode` accordingly. An optional `callback` function can be provided to handle node updates.

## Lists and `key` attribute

Keys help to identify which items have changed, are added, or are removed. Keys should be given to the elements inside the array to give the elements a stable identity:

```jsx 3
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) =>
  <li key={number.toString()}>
    {number}
  </li>
);
```

_(Example with JSX)_

The `diff-dom-streaming` library takes into account the `key` attribute for these cases, if it does not exist, then see if they have `id`.

## Examples

In the repo we have examples for you to try.

### Locally

1. Clone this repository
2. Run `bun run example`

### Stackblitz

You can run the boxes demo with Vanillajs [here](https://stackblitz.com/edit/diff-dom-streaming?file=index.js).

![ezgif-4-1ff18912f4](https://github.com/aralroca/diff-dom-streaming/assets/13313058/f18c01c0-4dfe-473f-8817-fb905adc20c1)

## Acknowledgments

The Diff DOM Algorithm with HTML Streaming is inspired by the [set-dom](https://github.com/DylanPiercey/set-dom) library by [@dylan_piercey](https://twitter.com/dylan_piercey) and a technique for parsing streams pioneered by [@jaffathecake](https://twitter.com/jaffathecake).

## Contributing

See [Contributing Guide](CONTRIBUTING.md) and please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE)

