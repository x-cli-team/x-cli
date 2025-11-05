# Legal and Compliance

Legal information, licenses, and compliance considerations for Grok One-Shot.

## License

### Grok One-Shot License

**Type:** MIT License

**Summary:**
- ✅ Commercial use permitted
- ✅ Modification permitted
- ✅ Distribution permitted
- ✅ Private use permitted
- ⚠️ No warranty provided
- ⚠️ No liability accepted

**Full license:** See `LICENSE` file in repository

**Copyright:** © 2024-2025 X.AI Team / Grok One-Shot Contributors

### Third-Party Licenses

Grok One-Shot depends on open-source software with various licenses:

**Major dependencies:**
- **React/Ink:** MIT License
- **TypeScript:** Apache License 2.0
- **Node.js:** MIT License (various components)

**View all licenses:**
```bash
# From source directory
npm list --depth=0

# Or check package.json and node_modules/*/LICENSE
```

**License compliance:**
- All dependencies use permissive licenses (MIT, Apache, BSD)
- No GPL or copyleft licenses in production dependencies
- Safe for commercial use

## Terms of Use

### Grok One-Shot Usage Terms

**You may:**
- ✅ Use for personal projects
- ✅ Use for commercial projects
- ✅ Modify and customize
- ✅ Distribute modified versions
- ✅ Use in enterprise environments

**You must:**
- ⚠️ Comply with X.AI API Terms of Service
- ⚠️ Manage your own API keys securely
- ⚠️ Not misuse or abuse the service
- ⚠️ Respect rate limits and usage quotas

**You may not:**
- ❌ Claim ownership of Grok One-Shot
- ❌ Remove license or copyright notices
- ❌ Hold developers liable for damages
- ❌ Use for illegal purposes

### X.AI API Terms

**Important:** Using Grok One-Shot requires agreeing to X.AI's Terms of Service.

**Key terms:**
- API key represents agreement with X.AI ToS
- Usage is subject to X.AI's pricing and quotas
- Data transmission governed by X.AI's policies
- Service availability not guaranteed by Grok One-Shot

**Review X.AI Terms:** https://x.ai/terms

## Privacy and Data Protection

### Grok One-Shot Privacy Practices

**What Grok One-Shot collects:**
- ❌ No telemetry or analytics
- ❌ No usage tracking
- ❌ No crash reports sent to developers
- ✅ Only local configuration and session storage

**What you control:**
- ✅ All configuration files (`~/.x-cli/`)
- ✅ All session history
- ✅ When and how to use the tool
- ✅ What data to share with AI

**See also:** [Data Usage Guide](../administration/data-usage.md)

### X.AI Privacy Policy

**Data sent to X.AI:**
- Your prompts and messages
- File contents (when AI reads them)
- Conversation context
- Tool execution results

**X.AI's responsibilities:**
- Data processing per Privacy Policy
- Security and encryption
- Compliance with regulations
- Data retention and deletion

**Review X.AI Privacy Policy:** https://x.ai/privacy

## Compliance Considerations

### GDPR (General Data Protection Regulation)

**Applicability:** EU/EEA users and data subjects

**Key rights:**
- **Right to access:** You can access your local data (`~/.x-cli/`)
- **Right to deletion:** Delete `~/.x-cli/` or contact X.AI for API data
- **Right to portability:** Session files are JSON (portable format)
- **Right to object:** Stop using the service at any time

**Data controller roles:**
- **Local data:** You (the user)
- **API data:** X.AI (data processor)

**Compliance steps:**
1. Review X.AI's GDPR compliance
2. Secure API keys and local data
3. Implement data retention policies
4. Train users on privacy practices

### CCPA (California Consumer Privacy Act)

**Applicability:** California residents

**Key rights:**
- Right to know what data is collected
- Right to deletion
- Right to opt-out of "sales" (not applicable - no sales)
- Right to non-discrimination

**Compliance:**
- Grok One-Shot does not "sell" data
- Local data under your control
- API data governed by X.AI's CCPA compliance

### HIPAA (Health Insurance Portability and Accountability Act)

**Applicability:** Healthcare data in the United States

