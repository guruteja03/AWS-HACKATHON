# CloudShare Manager

**AWS Multi-Account Resource Sharing & Network Monitoring** — an educational full-stack college project about sharing an Amazon VPC subnet across AWS accounts with AWS Resource Access Manager (RAM).

The real AWS setup described by the project was performed manually in the AWS console. This application visualizes that setup with a fixed, in-memory demo dataset. **Mock mode is the default and needs no AWS account, credentials, or network access to AWS.** No application action creates, changes, or deletes AWS resources.

## Problem statement and objectives

Teams sometimes need workloads in separate AWS accounts to use common network infrastructure while retaining account boundaries. This project illustrates the ownership and consumption model for sharing a subnet with RAM, and presents related EC2, security group, network ACL, CloudTrail, and CloudWatch information in one place.

Objectives:
- Show a management-account and member-account relationship and an illustrative subnet share flow.
- Document the manual AWS setup and provide reference-only AWS CLI commands.
- Highlight a demo security group rule that exposes SSH to `0.0.0.0/0`.
- Provide local-only calculations, a setup checklist, posture guidance, an educational quiz, and mock monitoring.

## Architecture

```text
React + Vite (5173)
  ├── React Router pages, charts, local-only demo tools
  └── Axios → Express JSON API (5000/api)
        ├── Controllers → service modules
        └── Repository interface → in-memory demo data
```

The frontend reads API data; simulation and CIDR operations are calculations only. CloudTrail and CloudWatch views carry a **DEMO DATA** label. “Demo Mode” is read from `/api/health`.

## Technology

- Frontend: React, Vite, React Router, Axios, Tailwind CSS, lucide-react, Recharts
- Backend: Node.js, Express, dotenv, cors, helmet, morgan, express-rate-limit, Zod, JSON Web Token
- Tests: Node's built-in test runner

## Folder structure

```text
backend/
  server.js
  src/{config,controllers,data,middleware,models,routes,services,utils}/
  test/api.test.js
  .env.example
frontend/
  src/{components,context,pages,services}/
  tailwind.config.js
README.md
docs/BUTTON_AUDIT.md
```

## Prerequisites and installation

Use Node.js 20.19+ or 22.12+ (Vite 8 requires a recent Node release) and npm.

### Windows PowerShell

```powershell
cd "C:\path\to\AWS HACK"
npm install
npm --prefix backend install
npm --prefix frontend install
Copy-Item backend\.env.example backend\.env
npm run dev
```

### macOS / Linux

```bash
cd "/path/to/AWS HACK"
npm install
npm --prefix backend install
npm --prefix frontend install
cp backend/.env.example backend/.env
npm run dev
```

Open <http://localhost:5173>. The frontend development server proxies `/api` to the backend on port 5000. Set `VITE_API_URL` to an absolute API URL for a separately hosted production deployment. Alternatively, run the frontend and backend separately:

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

Demo login (local educational account only):
- Email: `admin@example.com`
- Password: `Admin@123`

The demo login is not production authentication. It uses a JWT for local protected routes; replace it with Amazon Cognito or another production identity provider and use properly managed password hashes/secrets before deployment. The demo password is not an AWS credential.

## Environment variables

Set these in `backend/.env` (never commit `.env`):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | Express listen port |
| `USE_MOCK_DATA` | `true` | Keeps the application in no-AWS demo mode |
| `AWS_REGION` | `eu-north-1` | Future AWS SDK client region |
| `AWS_ACCESS_KEY_ID` | unset | Optional future credential-chain configuration; do not put credentials in frontend |
| `AWS_SECRET_ACCESS_KEY` | unset | Optional future credential-chain configuration; do not put credentials in frontend |
| `CORS_ORIGIN` | `http://localhost:5173` | Intended frontend origin |
| `JWT_SECRET` | demo-only fallback | Use a long random secret outside local demo development |
| `DEMO_EMAIL` | `admin@example.com` | Optional local demo account override |
| `DEMO_PASSWORD` | `Admin@123` | Optional local demo password override; never reuse a real password |
| `VITE_API_URL` | `/api` | Optional frontend API base URL; Vite proxies the default to `http://localhost:5000` in development |

## API

