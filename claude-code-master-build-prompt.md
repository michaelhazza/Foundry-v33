# Claude Code Master Build Prompt (AI-Optimized)

## FRAMEWORK VERSION

Framework: Agent Specification Framework v2.1
Constitution: Inherited from Agent 0
Document: Claude Code Master Build Prompt
Status: Active
Optimization: AI-to-AI Communication
Agent Versions: Agent 2 v25, Agent 4 v36, Agent 5 v33, Agent 6 v50, Agent 7 v46, Agent 8 v41 (Prevention-First Architecture)
Audit: Agent 8 v41 (82 patterns, auto-fix enabled, 0 issue target)

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| v21 | 2026-01-28 | **MACHINE-READABLE CONTRACTS:** Contract parsing integration. Agent versions updated: Agent 2 v27->v25 (architectural-decisions.json), Agent 4 v35.1->v36 (service-contracts.json), Agent 5 v32->v33 (routes-pages-manifest.json), Agent 6 v49->v50 (Pattern 83 contract parsing), Agent 7 v45->v46 (Gate #53 contract validation checks 7-9). Added PHASE 0.5: CONTRACT PARSING (parse JSON contracts AFTER Gate #53 validation, BEFORE scaffolding). Builds internal maps: serviceMap (endpoint->contract), pageMap (route->page metadata), decisions (architectural choices). Cross-validates: page API dependencies exist in service contracts. Eliminates interpretation errors: function names exact, route paths exact, config values explicit (15m not "short"). Prevents 50-60% of cross-document consistency issues. Usage: Phase 2 services use serviceMap, Phase 3 routes use serviceMap, Phase 7 pages use pageMap + serviceMap, all phases use decisions for configuration. Expected: Zero "getUserProfile" -> "getUserProfileData" naming drift, zero pages before APIs, zero implicit defaults; Hygiene Gate: PASS |
| v20 | 2026-01 | **SPEC STACK INTEGRITY:** Pre-flight specification validation before code generation. Agent versions updated: Agent 6 v49 (Patterns 80-82), Agent 7 v45 (Gate #53 spec-stack validator). Added PHASE 0.0: SPEC STACK VALIDATION (validates specs BEFORE Phase 0 file creation). Gate #53 checks: ASCII-only encoding (no mojibake/emoji), no localhost references (must use 127.0.0.1/0.0.0.0), constitution inheritance format (non-versioned), Document End versions match filenames, cross-reference consistency (Agent 6 v49, Agent 7 v45, Agent 8 v41), Assumption Register presence. Constitution reference updated to non-versioned format (Agent 0 v4.5 compliance). Removed mojibake encoding: replaced all emoji with ASCII equivalents ([OK], [X], [WARN]). Fixed localhost references throughout (now 127.0.0.1 for dev proxy). Meta-protection: validates specification stack internal consistency before Claude Code reads them. Completes prevention-first framework: spec validation (Phase 0.0) -> file creation (Phase 0.1-0.5) -> progressive gates (53 gates) -> deployment. Expected: Spec stack passes validation, eliminating all spec drift failures. Foundry v32 impact: Prevents 23 issues caused by inconsistent specifications; Hygiene Gate: PASS |
| v19 | 2026-01 | **REVOLUTIONARY:** Prevention-first architecture - generate perfect code first time. Agent versions updated: Agent 6 v49->v49 (exact templates), Agent 7 v44->v45 (52 verification scripts +4 gates). Added PHASE 0: PRE-FLIGHT (create 5 mandatory files BEFORE Phase 1). Added AUTO_RUN_AGENT_8 configuration (default: false - prevention over detection). Added progressive verification (gates run AFTER each file/resource, not at phase end). Added exact templates (copy-paste, zero interpretation). Added explicit checklists (route paths, port consistency, endpoint coverage). New gates: verify-replit-deployment.sh, verify-endpoint-paths.sh, verify-dev-script-concurrent.sh, verify-port-consistency.sh. Enhanced verify-vite-config.sh (watch config, host binding). Phase 0 prevents 8 CRITICAL issues (missing .replit, port mismatches, dev script). Progressive verification catches issues immediately. Expected: 0 issues before Agent 8 runs (vs 23 in Foundry v32). Foundry v32 lessons: gates exist but weren't enforced -> v19 enforces at generation time; Hygiene Gate: PASS |
| v18 | 2026-01 | **TRANSFORMATIVE:** Concurrent execution + Agent 8 auto-fix integration. Agent versions updated: Agent 7 v42.1->v43 (48 verification scripts, +20 from Agent 8), Agent 8 v39->v40 (JSON output, auto-fix metadata). Added CONCURRENT_EXECUTION configuration with 3-thread strategy. Added AUTO_FIX_MODE with iterative Agent 8 loop (max 3 iterations). Thread orchestration: Thread A (Services->Routes), Thread B (Database), Thread C (Components->Pages) run parallel after Phase 1. Synchronization point before Phase 6 (all threads complete). Agent 8 runs AFTER Phase 8 with full codebase. Auto-fix loop: Audit->Parse->Fix->Re-audit until issues=0 or max iterations. Quality target: 0 issues (99.5% prevention via 48 scripts + auto-fix). Expected speedup: 25% faster builds via concurrency; Hygiene Gate: PASS |
| v17 | 2026-01 | **TRANSFORMATIVE:** Service-first architecture integration. Agent versions updated: Agent 4 v32->v35.1, Agent 6 v48->v49, Agent 7 v33->v42, Agent 8 v36->v39. Added Step 0.6 (Service Contract Validation) in Phase 0. Services implemented BEFORE routes (Phase 2 -> Phase 3). Added 4 new verification scripts (verify-route-service-contract.sh, verify-service-stubs.sh, verify-pagination.sh, verify-mandatory-files.sh). Service contracts from Agent 4 Section 6 validated pre-implementation. BaseService abstract class enforces pagination. Dynamic file manifest from Agents 3-5 specs. Quality target: 0-1 issues (96% reduction from 27). Prevents Foundry v31 root causes: route-service coordination (59%), stubs (11%), pagination (22%), missing files (4%); Hygiene Gate: PASS |
| v16 | 2026-01 | **CRITICAL:** Code completeness update. Agent versions updated: Agent 2 v26->v27, Agent 4 v31->v32, Agent 6 v38->v39, Agent 7 v32->v33. Added 4 new verification scripts (verify-no-placeholders.sh, verify-schema-count.sh, verify-transactions.sh, verify-navigation-components.sh). Absolute TODO prohibition. Route-to-service wiring mandatory. Exact count verification (not minimum). HTTP-only cookie implementation. Schema manifest. Transaction requirements. Navigation components. Quality target: <3 issues (was 7-15); Hygiene Gate: PASS |
| v15 | 2026-01 | Defect prevention update. Mandatory files 7->10. ADR compliance & file manifest verification. Logging standards |

---

## CONFIGURATION

**CONCURRENT_EXECUTION:**
```
CONCURRENT_EXECUTION = true  # NEW - DEFAULT
```

**Options:**
- `true` (NEW DEFAULT) - Run independent phases in parallel threads
  - 25% faster builds via concurrent execution
  - Thread A: Services -> Routes (sequential within thread)
  - Thread B: Database schema
  - Thread C: Components -> Pages (sequential within thread)
  - Synchronization: All threads complete before Phase 6
  
- `false` - Sequential execution (v17 behavior)
  - Phases run one at a time
  - Easier debugging if issues occur

**AUTO_FIX_MODE:**
```
AUTO_FIX_MODE = false  # NEW v19 DEFAULT - Prevention-First Approach
```

**Options:**
- `false` (NEW v19 DEFAULT) - Prevention-first: Generate perfect code, skip Agent 8
  - Focus on preventing issues at generation time (Phase 0 + progressive gates)
  - Build completes after Agent 7 gates pass (52 verification scripts)
  - No Agent 8 audit (faster builds, ~3 min saved)
  - Deploy immediately if all gates pass
  - Recommended for testing prevention-first approach
  - Expected: 0 issues at deployment (Phase 0 prevents 8 issues, gates prevent rest)
  
- `true` - Detection + auto-fix: Agent 8 runs automatically with iterative fixing
  - After Phase 8 complete + all threads synchronized
  - Runs comprehensive audit (79 patterns)
  - Auto-fixes detected issues (high-confidence fixes only)
  - Re-audits until issues = 0 or max iterations (3)
  - Use as safety net if prevention misses edge cases
  - Expected: Iteration 1 finds 0 issues (99.5% prevention via 52 scripts)

**AUTO_RUN_AGENT_8:**
```
AUTO_RUN_AGENT_8 = false  # DEPRECATED - use AUTO_FIX_MODE instead
```

**Current Workflow (CONCURRENT_EXECUTION=true, AUTO_FIX_MODE=false):**

```
Phase 0.0: Spec Stack Validation (Gate #53)
  |
Phase 0.5: Contract Parsing (NEW v21)
  |
Phase 0: Pre-Flight - Create 5 mandatory files + verify
  ?
Phase 1: Foundation (Sequential) + progressive gates
  ?
----------------------??
?   CONCURRENT EXECUTION BLOCK    ?
----------------------??
? Thread A: Phase 2 (Services)   ?
?           + verify after each   ?
?           Phase 3 (Routes)      ?
?           + verify after each   ?
?                                 ?
? Thread B: Phase 4 (Database)   ?
?           + verify after each   ?
?                                 ?
? Thread C: Phase 5 (Components) ?
?           + verify after each   ?
?           Phase 7 (Pages)       ?
?           + verify after each   ?
----------------------??
  ? [SYNC POINT - All threads complete]
Phase 6: Auth & Middleware (Sequential) + progressive gates
  ?
Phase 8: Integration (Sequential) + final gates
  ?
Agent 7: 52 Verification Scripts (Sequential)
  ?
[Agent 8 SKIPPED - AUTO_FIX_MODE=false]
  ?
DEPLOYMENT READY (0 issues expected)
  ?? Iteration 1: Audit -> Fix (if needed) -> Re-audit
  ?? Iteration 2: Fix remaining -> Re-audit
  ?? Iteration 3: Final check -> BLOCK if issues remain
  ?
DEPLOYMENT READY (0 issues guaranteed)
```

**Workflow Steps:**
1. Read specs (Agent 4 v35.1, Agent 6 v49, Agent 7 v45, Agent 8 v41)
2. **Validate service contracts (Step 0.6)**
3. Generate codebase with concurrent execution
4. **Synchronize threads before Phase 6**
5. Complete Phase 6-8 sequentially
6. Run 52 verification scripts (Agent 7 v45)
7. **Run Agent 8 auto-audit with fix loop (NEW)**
8. Deploy with 0 issues
11. Declare complete
12. (User manually runs Agent 8 - expects <3 issues)

---

## CLAUDE CODE OPTIMIZATION WORKFLOW

**[CRITICAL]** Current specs (v20-v39 range) are AI-optimized with verification commands, phase gates, self-audit scripts, ADR compliance checks, code completeness verification.

### What Changed in v18

**TRANSFORMATIVE - Concurrent Execution + Agent 8 Auto-Fix:**
- ? **NEW PARADIGM:** Independent phases run in parallel (3 threads)
- ? **PERFORMANCE:** 25% faster builds via concurrent execution
- ? **AUTOMATION:** Agent 8 auto-fix loop eliminates manual intervention
- [OK] **QUALITY:** 0 issues guaranteed (52 verification scripts + auto-fix)
- ? **THREAD ORCHESTRATION:** Proper synchronization before dependencies

**Thread Execution Strategy:**
- **Thread A (Backend):** Phase 2 (Services) -> Phase 3 (Routes) [sequential within thread]
- **Thread B (Data):** Phase 4 (Database schema)
- **Thread C (Frontend):** Phase 5 (Components) -> Phase 7 (Pages) [sequential within thread]
- **Sync Point:** All 3 threads complete before Phase 6 (Auth & Middleware)

**Agent 8 Auto-Fix Loop:**
1. Phase 8 completes -> Agent 7 gates pass (52 scripts)
2. Agent 8 runs comprehensive audit (79 patterns, JSON output)
3. If issues found: Auto-fix (high-confidence only) -> Re-audit
4. Repeat until issues = 0 or max 3 iterations
5. Expected: Iteration 1 = 0 issues (99.5% prevention)

**Agent Version Updates:**
- Agent 7: v43 -> v45 (52 verification scripts, +4 new gates)
- Agent 8: v39 -> v40 (JSON output, auto-fix metadata, confidence scoring)

**NEW Verification Scripts (20 total - v18):**
- N+1 query detection, CORS config, rate limiting, sensitive logs
- SQL injection vectors, env var validation, upload limits
- DB pooling, blocking operations, input validation (Zod)
- Soft deletes, RBAC coverage, dependency audit
- Email templates, search optimization, navigation a11y
- (See Agent 7 v45 for complete list)

**Expected Impact:**
- Build time: 25% faster (concurrent execution)
- Manual work: 0 (auto-fix handles all issues)
- Final issues: 0 (99.5% prevention + auto-fix)
- Developer experience: Deploy on first attempt

### What Changed in v17

**TRANSFORMATIVE - Service-First Architecture:**
- ? **NEW PARADIGM:** Services implemented BEFORE routes (Phase 2 -> Phase 3)
- [OK] **REQUIRED:** Service contracts from Agent 4 v35.1 Section 6 validated pre-implementation
- [OK] **REQUIRED:** Routes match service contracts (import paths, function names, parameters)
- [OK] **REQUIRED:** No stub implementations (always throw, TODOs in bodies)
- [OK] **REQUIRED:** Pagination enforced via BaseService abstract class
- [OK] **REQUIRED:** ALL mandatory files (24 base + dynamic from Agents 3-5)

**NEW Verification Scripts (4 total - v17):**
- **verify-route-service-contract.sh** - Validates routes match Agent 4 Section 6 contracts
- **verify-service-stubs.sh** - Detects stub implementations
- **verify-pagination.sh** - Ensures list endpoints paginated
- **verify-mandatory-files.sh** - Validates ALL files (24 base + dynamic)

**NEW Workflow Step:**
- **Step 0.6:** Validate service contracts (Agent 4 Section 6) before implementation

**Agent Version Updates:**
- Agent 4: v32 -> v35.1 (Service contract specification)
- Agent 6: v39 -> v49 (Service-first patterns 76-79)
- Agent 7: v33 -> v42 (Service-first gates #26-28)
- Agent 8: v36 -> v39 (Service-first audit patterns 76-79)

**Expected Impact:**
- Issue reduction: 27 -> 0-1 (96% reduction)
- Prevents: Route-service coordination (59%), stubs (11%), pagination (22%), missing files (4%)

### What Changed in v16

**CRITICAL - Code Completeness Requirements:**
- [X] **FORBIDDEN:** TODO/FIXME/PLACEHOLDER comments
- [X] **FORBIDDEN:** Hardcoded placeholder data
- [X] **FORBIDDEN:** Stub implementations
- [OK] **REQUIRED:** All routes must import and call services
- [OK] **REQUIRED:** All code 100% complete and functional

**NEW Verification Scripts (4 total):**
- **verify-no-placeholders.sh** - Blocks TODO/placeholder code
- **verify-schema-count.sh** - Validates exact table-to-file mapping
- **verify-transactions.sh** - Ensures db.transaction() on required functions
- **verify-navigation-components.sh** - Checks feature groups >=3 pages

**Updated Verification Requirements:**
- Endpoint counts: EXACT match (not minimum ?)
- Schema counts: EXACT table-to-file correspondence
- Route wiring: ALL routes call services
- Navigation: ALL feature groups >=3 pages have components

**Agent Version Updates:**
- Agent 2: v26 -> v27 (HTTP-only cookie implementation)
- Agent 4: v31 -> v32 (Exact endpoint counts)
- Agent 6: v38 -> v39 (TODO prohibition, route wiring)
- Agent 7: v32 -> v33 (11 verification scripts)

### Mandatory Workflow

**1. USE VERIFICATION COMMANDS**

Every spec includes verification. YOU MUST RUN during implementation:

```bash
# Example from Agent 4 v32 (API Contract) - EXACT counts
# Spec: "Auth: 10 endpoints"
ACTUAL=$(grep -c "router\." server/routes/auth.routes.ts)
EXPECTED=10
[ "$ACTUAL" -eq "$EXPECTED" ] || exit 1  # EXACT match, not >=

# Example from Agent 4 v32 (Parameter Validation)
# FORBIDDEN: Direct parseInt
grep -r "parseInt(req\.params" server/routes/ && exit 1

# Example from Agent 6 v49 (Code Completeness) - NEW v16
# FORBIDDEN: TODO/FIXME/PLACEHOLDER
grep -rE "(// TODO|// FIXME|// PLACEHOLDER)" server/routes/ server/services/ && exit 1
```

**When to verify:**
- After each resource (Auth, Projects, etc.)
- Before marking phase "complete"
- When in doubt

**1.5. VALIDATE SERVICE CONTRACTS (CRITICAL - NEW v17)**

**Step 0.6:** Before implementing ANY code, validate service contracts:

```bash
# From Agent 4 v35.1 Section 6
# Agent 6 v49 Pattern 76

# Read Agent 4 Section 6 - Service Contract Specification
# For EVERY endpoint, note:
#   - Service file name (exact, case-sensitive)
#   - Function name (exact)
#   - Parameter order (exact)
#   - Return type (exact)

# Example from Agent 4 Section 6:
# ### Authentication Service Contract
# **Service File:** server/services/auth.service.ts
# **Function:** login(email: string, password: string): Promise<AuthResponse>

# BEFORE writing routes, verify contracts exist and are understood
# Routes will be implemented to MATCH these contracts (Phase 3)
```

**Why this matters:**
- Routes and services coordinated via contracts (prevents 59% of issues)
- Import paths correct from start (no "file not found" errors)
- Function signatures aligned (no parameter mismatches)
- Service-first workflow: contracts -> services -> routes

**[WARN] CRITICAL:** Do NOT implement services or routes without reading Agent 4 Section 6 first.

**2. FOLLOW GATED PHASES WITH CONCURRENT EXECUTION (Agent 6 v49, NEW v18)**

**CONCURRENT EXECUTION MODEL:**

```markdown
### Phase 0.0: Spec Stack Validation (NEW - BLOCKING)

**[META-VALIDATION]** Validate specification documents BEFORE any code generation:

**Purpose:** Prevent spec drift issues that caused 23 failures in Foundry v32 by validating specs are internally consistent.

---

#### Step 0.0: Run verify-spec-stack.sh

**Command:**
```bash
bash scripts/verify-spec-stack.sh || {
  echo "[X] Spec stack has inconsistencies - fix specs before code generation"
  exit 1
}
```

**What It Validates:**

1. **ASCII-only encoding** - No mojibake/emoji ([OK]?[WARN][TARGET][STOP])
2. **No localhost** - Must use 127.0.0.1 or 0.0.0.0
3. **Constitution format** - "Inherited from Agent 0" (not versioned)
4. **Document End versions** - Match filenames
5. **Cross-reference consistency** - Agent 6 v50, Agent 7 v46, Agent 8 v41
7. **Machine-readable contracts exist** - service-contracts.json, routes-pages-manifest.json, architectural-decisions.json
8. **JSON contracts valid** - Parsable without syntax errors
9. **JSON contract schema** - Required fields present
6. **Assumption Register** - Sections present (optional check)

**Exit Codes:**
- `0`: Spec stack valid -> Continue to Phase 0.1
- `1`: Spec stack invalid -> STOP, fix specs

**Script Location:** Agent 7 v46 Gate #53

[STOP] **BLOCKING:** If validation fails, STOP immediately. Fix specification documents before proceeding.

**Verification:**
```bash
# Spec stack validated
echo "[OK] Spec stack integrity validated - ready for code generation"
```

---

### Phase 0.5: Contract Parsing & Validation (NEW v21 - BLOCKING)

**[CONTRACT PARSING]** Parse machine-readable contracts BEFORE scaffolding:

**Purpose:** Build internal maps from JSON contracts to enable exact implementation with zero interpretation errors. Eliminates 50-60% of cross-document consistency issues.

---

#### Step 0.5: Parse JSON Contracts

**Command:**
```bash
echo "[INFO] Parsing machine-readable contracts..."

# Verify contracts exist (already validated by Gate #53)
[ -f "docs/service-contracts.json" ] || { echo "[X] service-contracts.json missing"; exit 1; }
[ -f "docs/routes-pages-manifest.json" ] || { echo "[X] routes-pages-manifest.json missing"; exit 1; }
[ -f "docs/architectural-decisions.json" ] || { echo "[X] architectural-decisions.json missing"; exit 1; }

echo "[OK] All 3 JSON contracts present"
```

**What to Parse:**

1. **service-contracts.json** (Agent 4 v36)
   - Build serviceMap: `Map<"METHOD /path", ContractMetadata>`
   - Extract: serviceFile, function name, parameters, return type
   - Use in: Phase 2 (service generation), Phase 3 (route generation)

2. **routes-pages-manifest.json** (Agent 5 v33)
   - Build pageMap: `Map<routePath, PageMetadata>`
   - Extract: filePath, apiDependencies, dataDependencies, components
   - Validate: All apiDependencies exist in serviceMap
   - Use in: Phase 7 (page generation)

3. **architectural-decisions.json** (Agent 2 v25)
   - Load decisions object
   - Extract: authentication config, multi-tenant enforcement, soft delete policy, file upload strategy, error handling format, logging strategy
   - Use throughout: All phases (configure based on explicit decisions)

**Parsing Logic:**

```javascript
// Build service contract map
const serviceContracts = JSON.parse(fs.readFileSync('docs/service-contracts.json', 'utf8'));
const serviceMap = new Map();

serviceContracts.endpoints.forEach(endpoint => {
  const key = `${endpoint.method} ${endpoint.path}`;
  serviceMap.set(key, {
    serviceFile: endpoint.serviceFile,
    function: endpoint.function,
    params: endpoint.parameters,
    returns: endpoint.returns,
    authenticated: endpoint.authenticated
  });
});

// Build page manifest map
const pagesManifest = JSON.parse(fs.readFileSync('docs/routes-pages-manifest.json', 'utf8'));
const pageMap = new Map();

pagesManifest.pages.forEach(page => {
  pageMap.set(page.routePath, {
    filePath: page.filePath,
    apis: page.apiDependencies,
    data: page.dataDependencies,
    components: page.componentDependencies
  });
});

// Load architectural decisions
const archDecisions = JSON.parse(fs.readFileSync('docs/architectural-decisions.json', 'utf8'));
const decisions = archDecisions.decisions;
```

**Cross-Validation:**

```javascript
// Validate page API dependencies exist in service contracts
pagesManifest.pages.forEach(page => {
  page.apiDependencies.forEach(api => {
    const key = `${api.method} ${api.path}`;
    if (!serviceMap.has(key)) {
      throw new Error(
        `Page "${page.name}" depends on ${key} but endpoint not in service-contracts.json. ` +
        `Add endpoint to Agent 4 spec and regenerate contracts.`
      );
    }
  });
});

console.log('[OK] All page API dependencies validated');
```

**Usage Examples:**

**Phase 2 (Services):**
```javascript
// Get contract for endpoint
const contract = serviceMap.get('POST /api/auth/register');

// Generate service file at exact location
// File: server/services/auth.service.ts
// Function: register(email: string, password: string): Promise<AuthResponse>
// Parameters: exact names and types from contract
```

**Phase 3 (Routes):**
```javascript
// Use same contract
const contract = serviceMap.get('POST /api/auth/register');

// Generate route that:
// - Imports from: contract.serviceFile
// - Calls function: contract.function
// - Extracts params: contract.params.map(p => p.source)
// Example: authService.register(req.body.email, req.body.password)
```

**Phase 7 (Pages):**
```javascript
// Get page metadata
const page = pageMap.get('/login');

// Create page at: client/src/pages/auth/LoginPage.tsx
// API calls: page.apis.forEach(api => {
//   const contract = serviceMap.get(`${api.method} ${api.path}`);
//   // Generate typed API client call
// })
```

**Architectural Configuration:**
```javascript
// Use decisions throughout implementation
const auth = decisions.authentication;
if (auth.selectedOption === "JWT with refresh tokens") {
  // Configure JWT middleware with:
  // - Access token expiry: auth.implementation.accessTokenExpiry (e.g., "15m")
  // - Refresh token expiry: auth.implementation.refreshTokenExpiry (e.g., "7d")
}

const uploads = decisions.fileUpload;
if (uploads.selectedOption === "Local filesystem with stream processing") {
  // Configure multer with:
  // - limits: uploads.implementation.limits (e.g., {fileSize: "50MB"})
  // - allowedMimeTypes: uploads.implementation.allowedMimeTypes
}
```

**Verification:**
```bash
# Contracts parsed and maps built
echo "[OK] Service contracts: $(serviceMap.size) endpoints"
echo "[OK] Page manifest: $(pageMap.size) pages"
echo "[OK] Architectural decisions: $(Object.keys(decisions).length) decisions loaded"
echo "[OK] Cross-validation: All page APIs exist in service contracts"
```

[STOP] **BLOCKING:** If cross-validation fails (page depends on missing API), STOP immediately. Fix Agent 4/5 specs and regenerate contracts.

**Benefits:**

1. **Zero Interpretation:**
   - Function name "getUserProfile" stays "getUserProfile" (not "getUserProfileData")
   - Route path "/items/:itemId" stays "/items/:itemId" (not simplified to "/items/:id")

2. **API-Before-Page Enforcement:**
   - Page creation blocked if API dependency missing
   - Prevents "page implemented before API" failures

3. **Explicit Configuration:**
   - "JWT with 15m/7d expiry" not "JWT auth" (vague)
   - "50MB file limit" not "reasonable limit" (ambiguous)

4. **Compile-Time Validation:**
   - Errors found during parsing (Phase 0.5)
   - Not at runtime or in Agent 8 audit

**Cross-References:**
- Agent 2 v25 Section 11.1: Architectural decisions JSON
- Agent 4 v36 Section 6.1: Service contracts JSON
- Agent 5 v33: Routes-pages manifest JSON
- Agent 6 v50 Pattern 83: Contract parsing & validation
- Agent 7 v46 Gate #53: Contract validation (checks 7-9)
- Stack Manifest v1.0: Machine-readable contracts requirement

---

### Phase 0: Pre-Flight Validation (NEW - BLOCKING)

**[CRITICAL]** Create these files FIRST, BEFORE any other code generation:

**Purpose:** Prevent 8 CRITICAL issues found in Foundry v32 by creating mandatory files upfront with EXACT configuration.

---

#### Step 0.1: Create .replit Configuration

**File:** `.replit`

```
modules = ["nodejs-20"]
hidden = [".config", "package-lock.json"]

[nix]
channel = "stable-24_05"

[deployment]
run = ["sh", "-c", "npm run start"]
deploymentTarget = "cloudrun"
ignorePorts = false

[[ports]]
localPort = 5000
externalPort = 80
```

**Verification:**
```bash
bash scripts/verify-replit-deployment.sh || {
  echo "[X] .replit validation FAILED"
  exit 1
}
```

[STOP] **STOP if verification fails. Fix before continuing.**

---

#### Step 0.2: Create package.json with EXACT Scripts

**File:** `package.json` (root)

**[CRITICAL]** Copy these scripts EXACTLY - DO NOT modify:

```json
{
  "name": "foundry",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "concurrently \"PORT=3001 tsx watch server/index.ts\" \"cd client && npx vite\"",
    "dev:server": "PORT=3001 tsx watch server/index.ts",
    "dev:client": "cd client && npx vite",
    "build": "cd client && npm run build && cd .. && tsc -p server/tsconfig.json",
    "start": "NODE_ENV=production node dist/server/index.js",
    "db:generate": "drizzle-kit generate --force",
    "db:push": "drizzle-kit push --force",
    "db:migrate": "tsx server/db/migrate.ts",
    "db:seed": "tsx server/db/seed-admin.ts",
    "typecheck": "tsc --noEmit && cd client && tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "drizzle-orm": "^0.29.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/express": "^4.17.21",
    "@types/pg": "^8.10.9",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "@types/multer": "^1.4.11",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "drizzle-kit": "^0.20.14",
    "concurrently": "^8.2.2",
    "eslint": "^8.56.0"
  }
}
```

**Verification:**
```bash
bash scripts/verify-dev-script-concurrent.sh || exit 1
bash scripts/verify-package-scripts.sh || exit 1
```

[STOP] **STOP if verification fails.**

---

#### Step 0.3: Create vite.config.ts with EXACT Configuration

**File:** `client/vite.config.ts`

**[CRITICAL]** Copy EXACTLY - all values matter:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',        // REQUIRED for Replit accessibility
    port: 5000,              // Vite dev server port
    strictPort: true,
    watch: {                 // REQUIRED for Replit (prevents high CPU)
      usePolling: true,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',  // Dev backend port (from package.json PORT=3001)
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

**Port Configuration Cross-Reference Table:**

| Component | Port | Source |
|-----------|------|--------|
| Vite dev server | 5000 | vite.config.ts server.port |
| Vite proxy target | 3001 | vite.config.ts server.proxy |
| Backend dev | 3001 | package.json dev script PORT=3001 |
| Backend prod default | 5000 | server/config.ts (next step) |
| Replit external | 80 | .replit [[ports]] |
| Replit internal | 5000 | .replit [[ports]] |

**ALL ports must match this table.**

**Verification:**
```bash
bash scripts/verify-vite-config.sh || exit 1
bash scripts/verify-port-consistency.sh || exit 1
```

[STOP] **STOP if verification fails.**

---

#### Step 0.4: Create server/config.ts with Port DEFAULT 5000

**File:** `server/config.ts`

**[CRITICAL]** Port default MUST be 5000:

```typescript
import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),  // DEFAULT 5000 (production port)
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  isDev: optionalEnv('NODE_ENV', 'development') === 'development',
  database: {
    url: requireEnv('DATABASE_URL'),
  },
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    accessExpiry: optionalEnv('JWT_ACCESS_EXPIRY', '15m'),
    refreshExpiry: optionalEnv('JWT_REFRESH_EXPIRY', '7d'),
  },
  encryption: {
    key: requireEnv('ENCRYPTION_KEY'),  // REQUIRED for PII encryption
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,                   // 100 requests per windowMs
  },
  cors: {
    origin: optionalEnv('ALLOWED_ORIGINS', 'http://127.0.0.1:5000'),
    credentials: true,
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024,  // 10MB
    allowedMimeTypes: ['text/csv', 'application/json', 'text/plain'],
  },
} as const;
```

**Verification:**
```bash
bash scripts/verify-port-consistency.sh || exit 1
```

[STOP] **STOP if verification fails.**

---

#### Step 0.5: Create .env.example with ALL Required Variables

**File:** `.env.example`

**[CRITICAL]** List EVERY required environment variable from specs:

```bash
# Database
DATABASE_URL=postgresql://user:password@127.0.0.1:5432/foundry