**⚠️ Important:**
- **Do NOT use Grok One-Shot with PHI (Protected Health Information)** without ensuring X.AI has appropriate BAA (Business Associate Agreement)
- Default configuration is **NOT HIPAA-compliant**
- Consult legal counsel before using with healthcare data

**If required for healthcare:**
1. Verify X.AI offers BAA
2. Sign BAA with X.AI
3. Implement additional access controls
4. Audit and log all usage
5. Conduct risk assessment

### PCI-DSS (Payment Card Industry Data Security Standard)

**Applicability:** Payment card data

**⚠️ Important:**
- **Do NOT use Grok One-Shot with payment card data (PAN, CVV, etc.)**
- Not designed for PCI-DSS compliance
- Use specialized PCI-compliant tools instead

**Why not compliant:**
- Data transmitted to third-party (X.AI)
- No card data encryption/tokenization
- No PCI-DSS certification

### SOC 2 / ISO 27001

**Enterprise compliance frameworks**

**Grok One-Shot considerations:**
- Open-source (can be audited)
- No telemetry (reduces data exposure)
- Local data storage (under your control)
- API security via HTTPS

**For compliance:**
1. Review X.AI's certifications (SOC 2, ISO 27001)
2. Implement access controls for API keys
3. Monitor and log usage
4. Conduct security assessments
5. Document data flows

### FERPA (Family Educational Rights and Privacy Act)

**Applicability:** Educational institutions in the United States

**⚠️ Caution:**
- Review X.AI's FERPA compliance
- May require BAA or Data Processing Agreement
- Limit student data exposure
- Obtain appropriate consents

## Security and Vulnerability Disclosure

### Security Practices

**Grok One-Shot security:**
- Regular dependency updates
- Code reviews via open-source contributions
- No known critical vulnerabilities
- HTTPS for all API communication

**Your responsibilities:**
- Keep Grok One-Shot updated
- Secure API keys
- Use strong file permissions
- Monitor for suspicious activity

### Vulnerability Reporting

**If you discover a security issue:**

1. **Do NOT** publicly disclose yet
2. **Email:** security@x-cli-team.com (or file private GitHub issue)
3. **Include:**
   - Description of vulnerability
   - Steps to reproduce
   - Impact assessment
   - Suggested fix (if available)

**Response timeline:**
- Acknowledgment: 48 hours
- Assessment: 7 days
- Fix: 30 days (depending on severity)
- Public disclosure: After fix is released

**Coordinated disclosure:**
- We will work with you on disclosure timing
- Credit given to reporter (if desired)

## Intellectual Property

### Copyright

**Grok One-Shot:**
- © 2024-2025 X.AI Team / Contributors
- Open-source under MIT License
- Contributions licensed under same terms

**X.AI / Grok:**
- "Grok" is a trademark of X.AI
- "X.AI" is a trademark of X.AI Corp
- Used with permission / under license

**Third-party:**
- All dependencies retain their copyrights
- See individual LICENSE files

### Trademarks

**Usage guidelines:**
- ✅ Refer to "Grok One-Shot" by name
- ✅ Use for accurate description
- ⚠️ Do NOT imply official endorsement without permission
- ❌ Do NOT use X.AI trademarks in your product name

**Questions:** Contact X.AI for trademark usage guidance

### Patents

**Grok One-Shot:**
- No patents held
- MIT License includes implicit patent grant

**X.AI:**
- May hold patents on AI technology
- Using API implies license to use

## Export Control and Sanctions

### Export Control

**U.S. Export Regulations:**
- Grok One-Shot is open-source software
- Generally exempt from export control (publicly available)
- **However:** Check export regulations for your jurisdiction

**Restricted countries:**
- Some countries may be subject to U.S. sanctions
- X.AI API may not be accessible from all countries
- Check X.AI's Terms of Service for restrictions

**Compliance:**
- Do NOT use in violation of export laws
- Do NOT provide to sanctioned entities
- Verify applicable regulations

### Sanctions Compliance

**U.S. Sanctions (OFAC):**
- Comply with OFAC sanctions programs
- Do NOT use if on Specially Designated Nationals (SDN) list
- Do NOT use in embargoed countries

