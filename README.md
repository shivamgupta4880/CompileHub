# ⚡ CompileHub – Production-Ready Cloud-Native Online Code Editor

A modern, production-ready, full-stack online code editor built with the MERN stack. Features multi-language code execution (13+ languages), Monaco Editor integration, JWT authentication, containerized microservices, automated CI/CD, Kubernetes orchestration on AWS EKS, Infrastructure-as-Code with Terraform, configuration management with Ansible, and comprehensive monitoring with Prometheus, Grafana, and AWS CloudWatch.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AWS Cloud (us-east-1)                        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    VPC (10.0.0.0/16)                          │   │
│  │                                                               │   │
│  │  ┌─── Public Subnets ───┐    ┌─── Private Subnets ───┐      │   │
│  │  │  ALB (Internet-facing)│    │   EKS Node Group       │      │   │
│  │  │  NAT Gateway         │    │   ┌─────────────────┐  │      │   │
│  │  └───────────────────────┘    │   │ compilehub-server│  │      │   │
│  │            │                  │   │ (Express.js API) │  │      │   │
│  │            ▼                  │   ├─────────────────┤  │      │   │
│  │  ┌─────────────────┐         │   │ compilehub-client│  │      │   │
│  │  │  Ingress         │────────▶│   │ (React + Nginx)  │  │      │   │
│  │  │  Controller      │         │   ├─────────────────┤  │      │   │
│  │  └─────────────────┘         │   │ Prometheus       │  │      │   │
│  │                              │   │ Grafana          │  │      │   │
│  │                              │   └─────────────────┘  │      │   │
│  │                              └────────────────────────┘      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │   ECR    │  │CloudWatch│  │   S3 +   │  │  MongoDB Atlas   │   │
│  │ Registry │  │Logs/Alarm│  │CloudFront│  │  (External)      │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 19, Vite 8, Monaco Editor, Framer Motion |
| **Backend** | Node.js 20, Express.js 5, JWT Authentication |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Containerization** | Docker, Docker Compose, Multi-stage Builds |
| **Orchestration** | Kubernetes (AWS EKS), HPA, Ingress, RollingUpdate |
| **CI/CD** | GitHub Actions (3 workflows), Jenkins (Declarative Pipeline) |
| **IaC** | Terraform (VPC, EKS, ECR, ALB, IAM, CloudWatch) |
| **Config Management** | Ansible (Server Setup, Deployment, Monitoring) |
| **Monitoring** | Prometheus, Grafana (20-panel dashboard), AWS CloudWatch |
| **Cloud** | AWS (EKS, EC2, ECR, S3, CloudFront, ALB, CloudWatch, SNS) |

---

## 📦 Project Structure

```
compilehub/
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/              # Auth, Dashboard, Editor, Layout, UI
│   │   ├── context/                 # AuthContext, ThemeContext
│   │   ├── hooks/                   # useCodeExecution, useSnippets
│   │   ├── pages/                   # EditorPage
│   │   ├── services/                # Axios API client
│   │   ├── styles/                  # Global CSS design system
│   │   └── utils/                   # Language configs, constants
│   ├── Dockerfile                   # Multi-stage: Node build → Nginx serve
│   └── nginx.conf                   # Reverse proxy + static asset caching
│
├── server/                          # Express.js Backend
│   ├── config/db.js                 # MongoDB Atlas connection
│   ├── controllers/                 # auth, code, snippet controllers
│   ├── middleware/                   # JWT auth, error handler
│   ├── models/                      # User, Snippet (Mongoose)
│   ├── routes/                      # API route definitions
│   ├── utils/
│   │   ├── pistonClient.js          # Piston API + local fallback
│   │   ├── localRunner.js           # Multi-language local execution
│   │   └── metrics.js               # Prometheus metrics (prom-client)
│   ├── Dockerfile                   # Node + compilers (gcc, g++, JDK, Go, Rust)
│   ├── server.js                    # Express app + /metrics endpoint
│   └── testSuite.js                 # Integration test suite (8 tests)
│
├── k8s/                             # Kubernetes Manifests
│   ├── namespace.yaml
│   ├── client-deployment.yaml       # 2 replicas, RollingUpdate
│   ├── client-service.yaml          # ClusterIP
│   ├── server-deployment.yaml       # 2 replicas, Prometheus annotations
│   ├── server-service.yaml          # NodePort (30007)
│   ├── ingress.yaml                 # ALB Ingress (/api → server, / → client)
│   ├── hpa.yaml                     # Autoscale 2–10 pods (CPU 75%, Memory 80%)
│   └── monitoring/
│       ├── prometheus.yaml          # Prometheus Deployment + ConfigMap
│       ├── grafana.yaml             # Grafana Deployment + auto-provisioning
│       └── compilehub-dashboard.json # 20-panel Grafana dashboard
│
├── terraform/                       # Infrastructure as Code
│   ├── providers.tf                 # AWS + Kubernetes providers
│   ├── variables.tf                 # Region, project name, instance type, alerts
│   ├── vpc.tf                       # VPC, subnets, IGW, NAT, route tables
│   ├── eks.tf                       # EKS cluster + managed node group
│   ├── ecr.tf                       # ECR repositories + lifecycle policies
│   ├── alb.tf                       # ALB, target groups, security groups
│   ├── iam.tf                       # EKS, node, ALB, CloudWatch IAM roles
│   ├── cloudwatch.tf                # Log groups, alarms, SNS, dashboard
│   └── outputs.tf                   # Cluster endpoint, ECR URLs, ALB DNS
│
├── ansible/                         # Configuration Management
│   ├── ansible.cfg                  # Default settings
│   ├── inventory/hosts.ini          # EC2 host inventory
│   ├── playbooks/
│   │   ├── setup-server.yml         # OS setup, Node.js, Docker, compilers, UFW
│   │   ├── deploy-app.yml           # Git pull, npm install, PM2 zero-downtime reload
│   │   └── install-monitoring.yml   # CloudWatch Agent + Node Exporter
│   └── templates/
│       ├── env.j2                   # .env Jinja2 template (vault secrets)
│       └── cloudwatch-agent-config.json.j2
│
├── monitoring/                      # Docker Compose Monitoring (Local Dev)
│   ├── prometheus-local.yml         # Scrape config for local containers
│   └── grafana/provisioning/        # Auto-provision datasource + dashboards
│
├── .github/workflows/               # GitHub Actions CI/CD
│   ├── deploy-backend.yml           # Server → EC2 via SSH
│   ├── deploy-frontend.yml          # Client → S3 + CloudFront invalidation
│   └── deploy-eks.yml               # Full EKS pipeline (test → build → deploy)
│
├── Jenkinsfile                      # Jenkins Declarative Pipeline
├── docker-compose.yml               # Full local stack (app + Prometheus + Grafana)
└── README.md
```

