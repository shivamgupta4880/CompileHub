pipeline {
    agent any

    environment {
        AWS_REGION         = 'us-east-1'
        EKS_CLUSTER_NAME   = 'compilehub-cluster'
        ECR_REGISTRY       = credentials('ecr-registry-url')     // e.g., 123456789.dkr.ecr.us-east-1.amazonaws.com
        FRONTEND_REPO      = 'compilehub-frontend'
        BACKEND_REPO       = 'compilehub-backend'
        MONGODB_URI        = credentials('compilehub-mongodb-uri')
        JWT_SECRET         = credentials('compilehub-jwt-secret')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        // ─── Stage 1: Checkout ──────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Source code checked out (Branch: ${env.BRANCH_NAME}, Commit: ${env.GIT_COMMIT?.take(7)})"
            }
        }

        // ─── Stage 2: Install & Test ────────────────────────────────
        stage('Install & Test') {
            parallel {
                stage('Client') {
                    steps {
                        dir('client') {
                            sh 'npm ci'
                            echo '✅ Client dependencies installed'
                            // Uncomment when tests are added:
                            // sh 'npm run lint'
                            // sh 'npm test'
                        }
                    }
                }
                stage('Server') {
                    steps {
                        dir('server') {
                            sh 'npm ci'
                            echo '✅ Server dependencies installed'
                            // Uncomment when tests are added:
                            // sh 'npm test'
                        }
                    }
                }
            }
        }

        // ─── Stage 3: Docker Build ──────────────────────────────────
        stage('Docker Build') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        script {
                            docker.build(
                                "${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}",
                                "--build-arg VITE_API_URL=/api -f client/Dockerfile ./client"
                            )
                        }
                        echo "✅ Frontend image built: ${FRONTEND_REPO}:${BUILD_NUMBER}"
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        script {
                            docker.build(
                                "${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}",
                                "-f server/Dockerfile ./server"
                            )
                        }
                        echo "✅ Backend image built: ${BACKEND_REPO}:${BUILD_NUMBER}"
                    }
                }
            }
        }

        // ─── Stage 4: Push to ECR ───────────────────────────────────
        stage('Push to ECR') {
            steps {
                withAWS(region: "${AWS_REGION}", credentials: 'aws-credentials') {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_REGISTRY}
                    """

                    // Push frontend
                    sh "docker tag ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER} ${ECR_REGISTRY}/${FRONTEND_REPO}:latest"
                    sh "docker push ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}"
                    sh "docker push ${ECR_REGISTRY}/${FRONTEND_REPO}:latest"

                    // Push backend
                    sh "docker tag ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER} ${ECR_REGISTRY}/${BACKEND_REPO}:latest"
                    sh "docker push ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}"
                    sh "docker push ${ECR_REGISTRY}/${BACKEND_REPO}:latest"
                }
                echo "✅ All images pushed to ECR"
            }
        }

        // ─── Stage 5: Terraform Infrastructure ──────────────────────
        stage('Terraform Apply') {
            steps {
                withAWS(region: "${AWS_REGION}", credentials: 'aws-credentials') {
                    dir('terraform') {
                        sh 'terraform init -input=false'
                        sh 'terraform plan -out=tfplan -input=false'
                        sh 'terraform apply -auto-approve tfplan'
                    }
                }
                echo "✅ Infrastructure provisioned via Terraform"
            }
        }

        // ─── Stage 6: Deploy to EKS ────────────────────────────────
        stage('Deploy to EKS') {
            steps {
                withAWS(region: "${AWS_REGION}", credentials: 'aws-credentials') {
                    // Configure kubectl
                    sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${EKS_CLUSTER_NAME}"

                    // Create namespace and secrets
                    sh 'kubectl apply -f k8s/namespace.yaml'
                    sh """
                        kubectl get secret compilehub-secrets -n compilehub || \
                        kubectl create secret generic compilehub-secrets -n compilehub \
                            --from-literal=MONGODB_URI='${MONGODB_URI}' \
                            --from-literal=JWT_SECRET='${JWT_SECRET}'
                    """

                    // Load Grafana dashboard ConfigMap
                    sh "kubectl create configmap compilehub-dashboard-json -n compilehub --from-file=k8s/monitoring/compilehub-dashboard.json -o yaml --dry-run=client | kubectl apply -f -"

                    // Update image tags in manifests
                    sh """
                        sed -i 's|image:.*compilehub-frontend:.*|image: ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}|g' k8s/client-deployment.yaml
                        sed -i 's|image:.*compilehub-backend:.*|image: ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}|g' k8s/server-deployment.yaml
                    """

                    // Apply all K8s manifests
                    sh '''
                        kubectl apply -f k8s/client-deployment.yaml
                        kubectl apply -f k8s/client-service.yaml
                        kubectl apply -f k8s/server-deployment.yaml
                        kubectl apply -f k8s/server-service.yaml
                        kubectl apply -f k8s/ingress.yaml
                        kubectl apply -f k8s/hpa.yaml
                        kubectl apply -f k8s/monitoring/prometheus.yaml
                        kubectl apply -f k8s/monitoring/grafana.yaml
                    '''
                }
                echo "✅ All K8s resources applied to EKS"
            }
        }

        // ─── Stage 7: Verify Rollout ────────────────────────────────
        stage('Verify Deployment') {
            steps {
                withAWS(region: "${AWS_REGION}", credentials: 'aws-credentials') {
                    sh 'kubectl rollout status deployment/compilehub-client -n compilehub --timeout=120s'
                    sh 'kubectl rollout status deployment/compilehub-server -n compilehub --timeout=180s'
                    sh 'kubectl get pods -n compilehub -o wide'
                    sh 'kubectl get services -n compilehub'
                }
                echo "✅ Deployment verified — all pods healthy"
            }
        }
    }

    post {
        success {
            echo """
            ╔══════════════════════════════════════════╗
            ║  🎉 CompileHub Deploy #${BUILD_NUMBER} SUCCESS   ║
            ║  Branch: ${env.BRANCH_NAME}              ║
            ║  Commit: ${env.GIT_COMMIT?.take(7)}      ║
            ╚══════════════════════════════════════════╝
            """
        }
        failure {
            echo """
            ╔══════════════════════════════════════════╗
            ║  ❌ CompileHub Deploy #${BUILD_NUMBER} FAILED     ║
            ║  Check console output for details.       ║
            ╚══════════════════════════════════════════╝
            """
        }
        always {
            cleanWs()
        }
    }
}