# Authentication
JWT_SECRET=your-secret-key-min-32-chars-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Encryption (for PII data)
ENCRYPTION_KEY=your-encryption-key-min-32-chars-change-in-production

# Server
NODE_ENV=development
PORT=5000

# CORS
ALLOWED_ORIGINS=http://127.0.0.1:5000

# File Uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**Verification:**
```bash
bash scripts/verify-env-example.sh || exit 1
bash scripts/verify-mandatory-files.sh || exit 1
```

[STOP] **STOP if verification fails.**

---

#### Phase 0 Final Gate (BLOCKING)

**Run ALL Phase 0 verification scripts:**

```bash
echo "=== Phase 0: Pre-Flight Verification ==="

bash scripts/verify-replit-deployment.sh || exit 1
bash scripts/verify-port-consistency.sh || exit 1
bash scripts/verify-dev-script-concurrent.sh || exit 1
bash scripts/verify-package-scripts.sh || exit 1
bash scripts/verify-vite-config.sh || exit 1
bash scripts/verify-env-example.sh || exit 1
bash scripts/verify-mandatory-files.sh || exit 1

echo "[OK] Phase 0: All gates passed"
echo ""
```

[STOP] **CRITICAL:** If ANY gate fails, STOP. Fix the issue before proceeding to Phase 1.

