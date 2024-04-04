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

### JSR

```sh
bunx jsr add @aralroca/diff-dom-streaming
```

Then import it:

```ts
import diff from "@aralroca/diff-dom-streaming";
```

### Npm

```sh
bun install diff-dom-streaming
```

Then import it:

```ts
import diff from "diff-dom-streaming";
```

## Using it

```ts
const res = await fetch(/* some url */);

// Diff between the current document and the reader:
await diff(document, res.body.getReader());
```
