/**
 * @file Tree-Sitter Grammar for AutoHotkey v2
 * @author AutoHotkey Discord Server
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "autohotkey_v2",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello",
  },
});
