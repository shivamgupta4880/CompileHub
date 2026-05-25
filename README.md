# ⚡ CompileHub – Online Code Editor

A modern, full-stack online code editor built with the MERN stack. Supports multi-language code execution, Monaco Editor integration, dark/light themes, and cloud deployment on AWS.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite, Monaco Editor |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| Deployment | AWS (S3, CloudFront, EC2/EB) |
| CI/CD | GitHub Actions |

## 📦 Project Structure

```
compiler/
├── client/          # React frontend (Vite)
├── server/          # Express.js backend
├── .github/         # CI/CD workflows
└── README.md
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Setup

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
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/compilehub
JWT_SECRET=your-super-secret-key
PISTON_API_URL=https://emkc.org/api/v2/piston
```

**Client (`client/.env`):**
```
VITE_API_URL=http://localhost:5000/api
```

## 🎯 Features

- ✅ Multi-language code execution (JS, Python, C++, Java, Go, Rust, etc.)
- ✅ Monaco Editor with IntelliSense
- ✅ Dark / Light theme
- ✅ Save & manage code snippets
- ✅ JWT authentication
- ✅ Responsive design (mobile + desktop)
- ✅ Real-time output with error highlighting

## 🌐 Deployment (AWS)

- **Frontend:** S3 + CloudFront
- **Backend:** EC2 / Elastic Beanstalk
- **Database:** MongoDB Atlas
- **CI/CD:** GitHub Actions → AWS

## 📄 License

MIT
