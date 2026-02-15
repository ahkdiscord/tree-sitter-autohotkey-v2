package tree_sitter_autohotkey_v2_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_autohotkey_v2 "github.com/ahkdiscord/tree-sitter-autohotkey-v2/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_autohotkey_v2.Language())
	if language == nil {
		t.Errorf("Error loading AutoHotkey v2 grammar")
	}
}