---

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Docker & Docker Compose (for monitoring stack)

### Quick Start

```bash
# Clone the repo
git clone <repo-url>
cd compiler

# Install & run backend
cd server
npm install
cp .env.example .env    # Edit with your values
npm run dev

# Install & run frontend (new terminal)
cd client
npm install
npm run dev
```

### Environment Variables

**Server (`server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/compilehub
JWT_SECRET=your-super-secret-key
PISTON_API_URL=https://emkc.org/api/v2/piston
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Run with Docker Compose (Full Stack + Monitoring)

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:5000/api/health |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin/admin) |
| Metrics | http://localhost:5000/metrics |

---

## 🧪 Testing

```bash
# Start the server first, then run the integration test suite
cd server
npm run dev

# In another terminal
node testSuite.js
```

Tests cover: Registration → Login → Profile → Code Execution → CRUD Snippets (8/8 tests).

---

## 🎯 Features

- ✅ Multi-language code execution (JS, Python, C++, Java, Go, Rust, TypeScript, Ruby, PHP, C#, Swift, Kotlin)
- ✅ Monaco Editor with IntelliSense and syntax highlighting
- ✅ Dark / Light theme with smooth transitions
- ✅ Save & manage code snippets (authenticated)
- ✅ JWT authentication with secure password hashing
- ✅ Responsive design (mobile + desktop)
- ✅ Real-time output with error highlighting
- ✅ Piston API with local execution fallback
- ✅ Prometheus metrics instrumentation
- ✅ Ctrl+Enter to run, Ctrl+S to save

---

## 🌐 CI/CD Pipelines

### GitHub Actions
| Workflow | Trigger | Deploys To |
|----------|---------|-----------|
| `deploy-backend.yml` | Push to `server/**` | EC2 via SSH + PM2 |
| `deploy-frontend.yml` | Push to `client/**` | S3 + CloudFront |
| `deploy-eks.yml` | Push to `main` | Full EKS (Terraform + K8s) |

### Jenkins
The `Jenkinsfile` provides a 7-stage declarative pipeline:
1. **Checkout** → 2. **Install & Test** (parallel) → 3. **Docker Build** (parallel) → 4. **Push to ECR** → 5. **Terraform Apply** → 6. **Deploy to EKS** → 7. **Verify Rollout**

---

## 📊 Monitoring & Observability

### Prometheus Metrics
The server exposes a `/metrics` endpoint with:
- **Default Node.js metrics**: CPU, memory, event loop lag, GC
- **`compilehub_code_executions_total`**: Counter by language and status
- **`compilehub_code_execution_duration_seconds`**: Histogram by language
- **`compilehub_http_request_duration_seconds`**: HTTP request latency

### Grafana Dashboard (20 Panels)
- Cluster CPU/Memory gauges
- Code execution throughput & success rate
- Language execution share (donut chart)
- Pod scaling history & HPA trigger load
- Network ingress/egress volume
- MongoDB connection pool & CRUD telemetry

### AWS CloudWatch
- **Log Groups**: Application logs (30-day), access logs (14-day), system logs (14-day)
- **Metric Alarms**: ALB 5xx errors, unhealthy targets, high latency, node CPU
- **SNS Notifications**: Email alerts on alarm state changes
- **Dashboard**: ALB request count, response time, HTTP status codes, target health

---

## 🔧 Ansible Configuration Management

```bash
cd ansible

# 1. Provision a fresh EC2 instance
ansible-playbook playbooks/setup-server.yml

# 2. Deploy the application
ansible-playbook playbooks/deploy-app.yml

# 3. Install monitoring agents
ansible-playbook playbooks/install-monitoring.yml
```

---

## ☁️ AWS Deployment (Terraform)

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Provisions: VPC (2 public + 2 private subnets), EKS cluster, managed node group, ECR repositories, ALB, IAM roles, CloudWatch log groups, metric alarms, SNS topic, and a production dashboard.

---

## 📄 License

MIT