**Phase 0 Complete. Files created:**
- [x] .replit (Replit deployment config)
- [x] package.json (with exact scripts, concurrently for dev)
- [x] client/vite.config.ts (port 5000, proxy to 3001, watch config)
- [x] server/config.ts (port default 5000, all env vars)
- [x] .env.example (complete list of required variables)

**Impact:** Phase 0 prevents 8 CRITICAL issues from Foundry v32:
- Missing .replit (CRIT-001)
- Port default wrong (CRIT-002)
- Vite proxy wrong port (CRIT-003)
- Missing Vite watch config (CRIT-004)
- Dev script incomplete (HIGH-002)
- Missing db:push/generate scripts (HIGH-009)
- ENCRYPTION_KEY optional (HIGH-010)
- Build script broken (HIGH-008)

---

### Phase 1: Foundation (SEQUENTIAL - All threads wait)
**Tasks:** Config files, templates, directory structure

**Gate Verification:**
bash scripts/verify-phase-1.sh || exit 1

[STOP] GATE: Phase 1 MUST complete before ANY other phases

### === CONCURRENT EXECUTION BLOCK START ===

### Thread A: Backend Layer (Services -> Routes)

#### Phase 2: Service Layer
**Tasks:** Implement ALL services from Agent 4 Section 6 contracts

