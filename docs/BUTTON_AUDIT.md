# Button, link, filter, and menu audit

## Verification scope

**Overall: PASS for implementation checks.** Verified with 21 backend API tests (including 503 live-mode fail-closed behavior), frontend route and interaction smoke tests, ESLint, and a production Vite build. The UI tests run in jsdom; visual review in a real browser and end-to-end clipboard/download dialogs were not automated. PASS below means the control has a concrete handler/destination and its owning route/build was verified; rows called out as interaction-tested were directly exercised by a UI test.

No control invokes an AWS SDK or executes an AWS CLI command. CLI controls only copy text. RAM what-if controls call the pure simulation endpoint and show “Simulation – no AWS changes made.”

| # | Page / surface | Label or control | Expected behavior | Result |
|---:|---|---|---|---|
| 1 | Login | Email | Accepts a required email value for demo sign-in | PASS — form validation and route smoke |
| 2 | Login | Password | Accepts a required password of at least eight characters | PASS — form validation and route smoke |
| 3 | Login | Continue to dashboard | Calls `/api/auth/demo-login`; displays inline failure or navigates to Dashboard | PASS — interaction-tested |
| 4 | Global header | CloudShare Manager | Navigates to Dashboard | PASS — route destination verified |
| 5 | Global header | Ctrl+K | Opens global command palette | PASS — keyboard shortcut interaction-tested |
| 6 | Command palette | Search pages, resources, or actions | Filters page, resource, and action entries | PASS — route/resource navigation interaction-tested |
| 7 | Command palette | Page/resource entries | Navigate to Dashboard, Accounts, Network, RAM, EC2, Security Groups, NACLs, IP Addressing, CloudTrail, CloudWatch, Architecture, Documentation, RAM walkthrough, Setup checklist, CLI library, Security posture, CIDR calculator, Mini quiz, Presentation; resource aliases navigate to their associated resource pages | PASS — destinations verified; all page routes smoke-tested |
| 8 | Command palette | Export report | Fetches current dashboard and downloads a JSON report; reports errors in a toast | PASS — handler verified |
| 9 | Command palette | Toggle theme | Toggles and persists the light/dark theme | PASS — handler verified |
| 10 | Global header | Open notifications | Opens/closes the recent DEMO DATA notification panel | PASS — handler verified |
| 11 | Global header | Toggle theme | Toggles and persists the light/dark theme | PASS — handler verified |
| 12 | Global header | Logout | Clears local demo identity and returns to Login | PASS — handler verified |
| 13 | Breadcrumb | Home | Navigates to Dashboard | PASS — route destination verified |
| 14 | Sidebar / mobile menu | Dashboard, Accounts, Network, RAM, EC2, Security Groups, NACLs, IP Addressing, CloudTrail, CloudWatch, Architecture, Documentation, How RAM works, Setup checklist, CLI command library, Security posture, CIDR calculator, Mini quiz, Presentation mode | Navigates to the corresponding route; mobile menu closes after selection | PASS — all destination routes smoke-tested |
| 15 | Mobile layout | Menu | Opens/closes the responsive route drawer | PASS — handler and destinations verified |
| 16 | Mobile layout | Viva / Presentation | Opens Presentation mode | PASS — route destination verified |
| 17 | Dashboard | Export report | Downloads current dashboard response as JSON; disabled until data is loaded | PASS — handler verified |
| 18 | Dashboard | Stat cards / CPU and network charts | Display current summary and read-only monitoring; chart tooltips are hover-only | PASS — dashboard route and build verified |
| 19 | Accounts | Mask account IDs / Show account IDs | Masks/unmasks IDs and persists the preference in local storage | PASS — interaction-tested |
| 20 | Accounts | Search Accounts | Filters account rows locally | PASS — interaction-tested |
| 21 | Accounts table | Name, Account ID, Type, Status header buttons | Sorts by selected column | PASS — handler verified |
| 22 | Accounts table | Previous / Next | Pages through filtered rows | PASS — handler verified |
| 23 | Accounts | View interactive account topology | Opens Architecture | PASS — destination verified |
| 24 | Network | Explore interactive network topology | Opens Architecture | PASS — destination verified |
| 25 | RAM | Walk through the share lifecycle | Opens RAM walkthrough | PASS — destination verified |
| 26 | NACLs | Review demo security group findings | Opens Security Groups | PASS — destination verified |
| 27 | IP Addressing | CIDR calculator | Opens CIDR calculator | PASS — destination verified |
| 28 | CloudTrail | Event name, account, from date, to date, status | Sends filters to the API and refreshes the visible event list | PASS — API validation and route verified |
| 29 | CloudTrail table | Search CloudTrail events | Filters event rows locally | PASS — handler verified |
| 30 | CloudTrail table | Event, Account, Status, Timestamp header buttons | Sorts event rows | PASS — handler verified |
| 31 | CloudTrail table | Previous / Next | Pages through filtered event rows | PASS — handler verified |
| 32 | CloudTrail | Refresh | Re-fetches filtered DEMO DATA and shows a notification | PASS — handler verified |
| 33 | CloudTrail | Export CSV | Downloads currently displayed events as a client-side CSV | PASS — handler verified |
| 34 | CloudWatch | Metric time range | Loads 1h, 6h, or 24h demo metrics | PASS — API and route verified |
| 35 | CloudWatch | Pause refresh / Resume refresh | Pauses or resumes the eight-second local metric variation timer | PASS — handler verified |
| 36 | Architecture | Org, Account 1, VPC, Subnet, RAM, Account 2, EC2, SG, NACL, CloudTrail, CloudWatch nodes | Opens a details drawer for the selected node | PASS — RAM drawer interaction-tested; every node is keyboard-operable |
| 37 | Architecture drawer | Close | Closes the details drawer | PASS — handler verified |
| 38 | Architecture drawer | Open resource page | Navigates to the node’s resource page and closes the drawer | PASS — destination verified |
| 39 | Architecture | View the RAM sharing walkthrough | Opens RAM walkthrough | PASS — destination verified |
| 40 | RAM walkthrough | Step 1–5 | Selects the corresponding educational lifecycle step | PASS — handler verified |
| 41 | RAM walkthrough | Previous / Next | Moves through the lifecycle stepper | PASS — handler verified |
| 42 | RAM walkthrough | Copy | Copies the displayed CLI reference; never runs it; shows copy feedback | PASS — implementation verified |
| 43 | RAM simulator | Org sharing, same Org, subnet shared, SSH allowed checkboxes | Updates only the local what-if inputs | PASS — route and simulation API tested |
| 44 | RAM simulator | Run local simulation | Calls the local simulation endpoint and displays launch-vs-SSH outcome; no AWS changes | PASS — interaction/API tested |
| 45 | Setup checklist | Seven completion checkboxes | Persists review state in local storage and updates the progress ring | PASS — implementation verified |
| 46 | Setup checklist | Seven checklist item headings | Expands/collapses console paths and CLI reference commands | PASS — implementation verified |
| 47 | Setup checklist | Copy | Copies the displayed CLI text only | PASS — implementation verified |
| 48 | CLI command library | Copy on each command card | Copies the selected AWS CLI command; does not execute it | PASS — implementation verified |
| 49 | Security posture | Refresh assessment | Re-fetches security group and NACL demo rules and recalculates findings | PASS — handler and route verified |
| 50 | CIDR calculator | CIDR input | Accepts CIDR text and requires a value | PASS — form validation verified |
| 51 | CIDR calculator | Calculate | Calls the pure CIDR endpoint; shows results or input errors | PASS — API and route tested |
| 52 | Mini quiz | Eight question groups / 24 answer options | Selects one answer per question | PASS — implementation verified |
| 53 | Mini quiz | Check answers | Enabled only when all questions are answered; shows feedback and score | PASS — implementation verified |
| 54 | Presentation | Exit presentation | Returns to Dashboard | PASS — route destination verified |
| 55 | Presentation | Open architecture / RAM / EC2 / monitoring links | Opens the corresponding information page | PASS — destination verified |
| 56 | Presentation | Previous slide / Next slide / five slide selectors | Changes the active slide; keyboard Left/Right also works | PASS — keyboard interaction-tested |
| 57 | Documentation | Print / Save as PDF | Opens the browser print dialog; print stylesheet hides application chrome | PASS — handler and stylesheet verified |
| 58 | 404 page | Return to dashboard | Navigates to Dashboard (protected route redirects to Login if needed) | PASS — route destination verified |
| 59 | Shared error toast | Retry | Replays the failed API request and surfaces any subsequent error | PASS — handler verified |
| 60 | Shared error/info toast | Dismiss notification | Dismisses the visible toast | PASS — handler verified |

## Test results

- Backend: `npm --prefix backend test` — **22 passed, 0 failed**.
- Frontend: `npm --prefix frontend test` — **26 passed, 0 failed** (route smoke tests plus core interaction checks).
- Frontend lint: `npm --prefix frontend run lint` — **0 errors, 0 warnings**.
- Frontend production build: `npm --prefix frontend run build` — **passed**; chart library is code-split.
- Production dependency audit: `npm audit --omit=dev` and backend equivalent — **0 production advisories reported**.
