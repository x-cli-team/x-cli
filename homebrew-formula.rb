# Formula for Homebrew distribution
# This will be submitted to homebrew-core later

class XCli < Formula
  desc "Conversational AI CLI tool powered by Grok with Claude Code-level intelligence"
  homepage "https://github.com/x-cli-team/x-cli"
  url "https://registry.npmjs.org/@xagent/x-cli/-/@xagent/x-cli-1.1.41.tgz"
  sha256 "UPDATE_SHA256_HERE"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match "1.1.41", shell_output("#{bin}/xcli --version")
  end
end