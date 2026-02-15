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
    source_file: $ => repeat(seq(choice($.directive), /\r?\n/)),

    directive: $ => choice($._clipboard_timeout_directive),
    _clipboard_timeout_directive: $ => seq(/#ClipboardTimeout/i, $.integer),

    integer: $ => choice($._decimal_integer, $._hexadecimal_integer),
    _decimal_integer: $ => /\d+/i,
    _hexadecimal_integer: $ => /0x\d+/i,
  },
});
