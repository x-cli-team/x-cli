# 🔄 Task: A/B Verification for Model Switch (10% Legacy Traffic)

**Objective:**  
Run a 48-hour A/B test after the model switch, routing 10% of requests to the legacy `grok-code-fast-1` model to benchmark token usage, latency, output quality, and error rates against the new `grok-4-fast-non-reasoning` default.

---

## 🧩 Steps

1. **A/B Router Implementation**
   - In model selection logic (e.g., `/backend/lib/modelRouter.ts`):
     ```ts
     export const pickModel = (opts: {deep?: boolean; retries?: number; ctxTokens?: number}) => {
       const isLegacyTest = Math.random() < 0.10; // 10% chance
       
       if (isLegacyTest) {
         return 'grok-code-fast-1'; // Legacy model for A/B
       }
       
       return opts.deep || (opts.retries ?? 0) > 0 || (opts.ctxTokens ?? 0) > 150_000
         ? process.env.XCLI_MODEL_REASONING!
         : process.env.XCLI_MODEL_DEFAULT!;
     };
     ```
   - Add logging for A/B variant (e.g., metadata: {ab_variant: 'legacy' | 'new'}).

2. **Logging Enhancements**
   - Ensure `logs_llm` table captures:
     - `ab_variant`: 'legacy' | 'new'
     - `output_quality_score`: (if possible, auto-score or manual flag)
     - Error codes for failures.

3. **Test Duration & Monitoring**
   - Enable A/B for 48 hours (hardcode or via env: XCLI_AB_ENABLED=true).
   - After 48h, query:
     ```sql
     select 
       ab_variant,
       count(*) as requests,
       avg(total_tokens) as avg_tokens,
       avg(latency_ms) as avg_latency,
       sum(case when error_code is not null then 1 else 0 end) * 1.0 / count(*) as error_rate
     from logs_llm
     where ts > now() - interval '2 days'
     group by ab_variant;
     ```
   - Compare metrics: tokens, latency, errors.

4. **Quality Sampling**
   - Randomly sample 20 outputs from each variant.
   - Manually review for fidelity (or add auto-metric like output length consistency).

5. **Rollback & Disable**
   - If legacy performs better (unlikely), add env toggle to revert.
   - After test, remove A/B logic and set to 100% new model.

---

## ✅ Acceptance Criteria
- 10% traffic routes to legacy model during test.
- Logs capture sufficient data for comparison.
- Post-test analysis shows expected improvements (lower tokens, similar quality).
- No production disruptions from A/B routing.

---

## 🧾 Notes
- Monitor for any quality regressions in the 10% legacy bucket.
- If differences are negligible, proceed to full rollout.
- Test period: 48 hours post-switch.

Owner: Build Agent
Status: Pending execution
Date: 2025-10-31
Expected duration: 48 hours (monitoring) + 30 min setup

