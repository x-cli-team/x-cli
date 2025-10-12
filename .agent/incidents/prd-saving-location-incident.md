# Incident: Incorrect PRD Saving Location Response

## Date
2023-10-12

## Description
When asked "if asked to write a new prd where will you save it?", the agent responded with saving in the project root (e.g., PRD.md) or docs/ folder, which was incorrect per established conventions.

## Root Cause
The agent failed to check the .agent folder first for documentation workflow guidelines, despite custom instructions mandating this check at session start. This led to using incorrect assumptions instead of referencing the SOP in .agent/sop/documentation-workflow.md and existing PRD examples in .agent/tasks/.

## Impact
- Provided incorrect guidance to user
- Potential for inconsistent documentation practices
- User had to follow up to correct the information

## Resolution
- Immediately corrected the response by checking .agent folder
- Confirmed PRDs should be saved in .agent/tasks/ as Markdown files
- Ensured awareness of .agent context for future sessions

## Prevention Measures
1. **Enhanced Session Initialization**: Automatically load key .agent files (README.md, documentation-workflow.md) at session start to prime context
2. **Explicit PRD Guidelines**: Add a dedicated section in .agent/sop/documentation-workflow.md specifying PRD saving locations and formats
3. **Validation Checks**: Before responding to file creation/location queries, cross-reference against .agent documentation
4. **Incident Logging**: Document all such incidents in .agent/incidents/ for continuous improvement

## Lessons Learned
- Always prioritize .agent folder checks over assumptions
- Maintain strict adherence to documented workflows
- Use incidents folder to track and prevent recurrence of similar issues

## Related Files
- .agent/README.md
- .agent/sop/documentation-workflow.md
- .agent/tasks/example-prd.md
- .agent/tasks/prd-tool-inventory.md