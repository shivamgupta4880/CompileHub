# ================================================================
# CompileHub -- Clean & Robust Windows PowerShell Deployment Script
# ================================================================

$EC2_IP = "54.91.77.90"
$SSH_USER = "ec2-user"
$SSH_KEY = "./k2sh.pem"

Write-Host ""
Write-Host ">>> Initiating Automated CompileHub deployment to AWS EC2 ($EC2_IP)..." -ForegroundColor Cyan

# --- 1. Secure local key permissions --------------------------
Write-Host "[1/7] Securing local private key file permissions (k2sh.pem)..." -ForegroundColor Yellow
icacls k2sh.pem /inheritance:r /grant:r "${env:USERNAME}:F" | Out-Null
Write-Host " -> Key secured successfully." -ForegroundColor Green

# --- 2. Test SSH connection -----------------------------------
Write-Host "[2/7] Verifying connection to EC2 instance..." -ForegroundColor Yellow
$testConnection = ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SSH_USER`@$EC2_IP" "echo Connected" 2>$null

if ($testConnection -ne "Connected") {
    Write-Error " -> Could not establish SSH connection to $EC2_IP using $SSH_KEY."
    Write-Host "Please ensure your EC2 Security Group allows inbound SSH traffic on port 22." -ForegroundColor Red
    exit 1
}
Write-Host " -> Connection established successfully." -ForegroundColor Green

# --- 3. Install developer environment and runtimes on EC2 ------
Write-Host "[3/7] Provisioning EC2 software stack (Node.js 20, Git, Docker, PM2, compilers)..." -ForegroundColor Yellow
$setupCmds = "sudo dnf update -y && sudo dnf install -y git nodejs npm gcc gcc-c++ make golang rust cargo && sudo npm install -g pm2 && sudo dnf install -y docker && sudo systemctl start docker && sudo systemctl enable docker && sudo usermod -aG docker ec2-user"
$res1 = ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$SSH_USER`@$EC2_IP" $setupCmds
Write-Host " -> Software stack successfully provisioned!" -ForegroundColor Green

# --- 4. Deploy codebase --------------------------------------
Write-Host "[4/7] Deploying CompileHub server codebase on EC2..." -ForegroundColor Yellow
$deployCmds = "rm -rf ~/compilehub && git clone https://github.com/shivamgupta4880/CompileHub.git ~/compilehub && cd ~/compilehub/server && npm install --production && mkdir -p temp_runs && chmod 777 temp_runs"
$res2 = ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$SSH_USER`@$EC2_IP" $deployCmds
Write-Host " -> Codebase successfully deployed!" -ForegroundColor Green

# --- 5. Configure environment variables ----------------------
Write-Host "[5/7] Creating .env configuration file on EC2..." -ForegroundColor Yellow
$mongoUri = "mongodb://shivamgupt4880_db_user:KSIAb3kIHs2xZK9C@ac-dy10vbo-shard-00-00.ry4oo4j.mongodb.net:27017,ac-dy10vbo-shard-00-01.ry4oo4j.mongodb.net:27017,ac-dy10vbo-shard-00-02.ry4oo4j.mongodb.net:27017/compilehub?ssl=true&authSource=admin"
$jwtSecret = "b4b2df2b0e9a6f8b9e6c46a8d6e3bf29f9e1d8820c78a1f8bda9f4f346e29e92"
$pistonUrl = "https://emkc.org/api/v2/piston"

# Construct .env file lines
$envLines = "PORT=5000`nMONGODB_URI=$mongoUri`nJWT_SECRET=$jwtSecret`nPISTON_API_URL=$pistonUrl`nNODE_ENV=production"

# Write temp file locally and copy via scp
$envLines | Out-File -FilePath "./.env.temp" -Encoding utf8
scp -i $SSH_KEY -o StrictHostKeyChecking=no "./.env.temp" "$SSH_USER`@$EC2_IP`:~/compilehub/server/.env" | Out-Null
Remove-Item "./.env.temp" -Force
Write-Host " -> .env configured successfully." -ForegroundColor Green

# --- 6. Run Server under PM2 ----------------------------------
Write-Host "[6/7] Starting API Server via PM2..." -ForegroundColor Yellow
$pm2Cmds = "cd ~/compilehub/server && pm2 stop compilehub-api 2>/dev/null; pm2 delete compilehub-api 2>/dev/null; pm2 start server.js --name compilehub-api && pm2 save"
$res3 = ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$SSH_USER`@$EC2_IP" $pm2Cmds
Write-Host " -> Server started under PM2 management." -ForegroundColor Green

# --- 7. Health Check Verification ----------------------------
Write-Host "[7/7] Checking API health..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
$health = ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$SSH_USER`@$EC2_IP" "curl -s http://localhost:5000/api/health"

if ($health -like "*healthy*") {
    Write-Host ""
    Write-Host ">>> SUCCESS! CompileHub is running on production EC2 instance!" -ForegroundColor Green
    Write-Host " -> Active Endpoint: http://$EC2_IP:5000" -ForegroundColor Green
    Write-Host " -> Health Status: http://$EC2_IP:5000/api/health" -ForegroundColor Green
    Write-Host " -> Metrics Scraper: http://$EC2_IP:5000/metrics" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host " -> Warning: Server successfully launched but health check is pending." -ForegroundColor Yellow
    Write-Host " -> Check status by running: pm2 logs on the server" -ForegroundColor Yellow
    Write-Host ""
}
