/**
 * @file Tree-Sitter Grammar for AutoHotkey v2
 * @author AutoHotkey Discord Server
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "autohotkey_v2",

  extras: $ => [/[ \t]+/i],

  word: $ => $.name,

  rules: {
    source_file: $ => repeat(seq(choice($.directive, $.hotkey, $.label), /\r?\n/i)),

    directive: $ =>
      choice(
        $._clipboard_timeout_directive,
        $._dll_load_directive,
        $._error_std_out_directive,
        $._hot_if_directive,
        $._hot_if_timeout_directive,
        $._hotstring_directive,
        $._include_directive,
        $._include_again_directive,
        $._input_level_directive,
        $._max_threads_directive,
        $._max_threads_buffer_directive,
        $._max_threads_per_hotkey_directive,
        $._no_tray_icon_directive,
        $._requires_directive,
        $._single_instance_directive,
        $._suspend_exempt_directive,
        $._use_hook_directive,
        $._warn_directive,
        $._win_activate_force_directive,
      ),
    _clipboard_timeout_directive: $ => seq(/#ClipboardTimeout/i, $.integer),
    _dll_load_directive: $ => seq(/#DllLoad/i, optional($._directive_string)),
    _error_std_out_directive: $ => seq(/#ErrorStdOut/i, optional($._directive_string)),
    _hot_if_directive: $ => seq(/#HotIf/i, optional($._expression)),
    _hot_if_timeout_directive: $ => seq(/#HotIfTimeout/i, $.integer),
    _hotstring_directive: $ =>
      choice(
        seq(/#Hotstring/i, /NoMouse/i),
        // TODO: matching $.escape here breaks everything
        seq(/#Hotstring/i, /EndChars/i, token.immediate(" "), alias(repeat1(choice(/[^`\r\n]/i, $.escape)), $.string)),
        seq(/#Hotstring/i, alias(repeat($._hotstring_option), $.string)),
      ),
    _include_directive: $ =>
      choice(
        seq(/#Include/i, "<", alias(token.immediate(/[\w\\.]+/i), $.string), ">"),
        seq(/#Include/i, alias(/[^\r\n"' <>][^\r\n"'<>]*|"[^\r\n"]*"/i, $.string)),
      ),
    _include_again_directive: $ => seq(/#IncludeAgain/i, alias(/[^\r\n"' <>][^\r\n"'<>]*|"[^\r\n"]*"/i, $.string)),
    _input_level_directive: $ => seq(/#InputLevel/i, optional($.integer)),
    _max_threads_directive: $ => seq(/#MaxThreads/i, $.integer),
    _max_threads_buffer_directive: $ => seq(/#MaxThreadsBuffer/i, optional($._directive_boolean)),
    _max_threads_per_hotkey_directive: $ => seq(/#MaxThreadsPerHotkey/i, $.integer),
    _no_tray_icon_directive: $ => /#NoTrayIcon/i,
    _requires_directive: $ => seq(/#Requires/i, optional($._directive_string)),
    _single_instance_directive: $ => seq(/#SingleInstance/i, /Force|Ignore|Prompt|Off/i),
    _suspend_exempt_directive: $ => seq(/#SuspendExempt/i, optional($._directive_boolean)),
    _use_hook_directive: $ => seq(/#UseHook/i, optional($._directive_boolean)),
    _warn_directive: $ =>
      seq(
        /#Warn/i,
        optional(seq(/VarUnset|LocalSameAsGlobal|Unreachable|All/i, optional(seq(",", /MsgBox|StdOut|OutputDebug|Off/i)))),
      ),
    _win_activate_force_directive: $ => /#WinActivateForce/i,
    _directive_string: $ => alias(/[^\r\n"' ][^\r\n"']*|"[^\r\n"]*"/i, $.string),
    _directive_boolean: $ => alias(/true|false|0|1/i, $.boolean),

    hotkey: $ =>
      seq(
        alias(repeat($._hotkey_modifier_prefix), "modifiers"),
        alias($._hotkey_trigger, "trigger"),
        alias(optional($._hotkey_modifier_suffix), "modifiers"),
        token.immediate("::"),
      ),
    _hotkey_modifier_prefix: $ => /[<>]?[#!^+]|[*~$]/i,
    _hotkey_trigger: $ => choice($.name, /[^\r\n:]/i),
    _hotkey_modifier_suffix: $ => /up/i,

    label: $ => seq($.name, token.immediate(":")),

    _hotstring_option: $ => /[*?BCORSTXZ]0?|C1|P\d+|S[IPE]/i,

    _expression: $ => choice($.integer, $.string),

    name: $ => /[a-z_][a-z0-9_]*/i,

    string: $ => /"[^\r\n]"/i,
    escape: $ => /`[`;:{nrbtsvaf"']/i,

    integer: $ => choice($._decimal_integer, $._hexadecimal_integer),
    _decimal_integer: $ => /\d+/i,
    _hexadecimal_integer: $ => /0x\d+/i,

    boolean: $ => /true|false/i,
  },
});
