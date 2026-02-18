# Contributing to Bitchat

Thanks for your interest in contributing! This guide covers the essentials for getting started.

## Prerequisites

- **Node.js** 18+ and npm
- **Clarinet** ([install guide](https://docs.hiro.so/clarinet/getting-started))
- A Stacks wallet (e.g. [Leather](https://leather.io)) for manual testing

## Local setup

```bash
# Clone the repo
git clone https://github.com/Yusufolosun/bitchat.git
cd bitchat

# Install root dependencies (Clarinet SDK tests)
npm install

# Install frontend dependencies
cd frontend && npm install
```

## Running things

| Command | What it does |
|---------|-------------|
| `clarinet check` | Validate Clarity contract syntax |
| `npm test` | Run Clarinet unit tests (vitest) |
| `cd frontend && npm run dev` | Start the frontend dev server |
| `cd frontend && npm run build` | Production build |

## Project structure

```
contracts/       Clarity smart contracts
tests/           Clarinet SDK unit tests (vitest)
frontend/
  src/
    components/  React components
    hooks/       Custom React hooks
    utils/       Constants, contract calls, helpers
deployments/     Clarinet deployment plans
docs/            Documentation
settings/        Clarinet network configs
```

## Branch naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<short-description>` | `feat/message-search` |
| Bug fix | `fix/<short-description>` | `fix/wallet-disconnect` |
| Docs | `docs/<short-description>` | `docs/api-examples` |
| Chore | `chore/<short-description>` | `chore/update-deps` |

## Making a pull request

1. Create a branch from `main`
2. Make your changes with clear, focused commits
3. Run `clarinet check` and `npm test` before pushing
4. Open a PR against `main` with:
   - A short summary of what changed and why
   - Steps to manually verify, if applicable
   - Reference to the related issue (e.g. `Closes #42`)
5. Wait for CI to pass

## Code style

- The frontend uses ESLint and Prettier — run `npm run lint` in `frontend/`
- Clarity contracts follow standard indentation (2 spaces)
- Keep functions small and well-commented

## Reporting issues

If you find a bug or have a feature idea, open an issue with:
- Steps to reproduce (for bugs)
- Expected vs actual behaviour
- Screenshots if relevant