**Other jurisdictions:**
- Comply with EU, UK, UN sanctions
- Verify your jurisdiction's requirements

## Acceptable Use

### Permitted Uses

**You may use Grok One-Shot for:**
- ✅ Software development
- ✅ Code analysis and refactoring
- ✅ Documentation generation
- ✅ Learning and education
- ✅ Research and experimentation
- ✅ Commercial projects

### Prohibited Uses

**You may NOT use Grok One-Shot for:**
- ❌ Illegal activities
- ❌ Harassment or abuse
- ❌ Generating malware (without authorization for security research)
- ❌ Bypassing security controls (without authorization)
- ❌ Violating others' intellectual property
- ❌ Spamming or abuse of X.AI API

### Content Policy

**Generated content:**
- You are responsible for content you generate
- AI-generated code may have bugs or vulnerabilities
- Review and test all AI-generated code
- Do NOT blindly deploy AI suggestions

**Inappropriate content:**
- Do NOT attempt to generate illegal content
- Do NOT use for harassment or hate speech
- X.AI may have content policies - comply with them

## Liability and Warranty

### No Warranty

**Disclaimer:**
> Grok One-Shot is provided "AS IS", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement.

**What this means:**
- No guarantee of correctness
- No guarantee of fitness for purpose
- No guarantee of uptime or availability
- Use at your own risk

### Limitation of Liability

**Disclaimer:**
> In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.

**What this means:**
- Developers not liable for damages
- Developers not liable for data loss
- Developers not liable for financial losses
- Developers not liable for security breaches

**Your responsibility:**
- Test thoroughly before production use
- Backup your data
- Secure your API keys
- Follow security best practices

## Contributing and Licensing

### Contributing Code

**License grant:**
- By contributing, you agree to license under MIT
- You retain copyright to your contributions
- Contributions must not infringe others' rights

**Contributor Agreement:**
- Implied by submitting pull request
- No separate CLA required
- Must have rights to contribute code

### Forking and Redistribution

**You may:**
- ✅ Fork the repository
- ✅ Modify for your needs
- ✅ Redistribute modified versions
- ✅ Use different name for your fork

**You must:**
- ⚠️ Retain original LICENSE file
- ⚠️ Retain copyright notices
- ⚠️ Indicate changes made

**Example:**
```
# Your fork's README
This is a fork of Grok One-Shot (https://github.com/x-cli-team/x-cli)
Modified to add custom features for our team.
Original copyright © 2024-2025 X.AI Team / Contributors
Fork maintained by YourCompany
```

## Contact and Resources

### Legal Questions

**For Grok One-Shot:**
- GitHub Issues: https://github.com/x-cli-team/x-cli/issues
- Email: legal@x-cli-team.com (if available)

**For X.AI / Grok API:**
- X.AI Support: https://x.ai/support
- X.AI Legal: legal@x.ai

### Compliance Resources

**Documentation:**
- [Data Usage Guide](../administration/data-usage.md)
- [Security Best Practices](../configuration/settings.md#security)
- [Deployment Guide](../deployment/overview.md)

**External:**
- X.AI Terms: https://x.ai/terms
- X.AI Privacy: https://x.ai/privacy
- X.AI Compliance: https://x.ai/compliance (check for availability)

## Summary

### Key Takeaways

**License:**
- Grok One-Shot: MIT (permissive, commercial-friendly)
- Use freely with attribution

**Privacy:**
- No telemetry from Grok One-Shot
- API usage subject to X.AI Privacy Policy

**Compliance:**
- Review X.AI's compliance for regulated industries
- **Do NOT** use with PHI or PCI data without verification
- GDPR/CCPA: Local data under your control, API data with X.AI

**Security:**
- Open-source, auditable
- Report vulnerabilities responsibly
- Keep updated and secure API keys

**Liability:**
- No warranty provided
- Developers not liable for damages
- Use responsibly and test thoroughly

---

**Disclaimer:** This document provides general information and is not legal advice. Consult qualified legal counsel for your specific situation.