**Gate Verification:**
bash scripts/verify-service-stubs.sh || exit 1
bash scripts/verify-pagination.sh || exit 1
bash scripts/verify-n-plus-one-queries.sh || exit 1  # NEW v18

[STOP] GATE: Services MUST pass before Phase 3

#### Phase 3: Route Layer
**Tasks:** Implement routes calling verified services

**[CRITICAL] BEFORE implementing routes:**

1. **Open Agent 4 Section 4** (keep it visible throughout implementation)
2. **Count total endpoints:** Agent 4 lists [X] endpoints - ALL must be implemented
3. **Read Agent 4 Section 6** (service contracts - verify functions exist)

**Implementation Workflow (For EACH resource):**

**Step 1: Copy EXACT paths from Agent 4**
```
[X] DON'T simplify:  /api/invitations
[OK] DO use exact:     /api/organizations/:orgId/invitations

[X] DON'T change:     /api/process
[OK] DO use exact:     /api/projects/:projectId/process

Common mistakes (from Foundry v32):
- Removing :orgId from paths
- Changing /process to /processing/start
- Using :id instead of :invitationId
```

**Step 2: Verify service function EXISTS**
```bash
# Before: router.post('/organizations/:orgId/invitations', ...)
# Check service has the function:
grep -q "export.*createInvitation" server/services/invitations.service.ts || exit 1
```

**Step 3: Implement route with EXACT path**
```typescript
// CORRECT: Path matches Agent 4 Section 4
router.post('/organizations/:orgId/invitations', 
  authenticate,
  authorize('admin'),
  validateBody(createInvitationSchema),
  async (req, res, next) => {
    try {
      // Extract orgId from URL params (NOT req.user.organizationId)
      const orgId = parseInt(req.params.orgId);
      
      // Call service from Agent 4 Section 6
      const result = await invitationsService.createInvitation(
        orgId,              // From URL
        req.user.userId,    // From auth
        req.body           // Validated data
      );
      
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
);
```

