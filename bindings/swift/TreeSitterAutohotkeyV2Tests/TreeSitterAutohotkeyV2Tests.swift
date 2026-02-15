import XCTest
import SwiftTreeSitter
import TreeSitterAutohotkeyV2

final class TreeSitterAutohotkeyV2Tests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_autohotkey_v2())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading AutoHotkey v2 grammar")
    }
}
