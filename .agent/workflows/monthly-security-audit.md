---
description: Monthly security audit workflow for all projects (LovIA, Geobooker, future apps)
---

# 🔒 Monthly Security Audit

// turbo-all

Run this audit on the **first week of each month** for every active project.

## 1. Dependency Vulnerabilities

```bash
npm audit
```

Review output for HIGH and CRITICAL vulnerabilities. Fix with:

```bash
npm audit fix
```

For breaking changes, manually update in `package.json` and test.

## 2. Environment Variables Check

Verify `.gitignore` includes:
```
.env*
!.env.example
```

Run this to confirm no secrets are tracked:
```bash
git ls-files | findstr /i ".env"
```

Only `.env.example` should appear.

## 3. Authentication & Authorization Audit

Check these files manually:
- **Auth store**: Verify Supabase session handling, no tokens in localStorage
- **ProtectedRoute**: Ensure all protected pages require auth
- **Admin layout**: Verify RBAC guard (`app_metadata.role === 'admin'`)
- **Subscription store**: Ensure tier checks are server-side (not client-only)

## 4. Data Privacy & Storage

- [ ] No PII in localStorage (only session tokens managed by Supabase SDK)
- [ ] Evaluation results stored server-side (not just localStorage)
- [ ] No sensitive data in console.log statements
- [ ] Images/documents use Supabase Storage with RLS

Search for potential leaks:
```bash
npx grep-search "console.log" --include="*.ts" --include="*.tsx" src/
```

## 5. XSS & Injection Prevention

Search for dangerous patterns:
```bash
npx grep-search "dangerouslySetInnerHTML" src/
npx grep-search "innerHTML" src/
npx grep-search "eval(" src/
npx grep-search "document.write" src/
```

All results should return **0 matches**. If any exist, refactor to use React's safe rendering.

## 6. API & Network Security

- [ ] All API calls use HTTPS
- [ ] Supabase RLS policies reviewed and tested
- [ ] No API keys hardcoded (only via `import.meta.env.VITE_*`)
- [ ] CORS properly configured on backend
- [ ] Rate limiting enabled on auth endpoints

## 7. Build & Bundle Security

```bash
npx vite build
```

- [ ] Build succeeds without errors
- [ ] No warnings about exposed source maps in production
- [ ] Bundle size within acceptable limits

## 8. Legal Compliance

- [ ] Privacy policy is up-to-date
- [ ] LFPDPPP (Mexico) compliance verified
- [ ] GDPR (EU) compliance verified (if serving EU users)
- [ ] Cookie consent banner functional
- [ ] Data deletion flow accessible to users

## 9. Document Findings

Create or update a `SECURITY_LOG.md` in the project root with:
- Date of audit
- Vulnerabilities found
- Fixes applied
- Items pending for next audit

## 10. Report

After completing the audit, create a summary with:
- Total vulnerabilities found (by severity)
- Fixes applied
- Outstanding items requiring attention
- Recommendations for next month