**Step 4: Progressive verification after EACH route file**
```bash
# After implementing auth.routes.ts
bash scripts/verify-route-service-contract.sh || exit 1

# After implementing invitations.routes.ts
bash scripts/verify-route-service-contract.sh || exit 1

# Continue for ALL route files
```

**CRITICAL ENDPOINTS CHECKLIST (MUST IMPLEMENT):**

From Agent 4 Section 4, these are MANDATORY:

**Authentication (9 endpoints - often 3 are missed):**
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] POST /api/auth/refresh
- [ ] POST /api/auth/logout
- [ ] GET /api/auth/me (or GET /api/users/me)
- [ ] POST /api/auth/forgot-password ? **Often missed**
- [ ] GET /api/auth/reset-password/:token ? **Often missed**
- [ ] POST /api/auth/reset-password ? **Often missed**
- [ ] PATCH /api/users/me

**Other resources:** Check Agent 4 Section 4 for complete list

**Final Phase 3 Gate Verification:**
bash scripts/verify-route-service-contract.sh || exit 1
bash scripts/verify-endpoint-count.sh || exit 1
bash scripts/verify-endpoint-paths.sh || exit 1  # NEW - checks exact paths
bash scripts/verify-zod-coverage.sh || exit 1

[STOP] GATE: Routes verified, Thread A can proceed to sync point

---

### Thread B: Data Layer (Parallel to Threads A & C)

#### Phase 4: Database Schema
**Tasks:** Implement ALL schema files from Agent 3

**Gate Verification:**
bash scripts/verify-schema-count.sh || exit 1
bash scripts/verify-soft-deletes.sh || exit 1  # NEW v18
bash scripts/verify-db-pooling.sh || exit 1  # NEW v18

[STOP] GATE: Schema verified, Thread B can proceed to sync point

---

### Thread C: Frontend Layer (Components -> Pages)

#### Phase 5: Components
**Tasks:** Implement ALL components from Agent 5

**Gate Verification:**
bash scripts/verify-phase-5.sh || exit 1
bash scripts/verify-navigation-a11y.sh || exit 1  # NEW v18

[STOP] GATE: Components MUST pass before Phase 7

#### Phase 7: UI Pages
**Tasks:** Implement ALL pages from Agent 5

**Gate Verification:**
bash scripts/verify-phase-7.sh || exit 1
bash scripts/verify-navigation-components.sh || exit 1

[STOP] GATE: Pages verified, Thread C can proceed to sync point

### === SYNCHRONIZATION POINT ===
**CRITICAL:** ALL 3 threads (A, B, C) MUST complete before proceeding

```bash
echo "? Waiting for all threads to complete..."

# Wait for Thread A (Services + Routes)
wait_for_thread_a

# Wait for Thread B (Database)
wait_for_thread_b

# Wait for Thread C (Components + Pages)
wait_for_thread_c

echo "[OK] All threads complete - proceeding to Phase 6"
```

### === SEQUENTIAL EXECUTION RESUMES ===

### Phase 6: Auth & Middleware (SEQUENTIAL - Depends on Threads A + B)
**Tasks:** Implement auth middleware, JWT handlers

**Dependencies:**
- Requires Thread A complete (services exist)
- Requires Thread B complete (database ready)

**Gate Verification:**
bash scripts/verify-phase-6.sh || exit 1
bash scripts/verify-jwt-config.sh || exit 1  # NEW v18
bash scripts/verify-cors-config.sh || exit 1  # NEW v18
bash scripts/verify-rate-limiting.sh || exit 1  # NEW v18

[STOP] GATE: Auth verified, proceed to Phase 8

### Phase 8: Integration (SEQUENTIAL - Depends on ALL threads)
**Tasks:** Wire everything together, final integration

**Dependencies:**
- Requires ALL phases 1-7 complete

**Gate Verification:**
bash scripts/verify-phase-8.sh || exit 1
bash scripts/verify-mandatory-files.sh || exit 1
bash scripts/verify-no-blocking-ops.sh || exit 1  # NEW v18

[STOP] GATE: Integration verified, proceed to Agent 7 verification
```

**Execution Flow:**
```
Phase 1 (Sequential)
   ?
------------------------
?    3 Concurrent Threads          ?
?                                  ?
?  A: P2->P3   B: P4   C: P5->P7    ?
?  (Services  (Data)  (Frontend)   ?
?   Routes)                        ?
------------------------
   ? [ALL THREADS SYNC]
Phase 6 (Sequential - needs A+B)
   ?
Phase 8 (Sequential - needs ALL)
   ?
Agent 7: 52 Scripts (Sequential)
   ?
Agent 8: Auto-Fix Loop (Sequential)
```

**Why This Works:**
- Thread A: Services must precede Routes (internal dependency)
- Thread B: Database independent of backend logic
- Thread C: Components must precede Pages (internal dependency)
- Phase 6: Needs services (A) and database (B) to wire auth
- Phase 8: Needs everything to integrate
- Agent 8: Needs complete codebase to audit

**Do NOT:**
- [X] Start Phase 6 before threads complete (missing dependencies)
- [X] Run Agent 8 before Phase 8 (incomplete codebase)
- [X] Skip thread synchronization (race conditions)

**Performance Gain:**
- Sequential: 1+2+3+4+5+6+7+8 = ~8 time units
- Concurrent: 1+max(2+3,4,5+7)+6+8 = 1+3+1+1 = ~6 time units
- Speedup: 25% faster

**3. RUN CODE COMPLETENESS VERIFICATION (CRITICAL - NEW v16)**

Before proceeding:

```bash
# From Agent 6 v49 Pattern 14
bash scripts/verify-no-placeholders.sh

# Checks:
# - NO TODO comments anywhere
# - NO FIXME comments anywhere
# - NO PLACEHOLDER comments anywhere
# - NO hardcoded IDs in responses
# - ALL routes import services
# - ALL routes call service functions
# - NO stub implementations

# Exit 0 = PASS -> Proceed
# Exit 1 = FAIL -> Fix -> Re-run
```

**[WARN] CRITICAL:** Build BLOCKS if ANY TODO/placeholder code found. Zero tolerance.

**4. RUN SELF-AUDIT SCRIPT (Mandatory)**

Before marking complete:

```bash
# From Agent 6 v49 Implementation Plan
bash scripts/self-audit.sh

# Checks:
# - Endpoint counts per resource (EXACT match - v16)
# - Page counts per area
# - Security patterns (no Math.random, helmet, rate limiting)
# - Route-page parity (no placeholders)
# - Configuration (ports, proxy)
# - 10 mandatory files
# - Code completeness (NEW - v16)

# Exit 0 = PASS -> Proceed
# Exit 1 = FAIL -> Fix -> Re-run
```

**[WARN] CRITICAL:** Do NOT proceed until exit 0.

**5. RUN ADR COMPLIANCE VERIFICATION**

Before deployment:

```bash
# From Agent 6 v49 Pattern 12
bash scripts/verify-adr-compliance.sh

# Checks all 9 ADRs:
# - ADR-001: Database driver (pg, not @neondatabase/serverless)
# - ADR-002: Response envelopes
# - ADR-003: JWT fail-fast + HTTP-only cookies (UPDATED v16)
# - ADR-004: Crypto randomness (no Math.random)
# - ADR-005: Network binding (0.0.0.0/127.0.0.1, not localhost)
# - ADR-006: File upload (if applicable)
# - ADR-007: Encryption (if OAuth/API keys)
# - ADR-008: Job processor (if async processing)
# - ADR-009: Vite port 5000 + 127.0.0.1 proxy (UPDATED v16)

# Exit 0 = PASS -> Proceed
# Exit 1 = FAIL -> Fix -> Re-run
```

**6. RUN FILE MANIFEST VERIFICATION**

Check all mandatory files exist:

```bash
# From Agent 6 v49 Mandatory File Manifest
bash scripts/verify-file-manifest.sh

# Checks all 10 mandatory files:
# 1. server/lib/validation.ts (3 functions)
# 2. server/lib/response.ts
# 3. server/lib/encryption.ts
# 4. server/errors/index.ts
# 5. server/middleware/error-handler.ts
# 6. server/middleware/upload.ts
# 7. server/db/index.ts
# 8. server/workers/job-processor.ts
# 9. server/index.ts
# 10. client/src/components/error-boundary.tsx

# Plus .env.example validation:
# - DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY

# Exit 0 = PASS -> Proceed
# Exit 1 = FAIL -> Fix -> Re-run
```

**7. RUN SCHEMA COUNT VERIFICATION (NEW - v16)**

Check exact table-to-file mapping:

```bash
# From Agent 3 v24 Section 6
bash scripts/verify-schema-count.sh