Responses use `{ "success": true, "data": ..., "meta": ... }` or `{ "success": false, "error": { "message": ..., "statusCode": ... } }`. Except for health and demo login, routes require the demo bearer token returned by login.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Mode, uptime, timestamp |
| POST | `/api/auth/demo-login` | Demo-only login (rate limited) |
| GET | `/api/dashboard` | Summary and associated demo resources |
| GET | `/api/accounts` | Organization account summary |
| GET | `/api/vpcs` | VPC list |
| GET | `/api/subnets` | Subnet list |
| GET | `/api/ram/resource-shares` | RAM share summary |
| GET | `/api/ec2/instances` | EC2 instance summary |
| GET | `/api/security-groups` | Security group rules |
| GET | `/api/network-acls` | Network ACL rules |
| GET | `/api/cloudtrail/events` | Events; filters: `eventName`, `account`, `status`, `from`, `to`, `page`, `limit` |
| GET | `/api/cloudwatch/metrics` | Demo metrics; `range=1h\|6h\|24h` |
| GET | `/api/architecture` | Diagram nodes and links |
| GET | `/api/ip-addressing` | Shared subnet addressing summary |
| POST | `/api/tools/cidr-calc` | Pure IPv4 CIDR calculation |
| POST | `/api/simulations/ram-share-check` | Local what-if simulation only |

## AWS representation and future integration

The fixture data represents:
- Sravanthi, management account `183079729972`; Chaitu, member account `818034793325`.
- Region `eu-north-1`, AZ `eu-north-1a`, VPC `10.0.0.0/16`, shared subnet `10.0.1.0/24`.
- Active RAM share `SharedSubnet`, resource type `ec2:Subnet`, owner Sravanthi and principal Chaitu.
- A running `t3.micro` mock member-account EC2 instance with private IP `10.0.1.144`.

Service files contain the exact AWS SDK v3 command TODOs for RAM, EC2, Organizations, CloudTrail, and CloudWatch. `USE_MOCK_DATA=false` intentionally returns HTTP 503 until actual service clients, credential-provider configuration, and error handling are implemented. Supplying credentials does not make this app live; it still returns 503. Do not enable live mode in production on the assumption that the TODOs are implemented.

Before live integration:
1. Add the appropriate AWS SDK v3 packages and lazily construct service clients only in live mode.
2. Prefer IAM roles/standard AWS credential providers over long-lived access keys.
3. Implement and test each TODO with pagination, timeouts, and least-privilege policies.
4. Remove the demo login and replace it with Cognito/OIDC or production-grade identity.
5. Configure allowed CORS origins, JWT/session secrets, audit logs, and deployment security.

Illustrative least-privilege policy starting point (scope resource ARNs and account access to your environment; validate exact actions before use):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ram:GetResourceShares",
        "ram:GetResourceShareAssociations",
        "ram:ListResources",
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets",
        "ec2:DescribeInstances",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeNetworkAcls",
        "organizations:ListAccounts",
        "cloudtrail:LookupEvents",
        "cloudwatch:GetMetricData"
      ],
      "Resource": "*"
    }
  ]
}
```

The policy is an educational starting point, not an authorization recommendation for every account. RAM, Organizations, EC2 describe, CloudTrail, and CloudWatch have different resource-level permission support; review the AWS Service Authorization Reference and constrain where supported.

## Features

- Responsive dashboard, account and resource pages, diagrams, breadcrumbs, account-ID masking, dark/light theme, search palette, and notification panel.
- Interactive architecture node drawer, RAM sharing walkthrough, reference-only command library (`/cli-commands`), local checklist, and presentation mode (`/presentation`).
- Local-only RAM simulator and CIDR calculator; subnet `/24` address heatmap.
- Mock security posture findings, mini quiz (`/quiz`), CloudTrail filters and CSV export, CloudWatch demo metric variation with pause/resume.
- JSON dashboard report export and print action on Documentation.

## Button audit and tests

- Full UI control inventory and status: [docs/BUTTON_AUDIT.md](./docs/BUTTON_AUDIT.md).
- Backend API contract tests: `npm --prefix backend test`.
- Root shortcut for API verification: `npm run test:api`.
- Frontend production build: `npm --prefix frontend run build`.

## Screenshots

Add screenshots of the dashboard, RAM flow, and interactive architecture diagram here after capturing the local demo.

## Troubleshooting

- **API is unavailable:** make sure `npm run dev` is running both apps and port 5000 is not occupied.
- **Login rejected:** use the local demo account shown above and verify `USE_MOCK_DATA=true`.
- **Browser blocks API requests:** keep the Vite proxy and backend port defaults, or set `VITE_API_URL` and configure the backend CORS origin.
- **Build fails on Node:** use a Node version supported by Vite 8.
- **Live mode returns 503:** expected; real AWS SDK clients are not implemented in this demo.

## Future enhancements

MongoDB-backed repositories, Cognito authentication, multi-region data, live AWS SDK read-only integration, alerts through SNS, and deployment-focused accessibility/security testing.
