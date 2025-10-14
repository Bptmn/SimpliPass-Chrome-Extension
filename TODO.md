# SimpliPass Chrome Extension - TODO

- Est-ce que les tests lorsqu'un service est mocked sont utiles et fiable ? Authentication, adapters... ? Il existe des méthodes pour tester ça? Ou il vaut mieux que ce soit via playwright pour une situation réelle?
- Pourquoi il y a un hook CRUD mais aussi des hooks spécifiques aux modifications des items?

## 🎯 Current Priorities

### High Priority
- [ ] Clean up ESLint errors in extension code
- [ ] Add unit tests for extension services
- [ ] Improve error handling in services

### Medium Priority
- [ ] Complete popover features development
- [ ] Add comprehensive error boundaries
- [ ] Improve test coverage for critical paths
- [ ] Optimize extension bundle size

### Low Priority
- [ ] Add performance monitoring
- [ ] Create extension store listing

## 🎭 E2E Testing with Playwright (NEW PRIORITY)

### Phase 1: Setup ✅ COMPLETE
- [x] Install Playwright dependencies
- [x] Create Playwright configuration
- [x] Create extension context helper
- [x] Implement smoke test (extension loads)
- [x] Verify tests run successfully

### Phase 2: Authentication Tests ✅ INFRASTRUCTURE COMPLETE
- [x] Create test configuration file
- [x] Create console monitor helper
- [x] Write login flow test
- [x] Write logout flow test
- [x] Write email validation test
- [x] Write error handling tests
- [x] Write password visibility toggle test
- [ ] Add data-testid attributes to UI components
- [ ] Create test user in Firebase
- [ ] Verify all tests pass

### Phase 3: Autofill Tests (Week 3)
- [ ] Test form detection
- [ ] Test credential selection
- [ ] Test autofill injection
- [ ] Test save credential prompt
- [ ] Test autofill on various sites

### Phase 4: Advanced Features (Week 4)
- [ ] Test password generator
- [ ] Test security features (HTTP warning, iframe protection)
- [ ] Test XSS prevention
- [ ] Create console monitor helper
- [ ] Add test data helpers

### Phase 5: CI/CD (Week 5)
- [ ] Set up GitHub Actions workflow
- [ ] Add test scripts to package.json
- [ ] Generate test reports
- [ ] Document test patterns

**See**: `documentation/PLAYWRIGHT_IMPLEMENTATION_PLAN.md` for full details

## 🚀 Features to Develop

### Core Features
- [ ] Settings page with preference persistence
- [ ] Complete CRUD operations for credentials
- [ ] Password change functionality
- [ ] Email change functionality
- [ ] Enhanced popover interactions

### Advanced Features
- [ ] Biometric authentication
- [ ] Advanced password generation options
- [ ] Secure notes management
- [ ] Credit card management
- [ ] Two-factor authentication

## 🧪 Testing & Quality

### Testing
- [ ] Unit tests for all services
- [ ] Integration tests for autofill
- [ ] Security tests for popovers
- [ ] Performance tests for crypto operations

### Code Quality
- [ ] Achieve 100% ESLint compliance
- [ ] Improve TypeScript strictness
- [ ] Add comprehensive error handling
- [ ] Optimize bundle size and performance

## 📚 Documentation

### Technical Documentation
- [ ] API documentation for services
- [ ] Component documentation
- [ ] Security best practices guide
- [ ] Deployment guide

### User Documentation
- [ ] User manual
- [ ] Feature guides
- [ ] Troubleshooting guide
- [ ] FAQ section

## 🏗️ Architecture

### Current State
- ✅ Extension: React DOM + Vite
- ✅ Business Logic: packages/common (services, adapters, utils)
- ✅ UI: packages/extension/ui (DOM components)
- ✅ No React Native dependencies

### Future Considerations
- [ ] Mobile app development with shared logic
- [ ] Web app version
- [ ] Desktop app version
- [ ] API for third-party integrations
