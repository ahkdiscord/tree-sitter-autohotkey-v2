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

  precedences: $ => [
    // operators:
    [
      "parenthesis",
      "dereference",
      "member_access",
      "function_call",
      "item_access",
      "increment_decrement",
      "exponentiation",
      "unary",
      "multiplication",
      "addition",
      "shift",
      "bitwise_and",
      "bitwise_xor",
      "bitwise_or",
      "concatenation",
      "regex_match",
      "comparison",
      "equality",
      "containment",
      "not",
      "and",
      "or",
      "or_maybe",
      "ternary",
      "assignment",
      "comma",
    ],
  ],

  conflicts: $ => [
    [$.increment, $.increment],
    [$.decrement, $.decrement],
    [$.increment, $.decrement],
  ],

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

    _statement: $ => choice($.call_statement, $.control_flow_statement),

    call_statement: $ => prec.right(seq(alias($.name, "function_name"), optional($._arguments))),
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
    break_statement: $ => kw(/break/i),
    continue_statement: $ => kw(/continue/i),
    for_statement: $ =>
      prec.right(
        seq(
          kw(/for/i),
          choice($._variables, seq(/\(/i, $._variables, /\)/i)),
          kw(/in/i),
          $._expression,
          $.block,
          optional(choice($.until_statement, $.else_branch)),
        ),
      ),
    goto_statement: $ => seq(kw(/goto/i), choice(alias($.name, "label_name"), seq(/\(/i, $._expression, /\)/i))),
    if_statement: $ =>
      prec.right(
        seq(
          kw(/if/i),
          $._expression,
          $.block,
          repeat(seq(kw(/else/i), kw(/if/i), $._expression, $.block)),
          optional(seq(kw(/else/i), $.block)),
        ),
      ),
    loop_statement: $ =>
      prec.right(seq(kw(/loop/i), optional($._expression), $.block, optional(choice($.until_statement, $.else_branch)))),
    loop_files_statement: $ =>
      prec.right(
        seq(
          kw(/loop/i),
          kw(/files/i),
          $._expression,
          optional(seq(/,/i, $._expression)),
          $.block,
          optional(choice($.until_statement, $.else_branch)),
        ),
      ),
    loop_parse_statement: $ =>
      prec.right(
        seq(
          kw(/loop/i),
          kw(/parse/i),
          $._expression,
          optional(seq(/,/i, $._expression)),
          optional(seq(/,/i, $._expression)),
          $.block,
          optional(choice($.until_statement, $.else_branch)),
        ),
      ),
    loop_read_statement: $ =>
      prec.right(
        seq(
          kw(/loop/i),
          kw(/read/i),
          $._expression,
          optional(seq(/,/i, $._expression)),
          $.block,
          optional(choice($.until_statement, $.else_branch)),
        ),
      ),
    loop_reg_statement: $ =>
      prec.right(
        seq(
          kw(/loop/i),
          kw(/reg/i),
          $._expression,
          optional(seq(/,/i, $._expression)),
          $.block,
          optional(choice($.until_statement, $.else_branch)),
        ),
      ),
    return_statement: $ => seq(kw(/return/), $._expression),
    switch_statement: $ =>
      seq(
        kw(/switch/i),
        $._expression,
        /\{/i,
        repeat(choice(seq(kw(/case/i), $._expression, /:/i, $.block), seq(kw(/default/i), /:/i, $.block))),
        /\}/i,
      ),
    throw_statement: $ => prec.right(seq(kw(/throw/i), optional($._expression))),
    try_statement: $ =>
      prec.right(
        seq(
          kw(/try/i),
          choice($._statement, $.block),
          optional(seq(kw(/catch/i), optional(alias($.name, "class_name")), optional(seq(kw(/as/i), $._variable)), $.block)),
          optional(seq(kw(/else/i), $.block)),
          optional(seq(kw(/finally/i), $.block)),
        ),
      ),
    while_statement: $ => prec.right(seq(kw(/while/i), $._expression, $.block, optional($.else_branch))),

    block: $ => choice(seq($._newline, $._statement), seq(/\{/i, repeat($._statement), /\}/i)),

    until_statement: $ => seq(kw(/until/i), $._expression),
    else_branch: $ => seq(kw(/else/i), $.block),

    _variables: $ => seq($._variable, repeat(seq(/,/i, optional($._variable)))),
    _variable: $ => alias($.name, "variable_name"),

    _expression: $ => choice($._value, $._operation),

    _value: $ => choice($.boolean, $.integer, $.float, $.string, $._variable),

    _operation: $ =>
      choice(
        $.parenthesis,
        $.dereference,
        $.member_access,
        $.function_call,
        $.item_access,
        $.increment,
        $.decrement,
        $.power,
        $.unary_plus,
        $.unary_minus,
        $.logical_not,
        $.bitwise_not,
        $.multiply,
        $.divide,
        $.integer_divide,
        $.add,
        $.subtract,
        $.bit_shift_left,
        $.arithmetic_bit_shift_right,
        $.logical_bit_shift_right,
        $.bitwise_and,
        $.bitwise_xor,
        $.bitwise_or,
        $.explicit_concatenation,
        $.implicit_concatenation,
        $.regex_match,
        $.less_than,
        $.greater_than,
        $.less_than_or_equal,
        $.greater_than_or_equal,
        $.equal,
        $.not_equal,
        $.case_sensitive_equal,
        $.case_senstivite_not_equal,
        $.is,
        $.in,
        $.contains,
        $.word_not,
        $.and,
        $.or,
        $.or_maybe,
        $.ternary,
        $.assignment,
      ),

    parenthesis: $ => prec("parenthesis", seq(/\(/i, $._expression, /\)/i)),
    dereference: $ => prec("dereference", seq(/%/i, $._expression, /%/i)),
    member_access: $ =>
      prec("member_access", seq($._expression, token.immediate(/\./i), choice($.name, seq(/%/i, $._expression, /%/i)))),
    function_call: $ => prec("function_call", seq($._expression, /\(/i, optional($._arguments), /\)/i)),
    item_access: $ => prec("item_access", seq($._expression, token.immediate(/\[/i), $._expression, /\]/i)),
    increment: $ => prec("increment_decrement", choice(seq($._expression, /\+\+/i), seq(/\+\+/i, $._expression))),
    decrement: $ => prec("increment_decrement", choice(seq($._expression, /--/i), seq(/--/i, $._expression))),
    power: $ => prec.right("exponentiation", seq($._expression, /\*\*/i, $._expression)),
    unary_plus: $ => prec("unary", seq(/\+/i, $._expression)),
    unary_minus: $ => prec("unary", seq(/\-/i, $._expression)),
    logical_not: $ => prec("unary", seq(/!/i, $._expression)),
    bitwise_not: $ => prec("unary", seq(/~/i, $._expression)),
    multiply: $ => prec.left("multiplication", seq($._expression, /\*/i, $._expression)),
    divide: $ => prec.left("multiplication", seq($._expression, /\//i, $._expression)),
    integer_divide: $ => prec.left("multiplication", seq($._expression, /\/\//i, $._expression)),
    add: $ => prec.left("addition", seq($._expression, /\+/i, $._expression)),
    subtract: $ => prec.left("addition", seq($._expression, /-/i, $._expression)),
    bit_shift_left: $ => prec.left("shift", seq($._expression, /<</i, $._expression)),
    arithmetic_bit_shift_right: $ => prec.left("shift", seq($._expression, />>/i, $._expression)),
    logical_bit_shift_right: $ => prec.left("shift", seq($._expression, />>>/i, $._expression)),
    bitwise_and: $ => prec.left("bitwise_and", seq($._expression, /&/i, $._expression)),
    bitwise_xor: $ => prec.left("bitwise_xor", seq($._expression, /\^/i, $._expression)),
    bitwise_or: $ => prec.left("bitwise_or", seq($._expression, /\|/i, $._expression)),
    explicit_concatenation: $ => prec.left("concatenation", seq($._expression, $._space, /\./i, $._space, $._expression)),
    implicit_concatenation: $ => prec.left("concatenation", seq($._expression, $._space, $._expression)),
    regex_match: $ => prec.left("regex_match", seq($._expression, /~=/i, $._expression)),
    less_than: $ => prec.left("comparison", seq($._expression, /</i, $._expression)),
    greater_than: $ => prec.left("comparison", seq($._expression, />/i, $._expression)),
    less_than_or_equal: $ => prec.left("comparison", seq($._expression, /<=/i, $._expression)),
    greater_than_or_equal: $ => prec.left("comparison", seq($._expression, />=/i, $._expression)),
    equal: $ => prec.left("equality", seq($._expression, /=/i, $._expression)),
    not_equal: $ => prec.left("equality", seq($._expression, /!=/i, $._expression)),
    case_sensitive_equal: $ => prec.left("equality", seq($._expression, /==/i, $._expression)),
    case_senstivite_not_equal: $ => prec.left("equality", seq($._expression, /!==/i, $._expression)),
    is: $ => prec.left("containment", seq($._expression, /is/i, $._expression)),
    in: $ => prec.left("containment", seq($._expression, /in/i, $._expression)),
    contains: $ => prec.left("containment", seq($._expression, /contains/i, $._expression)),
    word_not: $ => prec.left("not", seq($._expression, /not/i, $._expression)),
    and: $ => prec.left("and", seq($._expression, /and|&&/i, $._expression)),
    or: $ => prec.left("or", seq($._expression, /or|\|\|/i, $._expression)),
    or_maybe: $ => prec.left("or_maybe", seq($._expression, /\?\?/i, $._expression)),
    ternary: $ => prec.left("ternary", seq($._expression, /\?/i, $._expression, /:/i, $._expression)),
    assignment: $ => prec.right("assignment", seq($._expression, /[-:+*\/.|&^]=|\/\/=|>>=|<<=|>>>=/i, $._expression)),

    string: $ => /"[^\r\n"]*"/i,
    escape: $ => /`[`;:{nrbtsvaf"']/i,

    integer: $ => choice($._decimal_integer, $._hexadecimal_integer),
    _decimal_integer: $ => /\d+/i,
    _hexadecimal_integer: $ => /0x\d+/i,

    float: $ => choice($._simple_float, $._scientific_float),
    _simple_float: $ => choice(/[0-9]+\.[0-9]*/i, /\.[0-9]+/i),
    _scientific_float: $ => choice(/[0-9]+\.[0-9]*e[+-]?[0-9]+/i, /\.?[0-9]+e[+-]?[0-9]+/i),

    boolean: $ => /true|false/i,

    name: $ => /[a-z_][a-z0-9_]*/i,

    _newline: $ => /\r?\n/i,
    _space: $ => /\s/i,
  },
});

/**
 * @param {RuleOrLiteral} rule
 */
function kw(rule) {
  return alias(rule, "keyword");
}
