/**
 * @file Tree-Sitter Grammar for AutoHotkey v2
 * @author AutoHotkey Discord Server
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
/* eslint-disable */
// @ts-check

module.exports = grammar({
  name: "autohotkey_v2",

  extras: $ => [/[ \t\r\n]+/i],

  word: $ => $.name,

  rules: {
    source_file: $ => optional(seq($._thing, repeat(seq(repeat1($._newline), $._thing)))),
    _thing: $ => choice($.directive, $.hotkey, $.hotstring, $.label, $._statement),

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
        seq(/#Hotstring/i, /EndChars/i, token.immediate(/ /i), alias(repeat1(choice(/[^`\r\n]/i, $.escape)), $.string)),
        seq(/#Hotstring/i, alias(repeat($._hotstring_option), $.string)),
      ),
    _include_directive: $ =>
      choice(
        seq(/#Include/i, /</i, alias(token.immediate(/[\w\\.]+/i), $.string), />/i),
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
        optional(seq(/VarUnset|LocalSameAsGlobal|Unreachable|All/i, optional(seq(/,/i, /MsgBox|StdOut|OutputDebug|Off/i)))),
      ),
    _win_activate_force_directive: $ => /#WinActivateForce/i,
    _directive_string: $ => alias(/[^\r\n"' ][^\r\n"']*|"[^\r\n"]*"/i, $.string),
    _directive_boolean: $ => alias(/true|false|0|1/i, $.boolean),

    hotkey: $ =>
      seq(
        alias(repeat($._hotkey_modifier_prefix), "modifiers"),
        alias($._hotkey_trigger, "trigger"),
        alias(optional($._hotkey_modifier_suffix), "modifiers"),
        token.immediate(/::/i),
      ),
    _hotkey_modifier_prefix: $ => /[<>]?[#!^+]|[*~$]/i,
    _hotkey_trigger: $ => choice($.name, /[^\r\n:]/i),
    _hotkey_modifier_suffix: $ => /up/i,

    hotstring: $ =>
      seq(
        /:/i,
        alias(repeat($._hotstring_option), "options"),
        token.immediate(/:/i),
        alias(choice(/[^\r\n:]+/i, $.escape), "trigger"),
        token.immediate(/::/i),
        alias(choice(/[^\r\n]+/i, $.escape), "replacement"),
      ),
    _hotstring_option: $ => /[*?BCORSTXZ]0?|C1|K-?\d+|P\d+|S[IPE]/i,

    label: $ => seq(alias($.name, "label_name"), token.immediate(/:/i)),

    _statement: $ => seq(choice($.call_statement, $.control_flow_statement), $._newline),

    call_statement: $ => seq(alias($.name, "function_name"), optional($._arguments)),
    _arguments: $ => seq($._argument, repeat(seq(/,/i, optional($._argument)))),
    _argument: $ => $._expression,

    control_flow_statement: $ =>
      choice(
        $.break_statement,
        $.continue_statement,
        $.for_statement,
        $.goto_statement,
        $.if_statement,
        $.loop_statement,
        $.loop_files_statement,
        $.loop_parse_statement,
        $.loop_read_statement,
        $.loop_reg_statement,
        $.return_statement,
        $.switch_statement,
        $.throw_statement,
        $.try_statement,
        $.while_statement,
      ),
    break_statement: $ => alias(/break/i, "keyword"),
    continue_statement: $ => alias(/continue/i, "keyword"),
    for_statement: $ =>
      prec.right(
        seq(
          alias(/for/i, "keyword"),
          choice($._variables, seq(/\(/i, $._variables, /\)/i)),
          alias(/in/i, "keyword"),
          $._expression,
          $.block,
          optional($.until_statement),
        ),
      ),
    goto_statement: $ => seq(alias(/goto/i, "keyword"), choice(alias($.name, "label_name"), seq(/\(/i, $._expression, /\)/i))),
    if_statement: $ =>
      seq(
        alias(/if/i, "keyword"),
        $._expression,
        $.block,
        repeat(seq(alias(/else/i, "keyword"), alias(/if/i, "keyword"), $._expression, $.block)),
        optional(seq(alias(/else/i, "keyword"), $.block)),
      ),
    loop_statement: $ => seq(alias(/loop/i, "keyword"), $._expression, $.block, optional($.until_statement)),
    loop_files_statement: $ =>
      seq(
        alias(/loop/i, "keyword"),
        alias(/files/i, "keyword"),
        $._expression,
        optional(seq(/,/i, $._expression)),
        $.block,
        optional($.until_statement),
      ),
    loop_parse_statement: $ =>
      seq(
        alias(/loop/i, "keyword"),
        alias(/parse/i, "keyword"),
        $._expression,
        optional(seq(/,/i, $._expression)),
        optional(seq(/,/i, $._expression)),
        $.block,
        optional($.until_statement),
      ),
    loop_read_statement: $ =>
      seq(
        alias(/loop/i, "keyword"),
        alias(/read/i, "keyword"),
        $._expression,
        optional(seq(/,/i, $._expression)),
        $.block,
        optional($.until_statement),
      ),
    loop_reg_statement: $ =>
      seq(
        alias(/loop/i, "keyword"),
        alias(/reg/i, "keyword"),
        $._expression,
        optional(seq(/,/i, $._expression)),
        $.block,
        optional($.until_statement),
      ),
    return_statement: $ => seq(alias(/return/, "keyword"), $._expression),
    switch_statement: $ =>
      seq(
        alias(/switch/, "keyword"),
        $._expression,
        /\{/i,
        repeat(
          choice(
            seq(alias(/case/i, "keyword"), $._expression, /:/i, $.block),
            seq(alias(/default/i, "keyword"), /:/i, $.block),
          ),
        ),
        /\}/i,
      ),
    throw_statement: $ => seq(alias(/throw/i, "keyword"), optional($._expression)),
    try_statement: $ =>
      seq(
        alias(/try/i, "keyword"),
        choice($._statement, $.block),
        optional(
          seq(
            alias(/catch/i, "keyword"),
            optional(alias($.name, "class_name")),
            optional(seq(alias(/as/i, "keyword"), $._variable)),
            $.block,
          ),
        ),
        optional(seq(alias(/else/i, "keyword"), $.block)),
        optional(seq(alias(/finally/i, "keyword"), $.block)),
      ),
    while_statement: $ => seq(alias(/while/i, "keyword"), $._expression, $.block, optional($.until_statement)),

    block: $ => choice(seq($._newline, $._statement), seq(/\{/i, repeat($._statement), /\}/i)),

    until_statement: $ => seq(alias(/until/i, "keyword"), $._expression),

    _variables: $ => seq($._variable, repeat(seq(/,/i, optional($._variable)))),
    _variable: $ => alias($.name, "variable_name"),

    _expression: $ => choice($.integer, $.string),

    name: $ => /[a-z_][a-z0-9_]*/i,

    string: $ => /"[^\r\n"]*"/i,
    escape: $ => /`[`;:{nrbtsvaf"']/i,

    integer: $ => choice($._decimal_integer, $._hexadecimal_integer),
    _decimal_integer: $ => /\d+/i,
    _hexadecimal_integer: $ => /0x\d+/i,

    boolean: $ => /true|false/i,

    _newline: $ => /\r?\n/i,
  },
});
