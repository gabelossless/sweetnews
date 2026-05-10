# GitHub Deployment & CI/CD Plan - Sweet News

This document outlines the strategy for moving the Sweet News codebase to GitHub and establishing a production-grade deployment pipeline.

## 1. Repository Initialization
- [x] **Local Git Init**: Initialize local repository and commit the base "Triad" architecture.
- [x] **Data Sanitization**: Ensure all API keys are environment-variable driven and user inputs are sanitized.
- [ ] **GitHub Remote**: Create a private GitHub repository and link it as `origin`.
- [ ] **Branching Strategy**: Implement Trunk-Based Development with short-lived feature branches and PR requirements.

## 2. Infrastructure Setup (Vercel)
- [ ] **Project Link**: Connect the GitHub repository to Vercel for automated deployments.
- [ ] **Build Settings**:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] **Environment Variables**: Populate Vercel with production Firebase keys:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - etc.

## 3. CI/CD & Quality Gates
- [ ] **GitHub Actions**:
  - **Type Check**: Run `tsc --noEmit` on every PR.
  - **Linting**: Ensure code adheres to strict TypeScript/ESLint standards.
  - **Preview Deploys**: Automated Vercel previews for every pull request.
- [ ] **Main Protection**: Block direct pushes to `master`/`main`. Require status checks to pass.

## 4. PWA Production Readiness
- [ ] **Service Worker Optimization**: Ensure `sw.js` is correctly bundled and served for offline capabilities.
- [ ] **Manifest Verification**: Finalize icons and splash screens for various mobile OS platforms.

---
*Last Updated: 2026-05-10*
