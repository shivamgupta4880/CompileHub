output "vpc_id" {
  value       = aws_vpc.main.id
  description = "The ID of the provisioned VPC"
}

output "eks_cluster_endpoint" {
  value       = aws_eks_cluster.main.endpoint
  description = "The API endpoint for the EKS Kubernetes cluster"
}

output "eks_cluster_name" {
  value       = aws_eks_cluster.main.name
  description = "EKS Cluster identifier"
}

output "ecr_client_url" {
  value       = aws_ecr_repository.client.repository_url
  description = "ECR Docker repository URL for React frontend"
}

output "ecr_server_url" {
  value       = aws_ecr_repository.server.repository_url
  description = "ECR Docker repository URL for Express API backend"
}

output "alb_dns_name" {
  value       = aws_lb.main.dns_name
  description = "The DNS entrypoint for CompileHub Application Load Balancer"
}

output "kubeconfig_command" {
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.main.name}"
  description = "Command to configure kubectl to point to your new EKS cluster"
}
