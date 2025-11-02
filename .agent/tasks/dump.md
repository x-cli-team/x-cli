

🧠 Prompt: Switch Default Model from grok-code-fast-1 → grok-4-fast-non-reasoning

# 🔄 Task: Switch Default Model to `grok-4-fast-non-reasoning`

**Objective:**  
Migrate all default LLM calls across the x-cli codebase from the legacy `grok-code-fast-1` model to the newer, cheaper, and higher-context `grok-4-fast-non-reasoning`.  
Preserve reasoning fallback logic and update environment variables accordingly.

---

## 🧩 Steps

1. **Environment Updates**
   - In `.env` and `.env.local`:
     ```bash
     XCLI_MODEL_DEFAULT=grok-4-fast-non-reasoning
     XCLI_MODEL_REASONING=grok-4-fast-reasoning
     XCLI_MODEL_PREMIUM=grok-4-0709
     ```
   - Remove or comment out any `GROK_MODEL=grok-code-fast-1` references.

2. **Codebase Search & Replace**
   - Find:  
     ```bash
     grep -r "grok-code-fast-1" .
     ```
   - Replace with:
     ```bash
     grok-4-fast-non-reasoning
     ```
   - Skip replacement in historical sprint docs, logs, or archived references.

3. **Router Verification**
   - Confirm `/backend/lib/modelRouter.ts` (or equivalent) contains:
     ```ts
     export const pickModel = (opts: {deep?: boolean; retries?: number; ctxTokens?: number}) =>
       opts.deep || (opts.retries ?? 0) > 0 || (opts.ctxTokens ?? 0) > 150_000
         ? process.env.XCLI_MODEL_REASONING!
         : process.env.XCLI_MODEL_DEFAULT!;
     ```

4. **Smoke Tests**
   - Run regression checks:
     - Code generation (multi-file)
     - Bug-fix prompt
     - Refactor prompt
     - Diff summarization
   - Log results + total token use via your new `logs_llm` table.

5. **Cost & Quality Monitoring**
   - After 48h, query:
     ```sql
     select model, avg(total_tokens) as avg_total, avg(latency_ms) as avg_latency
     from logs_llm
     where ts > now() - interval '2 days'
     group by model;
     ```
   - Confirm drop in `$ / request` and lower truncation rates.

---

## ✅ Acceptance Criteria
- All default model calls now route to `grok-4-fast-non-reasoning`.
- Reasoning fallback (deep tasks) uses `grok-4-fast-reasoning`.
- Historical docs remain unchanged.
- Logs confirm reduced token burn per request and stable output fidelity.

---

## 🧾 Notes
- This change reduces output cost by ~65% and expands available context 8×.
- If any CI/test route fails due to different output tokenization, re-run with:
  ```bash
  XCLI_MODEL_DEFAULT=grok-4-fast-reasoning

for one test cycle only.

⸻

Owner: Build Agent
Status: Pending execution
Date: 2025-10-31
Expected duration: 30–45 min

---

