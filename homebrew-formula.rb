# Formula for Homebrew distribution
# This will be submitted to homebrew-core later

class GrokCliHurryMode < Formula
  desc "Conversational AI CLI tool powered by Grok with text editor capabilities"
  homepage "https://github.com/hinetapora/grok-cli-hurry-mode"
  url "https://registry.npmjs.org/grok-cli-hurry-mode/-/grok-cli-hurry-mode-1.0.18.tgz"
  sha256 "UPDATE_SHA256_HERE"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match "1.0.18", shell_output("#{bin}/grok --version")
  end
end