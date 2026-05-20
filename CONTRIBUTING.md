# Contributing to PAYAPRESS-WEBAPP

Thank you for your interest in contributing! This document outlines the process for contributing to this project.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check that the bug hasn't already been reported in [Issues](https://github.com/PAYAPRESS-prog/payapresswebapp/issues)
2. Open a new issue using the **Bug Report** template
3. Include steps to reproduce, expected vs actual behavior, and your environment

### Suggesting Features

1. Open a new issue using the **Feature Request** template
2. Describe the problem you're solving and your proposed solution

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the coding standards below
4. Write or update tests as needed
5. Update documentation if needed
6. Submit a pull request against the `main` branch

## Coding Standards

### Frontend (TypeScript/React)

- Use TypeScript for all new files
- Follow the existing component structure in `frontend/src/components/`
- Use functional components and React hooks
- Format with Prettier (`npm run format`)
- Lint with ESLint (`npm run lint`)

### WordPress Plugin (PHP)

- Follow [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)
- Prefix all functions and classes with `payapress_`
- Sanitize all input and escape all output
- Use WordPress nonces for form security

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/payapresswebapp.git
cd payapresswebapp

# Install frontend dependencies
cd frontend && npm install

# Run the dev server
npm run dev
```

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/short-description` | `feature/post-listing` |
| Bug fix | `fix/short-description` | `fix/api-timeout` |
| Documentation | `docs/short-description` | `docs/plugin-setup` |

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add post listing component
fix: correct API base URL handling
docs: update plugin installation steps
chore: upgrade Next.js to 15
```

## Questions?

Open a [Discussion](https://github.com/PAYAPRESS-prog/payapresswebapp/discussions) or an Issue.
