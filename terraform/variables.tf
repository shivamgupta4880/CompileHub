variable "aws_region" {
  type        = string
  description = "AWS deployment region"
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Project name tag identifier"
  default     = "compilehub"
}

variable "vpc_cidr" {
  type        = string
  description = "VPC classless inter-domain routing range"
  default     = "10.0.0.0/16"
}

variable "eks_version" {
  type        = string
  description = "Kubernetes orchestration version"
  default     = "1.30"
}

variable "node_instance_type" {
  type        = string
  description = "EKS node instance size"
  default     = "t3.medium"
}
