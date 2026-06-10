---
name: SSOT file location and scope
description: Where the project SSOT lives and what it governs — check this before any cross-cutting change.
---

## Rule
Project SSOT lives at `/SSOT.md` in the workspace root.

**Why:** User requires a single source of truth in Markdown. Code must follow SSOT. Platforms sync with SSOT, not each other.

## What SSOT covers
- Pages & flows (onboarding, login, OTP, forgot password, success)
- Validation rules (email regex, password complexity)
- Business rules (admin guard, sign-in guard, OTP session logic)
- API contracts (all auth endpoints)
- Design tokens (React inline vars + Flutter AppColors mapping)
- Modal/sheet hybrid system (BottomSheet `visible` → CSS transitions, 20ms delay pattern)
- Shared React components and hooks (`lib/shared.tsx` exports)
- Cross-platform sync rules and deliberate platform differences
- Reuse-first rules, security rules, performance rules, dead code policy

## How to apply
- Before any new feature: check SSOT first
- After any change to shared behavior: update SSOT
- New business rule / validation / API endpoint: add to SSOT before coding
- SSOT must stay short and structured — no prose, prefer tables and code blocks