# Checks:
# - Exact schema file count (not minimum)
# - All tables have corresponding files
# - Naming conventions (CamelCase -> kebab-case)
# - Index.ts exports all schemas

# Example:
# Expected: 5 tables
# Actual: $(ls server/db/schema/*.ts | grep -v index.ts | wc -l)
# Must match EXACTLY

# Exit 0 = PASS -> Proceed
# Exit 1 = FAIL -> Fix -> Re-run
```

**8. RUN TRANSACTION VERIFICATION (NEW - v16)**

Check transaction wrappers on required functions:

```bash
# From Agent 3 v24 Section 8.3
bash scripts/verify-transactions.sh

# Checks specific functions from Data Model Section 8.3:
# - AuthService.register() - MUST have db.transaction()
# - InvitationService.accept() - MUST have db.transaction()
# - OrganizationService.delete() - MUST have db.transaction()
# - [Other multi-table operations from spec]

# Verifies db.transaction() wrapper present

# Exit 0 = PASS -> Proceed
# Exit 1 = FAIL -> Fix -> Re-run
```

**9. RUN NAVIGATION COMPONENT VERIFICATION (NEW - v16)**

Check navigation components for feature groups:

```bash
# From Agent 5 v29 Section 7
bash scripts/verify-navigation-components.sh

# Checks:
# - Feature groups with >=3 pages have navigation component
# - Navigation component imported in all pages
# - Example: Settings with 5 pages needs settings-navigation.tsx

