<p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/aralroca/diff-dom-streaming/logo-light.svg" width="128">
      <img src="https://github.com/aralroca/diff-dom-streaming/logo.svg" width="128">
    </picture>
    <h1 align="center">Diff DOM Streaming</h1>
</p>

The Diff DOM (Document Object Model) algorithm is used to compare two versions of the DOM, such as before and after an update on a web page. It aims to efficiently identify the changes between both DOMs, minimizing the number of manipulations required to update the user interface.

The Diff DOM Streaming library extends the traditional Diff DOM algorithm by introducing support for comparing a DOM node with a streaming reader. This enables the library to process the changes incrementally as they occur during the diff process.
