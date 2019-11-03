---
layout: default
---

# RESTlr - Wrestling REST

Interactive and fun REPL for REST endpoint discovery written for node.js

## Features

* Easy navigation to links
* Discovers `Link` headers and their `rel`
* Discovers `Location` headers in responses
* Optional auto following 201 `Location` HTTP header links
* Pluggable Hypermedia formats (supports SIREN hypermedia format for now only)
* (Partial) support for [GitHub REST API v3](https://developer.github.com/v3/)
  
<video src="assets/restlr.mp4" controls>
  <p>Your browser doesn't support HTML5 video. Here is a <a href="assets/restlr.mp4">link to the video</a> instead.</p>
</video>

## Installation

> `npm i -g restlr`