# Exit 0 = PASS -> Proceed
# Exit 1 = FAIL -> Fix -> Re-run (or OK if no multi-page features)
```

---

## CRITICAL PATTERN AWARENESS

**[CRITICAL] Replit Deployment Patterns (Constitution v4.4):**

| Pattern | Requirement | Verification |
|---------|-------------|--------------|
| Server Binding | DEV: 127.0.0.1, PROD: 0.0.0.0, NEVER localhost | `grep -E "(0\.0\.0\.0\|127\.0\.0\.1)" server/index.ts` |
| Vite Port | 5000 (NOT 5173 default) + strictPort: true | `grep -q "port.*5000" vite.config.ts` |
| Vite Proxy | 127.0.0.1 (NOT localhost) | `grep "127\.0\.0\.1" vite.config.ts` |
| Redis Port | Port 6380 (not 6379) | `REDIS_PORT=6380` in .env |
| Seed Script | Auth apps need admin user seed | `[ -f "scripts/seed-admin.ts" ]` |
| Navigation Components | Feature groups >=3 pages need nav | Check UI spec Section 7 |

**[CRITICAL] Security Patterns:**

| Pattern | Rule | Detection |
|---------|------|-----------|
| Cryptographic Randomness | crypto.randomBytes(), NOT Math.random() | `grep -r "Math\.random()" server/` |
| JWT Fail-Fast | throw new Error if missing | `grep -A3 "JWT_SECRET" server/lib/*.ts \| grep "throw"` |
| HTTP-only Cookies | Set tokens in cookies, NOT response body | `grep "httpOnly.*true" server/routes/auth.routes.ts` |
| Encryption Fail-Fast | throw new Error if missing | `grep -A3 "ENCRYPTION_KEY" server/lib/encryption.ts \| grep "throw"` |
| File Upload Security | MIME validation + crypto filenames | `grep "fileFilter" server/middleware/upload.ts` |
| Parameter Validation | requireIntParam, NOT parseInt(req.params) | `grep "parseInt(req\.params" server/routes/ && exit 1` |

**[CRITICAL] Code Completeness Patterns (NEW - v16):**

| Pattern | Rule | Detection |
|---------|------|-----------|
| NO TODO Comments | Absolutely forbidden | `grep -rE "// TODO" server/ client/src/ && exit 1` |
| NO FIXME Comments | Absolutely forbidden | `grep -rE "// FIXME" server/ client/src/ && exit 1` |
| NO Placeholder Data | Routes must return real data | `grep -r "placeholder" server/routes/ && exit 1` |
| Route-Service Wiring | Every route imports service | `grep "from.*services" server/routes/*.routes.ts` |
| Service Calls | Routes must call services | Check for service function calls |

**[CRITICAL] Multi-Tenant Isolation:**

```typescript
// FORBIDDEN: Missing organizationId filter
db.select().from(projects);

// REQUIRED: organizationId filter
db.select().from(projects)
  .where(and(
    eq(projects.organizationId, orgId),
    isNull(projects.deletedAt)
  ));
```

**[CRITICAL] Database Transactions:**

Multi-step operations MUST use `db.transaction()`:

```typescript
// REQUIRED pattern (from Data Model Section 8.3)
export async function register(data: RegisterInput) {
  return await db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values(data).returning();
    await tx.insert(organizationMembers).values({
      organizationId: data.organizationId,
      userId: user.id,
      role: 'MEMBER'
    });
    return user;
  });
}
```

**[CRITICAL] Route-Service Wiring (NEW - v16):**

```typescript
// REQUIRED pattern
import * as ResourceService from '../services/resource.service.js';

router.post('/', authenticate, asyncHandler(async (req, res) => {
  // MUST call service function
  const result = await ResourceService.create({
    name: req.body.name,
    organizationId: req.user!.organizationId
  });
  return sendSuccess(res, { resource: result }, 201);
}));

// FORBIDDEN: Business logic in route
router.post('/', authenticate, asyncHandler(async (req, res) => {
  // DON'T do this
  const result = await db.insert(resources).values(req.body);
  return sendSuccess(res, result);
}));

// FORBIDDEN: TODO/placeholder
router.post('/', authenticate, asyncHandler(async (req, res) => {
  // TODO: Implement
  return sendSuccess(res, { id: 1 });
}));
```

---

## AGENT SPECIFICATION REFERENCES

**Read these documents in order:**

| Agent | Version | Document | Key Sections |
|-------|---------|----------|--------------|
| Agent 0 | v4.4 | Constitution | Shared standards, ports, JWT |
| Agent 1 | v20 | Product Definition | User stories, features |
| Agent 2 | v27 | Architecture | ADRs, HTTP-only cookies (NEW) |
| Agent 3 | v24 | Data Model | Schema manifest, transactions (NEW) |
| Agent 4 | v32 | API Contract | Exact endpoint counts (NEW) |
| Agent 5 | v29 | UI Specification | Navigation components (NEW) |
| Agent 6 | v49 | Implementation Plan | TODO prohibition, route wiring (NEW) |
| Agent 7 | v33 | QA & Deployment | 11 verification scripts (NEW) |
| Agent 8 | v36 | Code Review | 73 audit patterns |

**Critical Updates in v16:**
- **Agent 2 v27:** Complete HTTP-only cookie implementation with code examples
- **Agent 3 v24:** Schema file manifest + per-function transaction requirements
- **Agent 4 v32:** Per-resource exact endpoint counts (not minimum)
- **Agent 5 v29:** Navigation component requirements for feature groups >=3 pages
- **Agent 6 v49:** Absolute TODO prohibition + route-to-service wiring
- **Agent 7 v33:** 11 verification scripts (was 9)

---

## MANDATORY FILES (10 Total)

**From Agent 6 v49 Mandatory File Manifest:**

| File | Purpose | Pattern | Verification |
|------|---------|---------|--------------|
| server/lib/validation.ts | Parameter validation (3 functions) | Pattern 2 | `grep -c "requireIntParam\|parseQueryInt\|parsePositiveInt"` |
| server/lib/response.ts | Response envelopes | Pattern 3 | `grep -c "sendSuccess\|sendError"` |
| server/lib/encryption.ts | AES-256-GCM encryption | Pattern 8 | `grep -q "ENCRYPTION_KEY" && grep -q "encrypt\|decrypt"` |
| server/errors/index.ts | Custom error classes | Pattern 4 | `grep -c "NotFoundError\|UnauthorizedError"` |
| server/middleware/error-handler.ts | Global error handler | Pattern 4 | `grep -q "errorHandler"` |
| server/middleware/upload.ts | File upload w/ MIME validation | Pattern 9 | `grep -q "fileFilter"` |
| server/db/index.ts | Database connection (pg driver) | Pattern 1 | `grep -q "drizzle.*pg"` |
| server/workers/job-processor.ts | Background job polling | Pattern 10 | `grep -q "pollAndProcessJobs"` |
| server/index.ts | Server entry w/ network binding | Pattern 7 | `grep -E "0\.0\.0\.0\|127\.0\.0\.1"` |
| client/src/components/error-boundary.tsx | React error boundary | Pattern 5 | `grep -q "ErrorBoundary"` |

**All 10 files MUST have FULL implementation (not skeleton with TODO).**

---

## AGENT 8 AUTO-FIX LOOP (NEW)

**[CRITICAL]** After Agent 7 gates pass, Agent 8 runs automatically with iterative fixing.

### Configuration

**AUTO_FIX_MODE = true** (default)

Agent 8 runs in auto-fix mode after Phase 8 + Agent 7 gates complete.

### Workflow

```bash
#!/bin/bash
# Agent 8 Auto-Fix Loop

echo "=== Agent 8: Comprehensive Audit & Auto-Fix ==="
echo ""

MAX_ITERATIONS=3
ITERATION=1

while [ $ITERATION -le $MAX_ITERATIONS ]; do
  echo "--- Iteration $ITERATION ---"
  
  # Run Agent 8 comprehensive audit (79 patterns)
  # Output: JSON format with auto-fix metadata
  agent8-audit --output=audit-iteration-$ITERATION.json
  
  # Parse results
  TOTAL=$(jq '.summary.total_issues' audit-iteration-$ITERATION.json)
  CRITICAL=$(jq '.summary.critical' audit-iteration-$ITERATION.json)
  HIGH=$(jq '.summary.high' audit-iteration-$ITERATION.json)
  FIXABLE=$(jq '[.issues[] | select(.auto_fixable==true and .fix_confidence=="HIGH")] | length' audit-iteration-$ITERATION.json)
  
  echo "Issues found: $TOTAL (Critical: $CRITICAL, High: $HIGH)"
  echo "Auto-fixable: $FIXABLE"
  echo ""
  
  # If no issues, we're done
  if [ "$TOTAL" -eq 0 ]; then
    echo "[OK] No issues found - build complete"
    exit 0
  fi
  
  # If issues but not fixable or last iteration, block
  if [ "$FIXABLE" -eq 0 ] || [ $ITERATION -eq $MAX_ITERATIONS ]; then
    echo "[X] Issues found that cannot be auto-fixed"
    echo ""
    echo "Manual intervention required:"
    cat audit-iteration-$ITERATION.json | jq -r '.issues[] | "  [\(.severity)] \(.title) - \(.file):\(.line)"'
    exit 1
  fi
  
  # Auto-fix high-confidence issues
  echo "? Applying auto-fixes..."
  agent8-autofix --input=audit-iteration-$ITERATION.json --confidence=HIGH
  
  # Re-run verification scripts that might have been affected
  echo "? Re-running verification scripts..."
  bash scripts/verify-all.sh || {
    echo "[X] Auto-fix broke verification scripts"
    exit 1
  }
  
  echo ""
  ITERATION=$((ITERATION + 1))
done

echo "[X] Max iterations reached with remaining issues"
exit 1
```

### Agent 8 JSON Output Format

```json
{
  "summary": {
    "total_issues": 2,
    "critical": 0,
    "high": 1,
    "medium": 1,
    "low": 0,
    "auto_fixable": 2,
    "manual_only": 0
  },
  "issues": [
    {
      "id": "PATTERN-05-001",
      "pattern": 5,
      "pattern_name": "N+1 Query Detection",
      "severity": "HIGH",
      "file": "server/services/project.service.ts",
      "line": 45,
      "column": 12,
      "issue": "Loop calling db.select() - potential N+1 query",
      "code_snippet": "for (const project of projects) {\n  const owner = await db.select().from(users).where(eq(users.id, project.ownerId));\n}",
      "explanation": "This loop executes a database query for each project, resulting in N+1 queries total (1 for projects + N for owners). This causes severe performance degradation.",
      "fix": "Use a JOIN or WHERE IN clause to fetch all owners in a single query",
      "fix_code": "const ownerIds = projects.map(p => p.ownerId);\nconst owners = await db.select().from(users).where(inArray(users.id, ownerIds));\nconst ownerMap = new Map(owners.map(o => [o.id, o]));",
      "fix_confidence": "HIGH",
      "auto_fixable": true,
      "references": [
        "Agent 8 v41 Pattern 5",
        "Agent 7 v45 Gate: verify-n-plus-one-queries.sh"
      ]
    },
    {
      "id": "PATTERN-19-003",
      "pattern": 19,
      "pattern_name": "SQL Injection Vector",
      "severity": "MEDIUM",
      "file": "server/services/search.service.ts",
      "line": 89,
      "column": 25,
      "issue": "String concatenation in SQL query - injection risk",
      "code_snippet": "const query = `SELECT * FROM projects WHERE name LIKE '%${searchTerm}%'`;",
      "explanation": "User input (searchTerm) is concatenated directly into SQL query without sanitization, allowing SQL injection attacks.",
      "fix": "Use parameterized queries with Drizzle ORM's like() operator",
      "fix_code": "const results = await db.select().from(projects).where(like(projects.name, `%${searchTerm}%`));",
      "fix_confidence": "HIGH",
      "auto_fixable": true,
      "references": [
        "Agent 8 v41 Pattern 19",
        "Agent 7 v45 Gate: verify-no-sql-injection.sh"
      ]
    }
  ],
  "patterns_checked": 79,
  "patterns_passed": 77,
  "patterns_failed": 2,
  "execution_time_ms": 8450,
  "timestamp": "2026-01-27T21:45:00Z"
}
```

### Auto-Fix Logic

**High-Confidence Fixes (AUTO_FIXABLE=true):**
- N+1 queries -> Single query with JOIN/WHERE IN
- SQL injection -> Parameterized queries
- Missing error handling -> try-catch blocks
- Stub implementations -> Complete implementations
- Missing pagination -> BaseService extension
- Hardcoded secrets -> Environment variables
- Blocking operations -> Async alternatives
- Missing validation -> Zod schemas

**Manual-Only (AUTO_FIXABLE=false):**
- Architectural issues (requires design decisions)
- Complex business logic errors
- Performance optimizations (context-dependent)
- UI/UX improvements
- Code organization/structure

### Expected Outcomes

| Iteration | v18 Expected | Action |
|-----------|--------------|--------|
| **Iteration 1** | **0 issues** | No fixes needed (99.5% prevention via 52 scripts) |
| Iteration 2 | 0-1 issues | Auto-fix if found, re-audit |
| Iteration 3 | 0 issues | Rare - only if Iteration 2 fixes incomplete |

**Success Rate:**
- 99.5% of builds: Iteration 1 = 0 issues (immediate pass)
- 0.5% of builds: Iteration 2 fixes edge case, then 0 issues
- <0.1% of builds: Manual intervention required (architectural issues)

### Integration with Agent 7

**Agent 7 prevents 99.5% of issues (52 verification scripts)**  
-> Agent 8 validates remaining 0.5% (subjective/architectural patterns)  
-> Auto-fix remediates any issues found  
-> Result: **0 issues guaranteed at deployment**

---

## FINAL VERIFICATION CHECKLIST

**Before Agent 8 auto-fix, run ALL Agent 7 verification scripts:**

```bash
#!/bin/bash
# Complete verification checklist (48 scripts - UPDATED v18)

echo "=== Running All Verification Scripts (Agent 7 v45) ==="

# Phase gates (7 scripts)
for i in {1..7}; do
  bash scripts/verify-phase-$i.sh || exit 1
done

# Architecture compliance
bash scripts/verify-adr-compliance.sh || exit 1
bash scripts/verify-file-manifest.sh || exit 1

# Code completeness
bash scripts/verify-no-placeholders.sh || exit 1

# Data layer compliance
bash scripts/verify-schema-count.sh || exit 1
bash scripts/verify-transactions.sh || exit 1

# Service-first validation (v17)
bash scripts/verify-route-service-contract.sh || exit 1
bash scripts/verify-service-stubs.sh || exit 1
bash scripts/verify-pagination.sh || exit 1
bash scripts/verify-mandatory-files.sh || exit 1

# UI compliance
bash scripts/verify-navigation-components.sh || exit 1

# CRITICAL patterns (NEW - 5 scripts)
bash scripts/verify-n-plus-one-queries.sh || exit 1
bash scripts/verify-error-boundary-complete.sh || exit 1
bash scripts/verify-transaction-boundaries.sh || exit 1
bash scripts/verify-cors-config.sh || exit 1
bash scripts/verify-rate-limiting.sh || exit 1

# HIGH patterns (NEW - 10 scripts)
bash scripts/verify-no-sensitive-logs.sh || exit 1
bash scripts/verify-jwt-config.sh || exit 1
bash scripts/verify-no-sql-injection.sh || exit 1
bash scripts/verify-env-vars.sh || exit 1
bash scripts/verify-upload-limits.sh || exit 1
bash scripts/verify-db-pooling.sh || exit 1
bash scripts/verify-no-blocking-ops.sh || exit 1
bash scripts/verify-zod-coverage.sh || exit 1
bash scripts/verify-soft-deletes.sh || exit 1
bash scripts/verify-rbac-coverage.sh || exit 1

# MEDIUM patterns (NEW - 5 scripts)
bash scripts/verify-console-locations.sh || exit 1
bash scripts/verify-dependency-audit.sh || exit 1
bash scripts/verify-email-templates.sh || exit 1
bash scripts/verify-search-indexes.sh || exit 1
bash scripts/verify-navigation-a11y.sh || exit 1

# Final check
bash scripts/self-audit.sh || exit 1

echo ""
echo "[OK] All verification scripts passed (48 total)"
echo "Ready for Agent 8 auto-fix"
```

**Then Agent 8 Auto-Fix runs automatically:**

```bash
# Agent 8 comprehensive audit + auto-fix (NEW)
bash scripts/agent8-autofix-loop.sh || exit 1

echo ""
echo "[OK] Agent 8 auto-fix complete (0 issues)"
echo "DEPLOYMENT READY"
```

**Total Verification Steps: 48 scripts + Agent 8 auto-fix**
- 7 phase gates
- 2 architecture compliance
- 1 code completeness
- 2 data layer compliance
- 4 service-first validation (v17)
- 1 UI compliance
- 5 CRITICAL patterns (v18)
- 10 HIGH patterns (v18)
- 5 MEDIUM patterns (v18)
- 1 self-audit
- **1 Agent 8 auto-fix loop (v18)**

**All MUST pass before deployment.**

---

## QUALITY TARGETS (UPDATED v18)

**Expected Agent 8 Audit Results:**

| Metric | Pre-v26 | v26-v38 | v49 (v16) | v49 (v17) | **v48+ (v18)** |
|--------|---------|---------|-----------|-----------|----------------|
| Agent 8 Issues | 7-15 | 3-7 | <3 | 0-1 | **0** |
| Critical Issues | 2-4 | 0-1 | 0 | 0 | **0** |
| High Issues | 3-6 | 1-3 | <2 | 0-1 | **0** |
| Medium Issues | 2-5 | 1-3 | <1 | 0 | **0** |
| Build Time | 100% | 100% | 100% | 100% | **75%** |
| Manual Fixes | Many | Some | Few | 0-1 | **0** |

**Quality Standards:**
- [OK] Concurrent execution: **25% faster builds** (NEW)
- [OK] Auto-fix enabled: **0 manual intervention** (NEW)
- [OK] Prevention rate: **99.5% via 48 scripts** (NEW)
- [OK] Service contracts: **100% routes match Agent 4 Section 6** (v17)
- [OK] Stub detection: **0 stub implementations** (v17)
- [OK] Pagination: **100% list endpoints paginated** (v17)
- [OK] File completeness: **ALL mandatory files exist** (v17)
- [OK] Code completeness: **0 TODO/FIXME/placeholder** (v16)
- [OK] Route wiring: **100% routes call services** (v16)
- [OK] Endpoint count: **EXACT match to spec**
- [OK] Schema count: **EXACT table-to-file mapping**
- [OK] Transaction coverage: **100% on required functions**
- [OK] Navigation: **All feature groups >=3 pages covered**
- [OK] Security patterns: **100% compliance**
- [OK] ADR compliance: **100% (9 ADRs)**
- [OK] Logging: **<10 console statements**

**v18 Impact:**
- **Performance:** 25% faster (concurrent execution)
- **Automation:** 100% (auto-fix eliminates manual work)
- **Quality:** 0 issues (99.5% prevention + auto-fix)
- **Developer Experience:** Deploy on first attempt, zero debugging

---

## CRITICAL REMINDERS

**What Changed in v18 (Concurrent Execution + Auto-Fix):**

1. **CONCURRENT EXECUTION ENABLED**
   - 3 threads run in parallel after Phase 1
   - Thread A: Services -> Routes (sequential within)
   - Thread B: Database schema
   - Thread C: Components -> Pages (sequential within)
   - ALL threads MUST complete before Phase 6

2. **SYNCHRONIZATION CRITICAL**
   - Phase 6 depends on Threads A + B
   - Phase 8 depends on ALL threads
   - Agent 8 depends on Phase 8 complete
   - DO NOT skip synchronization points

3. **AGENT 8 AUTO-FIX LOOP**
   - Runs automatically after Agent 7 gates
   - Max 3 iterations: Audit -> Fix -> Re-audit
   - High-confidence fixes only (95%+ success rate)
   - Expected: Iteration 1 = 0 issues (99.5% prevention)

4. **48 VERIFICATION SCRIPTS**
   - 28 from v17 (base + service-first)
   - 20 NEW from Agent 8 patterns (v18)
   - Prevent 99.5% of issues before Agent 8
   - Must ALL pass before auto-fix runs

**What Changed in v17 (Service-First Architecture):**

1. **SERVICE CONTRACTS BEFORE IMPLEMENTATION**
   - Read Agent 4 v35.1 Section 6 FIRST (Step 0.6)
   - Service file names EXACT (datasource.service.ts not data-source)
   - Function names EXACT (login not loginUser)
   - Parameter order EXACT (orgId, userId, data)

2. **SERVICES BEFORE ROUTES**
   - Phase 2: Implement ALL services first
   - Phase 3: Implement routes calling services
   - verify-service-stubs.sh blocks stub implementations
   - verify-route-service-contract.sh validates alignment

3. **PAGINATION ENFORCEMENT**
   - All list endpoints extend BaseService
   - BaseService enforces pagination pattern
   - verify-pagination.sh checks compliance
   - No unbounded queries allowed

4. **MANDATORY FILE COMPLETENESS**
   - 24 base infrastructure files
   - Dynamic files from Agents 3-5 specs
   - verify-mandatory-files.sh validates ALL files
   - File counts must match spec counts EXACTLY

**Defects Prevented (v17 - 25/27 issues, 96% reduction):**
- Route-service import path mismatches (59% of issues)
- Route-service function name mismatches (59% of issues)
- Route-service parameter count mismatches (59% of issues)
- Stub implementations (always throw) (11% of issues)
- TODOs in service function bodies (11% of issues)
- Unbounded queries (no pagination) (22% of issues)
- Missing config/infrastructure files (4% of issues)

**What Changed in v16 (Code Completeness Focus):**

1. **ABSOLUTE TODO PROHIBITION**
   - Build blocks if ANY TODO/FIXME/PLACEHOLDER found
   - All code must be 100% complete
   - No stub implementations allowed

2. **ROUTE-TO-SERVICE WIRING**
   - Every route MUST import service
   - Every route MUST call service function
   - Business logic in services, NOT routes

3. **EXACT COUNT VERIFICATION**
   - Endpoint counts must EQUAL spec (not ?)
   - Schema files must match tables EXACTLY
   - No tolerance for missing implementations

4. **HTTP-ONLY COOKIES**
   - Complete auth route examples
   - Tokens in cookies, NOT response body
   - Cookie middleware pattern

5. **SCHEMA FILE MANIFEST**
   - 1:1 table-to-file mapping
   - Naming conventions enforced
   - Index.ts exports verified

6. **TRANSACTION VERIFICATION**
   - Specific functions from Data Model Section 8.3
   - db.transaction() wrapper required
   - Multi-table operations covered

7. **NAVIGATION COMPONENTS**
   - Feature groups >=3 pages need navigation
   - Component integrated in all pages
   - Role-based visibility supported

**Defects Prevented (8 total):**
- CRIT-001: Routes not wired to services
- CRIT-002: Missing HTTP-only cookies
- CRIT-003: Endpoint count mismatch
- HIGH-001: Missing navigation components
- HIGH-002: localhost in config
- HIGH-003: Table/schema count mismatch
- HIGH-004: Services never called
- MED-001: Missing transaction wrappers

**Zero Tolerance:** Build fails if verification scripts don't pass.

---

## DOCUMENT END

**Claude Code Master Build Prompt Complete**

**What Changed (Latest):**
- **SPEC STACK INTEGRITY:** Pre-flight specification validation before code generation
- Added Phase 0.0: Spec stack validation (Gate #53 from Agent 7 v45)
- Gate #53 validates specs BEFORE file creation: ASCII encoding, no localhost, constitution format, Document End versions, cross-ref consistency
- Agent versions updated: Agent 6 v49 (Patterns 80-82), Agent 7 v45 (Gate #53), Agent 8 v41 (82 patterns)
- Constitution reference updated to non-versioned format (Agent 0 v4.5 compliance)
- Removed mojibake encoding: replaced all emoji with ASCII equivalents ([OK], [X], [WARN])
- Fixed localhost references: now use 127.0.0.1 for dev proxy, database connections, CORS origins
- Meta-protection: validates specification stack before validating code

**Prevention-First Framework:**
```
Phase 0.0: Spec validation (NEW)
    ?
Phase 0.1-0.5: File creation (v19)
    ?
Phases 1-8: Code generation + progressive gates (53 total)
    ?
Agent 8: Optional audit (v19 default: false)
    ?
Deployment: 0 issues
```

**Quality Target:** 0 issues (100% prevention via spec validation + file templates + 53 gates)

**Expected Outcome:** 
- Spec stack validated before code generation begins
- 23 Foundry v32 spec drift issues prevented
- Deploy on first attempt, zero debugging, zero manual fixes

**Verification:** 53 scripts (52 + 1 meta-validator) + Agent 8 optional audit

---

**Framework v49/v45/v20 Ready for Production**
- Spec stack validation for consistency
- Prevention-first architecture
- Zero-issue deployments guaranteed
