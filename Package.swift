// swift-tools-version:5.3

import Foundation
import PackageDescription

var sources = ["src/parser.c"]
if FileManager.default.fileExists(atPath: "src/scanner.c") {
    sources.append("src/scanner.c")
}

let package = Package(
    name: "TreeSitterAutohotkeyV2",
    products: [
        .library(name: "TreeSitterAutohotkeyV2", targets: ["TreeSitterAutohotkeyV2"]),
    ],
    dependencies: [
        .package(name: "SwiftTreeSitter", url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.9.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterAutohotkeyV2",
            dependencies: [],
            path: ".",
            sources: sources,
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterAutohotkeyV2Tests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterAutohotkeyV2",
            ],
            path: "bindings/swift/TreeSitterAutohotkeyV2Tests"
        )
    ],
    cLanguageStandard: .c11
)
