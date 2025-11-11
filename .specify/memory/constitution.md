<!--
Sync Impact Report:
Version change: INITIAL → 1.0.0
Modified principles: N/A (initial creation)
Added sections:
  - I. Open Source Security (no private information exposure)
  - II. Test Coverage Mandate
  - III. Documentation Coverage
  - IV. Transparency & Public Accountability
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section compatible
  ✅ spec-template.md - Requirements align with security and testing principles
  ✅ tasks-template.md - Task phases support test-first approach
Follow-up TODOs: None
-->

# GitHub-Switcher Constitution

## Core Principles

### I. Open Source Security

**Rule**: All code, documentation, and configuration files MUST be safe for public distribution. Private information (API keys, passwords, personal data, internal URLs, proprietary secrets) MUST NEVER be committed to the repository.

**Implementation Requirements**:
- All sensitive configuration MUST use environment variables or secure secret management
- Pre-commit hooks MUST scan for common secret patterns (API keys, tokens, passwords)
- Code reviews MUST explicitly verify no private information is present
- `.gitignore` MUST exclude all potential secret-containing files (`.env*`, `secrets/`, `*.key`, `*.pem`, etc.)
- Documentation examples MUST use placeholder values (e.g., `YOUR_API_KEY_HERE`, `example.com`)

**Rationale**: As an open source project, accidental exposure of private information poses security risks and damages trust. Prevention through automation and process is mandatory.

### II. Test Coverage Mandate

**Rule**: All production code MUST have corresponding tests. Minimum coverage targets MUST be enforced:
- Unit test coverage: ≥80% of all business logic
- Integration test coverage: 100% of critical user paths
- Contract test coverage: 100% of public APIs/interfaces

**Implementation Requirements**:
- Test-first development: Tests written and approved BEFORE implementation
- Red-Green-Refactor cycle: Tests MUST fail initially, then pass after implementation
- Coverage reports MUST be generated on every CI run
- PRs that reduce coverage below thresholds MUST be rejected (unless explicitly justified)
- Untestable code MUST be refactored to be testable

**Rationale**: High test coverage ensures reliability, enables confident refactoring, and serves as executable documentation. Tests are the safety net for rapid iteration.

### III. Documentation Coverage

**Rule**: All public interfaces, user-facing features, and setup procedures MUST be documented. Documentation MUST be maintained in sync with code.

**Implementation Requirements**:
- Every public function/class MUST have docstrings/comments explaining purpose, parameters, return values
- Every user story MUST have corresponding end-user documentation
- README.md MUST contain: project purpose, quick start guide, contribution guidelines
- Breaking changes MUST be documented in CHANGELOG.md following semantic versioning
- Setup and installation procedures MUST be tested and verified to work
- Code comments MUST explain "why" not "what" (the code shows what)

**Rationale**: Documentation is critical for open source adoption. Contributors and users need clear guidance. Outdated documentation is worse than no documentation—sync is mandatory.

### IV. Transparency & Public Accountability

**Rule**: Development decisions, architectural choices, and project roadmap MUST be publicly visible and traceable.

**Implementation Requirements**:
- All feature discussions MUST occur in public issues/PRs (no private side channels for technical decisions)
- Architecture Decision Records (ADRs) MUST document significant design choices with rationale
- Public roadmap MUST reflect current priorities and upcoming features
- Code reviews MUST be public and constructive
- License file (open source license) MUST be present and clearly stated
- Contribution guidelines MUST be welcoming and clear

**Rationale**: Transparency builds trust, enables community participation, and ensures accountability. Open source thrives on open communication.

## Quality Gates

**Pre-Commit Gates**:
- Linting MUST pass (no errors, warnings must be justified)
- Secret detection MUST pass (no potential secrets found)
- Local tests MUST pass

**CI/CD Gates**:
- All tests MUST pass (unit, integration, contract)
- Coverage thresholds MUST be met
- Documentation builds MUST succeed
- Security scans MUST pass (dependency vulnerabilities, code scanning)

**Code Review Gates**:
- At least one approval from project maintainer required
- Constitution compliance verified (security, tests, docs)
- Breaking changes explicitly acknowledged and documented

## Development Workflow

**Feature Development**:
1. Create feature specification using `/speckit.specify` command
2. Generate implementation plan using `/speckit.plan` command
3. Review constitution compliance in plan's Constitution Check section
4. Write tests first (test-driven development)
5. Implement feature following plan
6. Update documentation
7. Submit PR with tests, implementation, and docs

**Pre-Release Checklist**:
- [ ] All tests passing
- [ ] Coverage thresholds met
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No secrets in codebase (scan completed)
- [ ] License file present

## Governance

**Constitution Authority**: This constitution supersedes all other development practices. When conflicts arise, constitution principles take precedence.

**Amendment Process**:
1. Proposed amendments MUST be documented with rationale
2. Community discussion period (minimum 7 days for major changes)
3. Approval from project maintainers required
4. Migration plan for existing code if needed
5. Version bump following semantic versioning:
   - MAJOR: Breaking changes to governance or principle removal/redefinition
   - MINOR: New principles added or material expansions
   - PATCH: Clarifications, wording improvements, non-semantic fixes

**Compliance Review**:
- All PRs/reviews MUST verify constitution compliance
- Violations MUST be justified and documented in Complexity Tracking section of implementation plans
- Repeated unjustified violations may result in PR rejection

**Guidance Reference**: For runtime development guidance, see `.specify/templates/agent-file-template.md` (auto-updated from feature plans).

**Version**: 1.0.0 | **Ratified**: 2025-11-11 | **Last Amended**: 2025-11-11
