# ════════════════════════════════════════════════════════════════
# CompileHub — CloudWatch Monitoring & Alerting
# Log groups, metric alarms, SNS notifications, and dashboard
# ════════════════════════════════════════════════════════════════

# ─── SNS Topic for Alarm Notifications ────────────────────────
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-alerts"

  tags = {
    Project = var.project_name
  }
}

resource "aws_sns_topic_subscription" "email_alert" {
  count     = var.alarm_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# ─── CloudWatch Log Groups ───────────────────────────────────
resource "aws_cloudwatch_log_group" "application" {
  name              = "/compilehub/application"
  retention_in_days = 30

  tags = {
    Project     = var.project_name
    Environment = "production"
  }
}

resource "aws_cloudwatch_log_group" "access" {
  name              = "/compilehub/access"
  retention_in_days = 14

  tags = {
    Project     = var.project_name
    Environment = "production"
  }
}

resource "aws_cloudwatch_log_group" "system" {
  name              = "/compilehub/system"
  retention_in_days = 14

  tags = {
    Project     = var.project_name
    Environment = "production"
  }
}

# ─── CloudWatch Metric Alarms ────────────────────────────────

# ALB 5xx Error Rate Alarm
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name          = "${var.project_name}-alb-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 180
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "ALB target 5xx errors exceeded threshold — possible backend failures"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]

  tags = {
    Project = var.project_name
  }
}

# ALB Unhealthy Target Count Alarm
resource "aws_cloudwatch_metric_alarm" "unhealthy_targets" {
  alarm_name          = "${var.project_name}-unhealthy-targets"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 120
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "One or more backend targets are unhealthy"
  treat_missing_data  = "notBreaching"

  dimensions = {
    TargetGroup  = aws_lb_target_group.server.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]

  tags = {
    Project = var.project_name
  }
}

# ALB High Latency Alarm
resource "aws_cloudwatch_metric_alarm" "alb_high_latency" {
  alarm_name          = "${var.project_name}-high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 120
  statistic           = "Average"
  threshold           = 5
  alarm_description   = "ALB average response time exceeded 5 seconds"
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = {
    Project = var.project_name
  }
}

# EKS Node High CPU Alarm
resource "aws_cloudwatch_metric_alarm" "node_high_cpu" {
  alarm_name          = "${var.project_name}-eks-node-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "node_cpu_utilization"
  namespace           = "ContainerInsights"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "EKS node CPU utilization exceeded 80% for 15 minutes"
  treat_missing_data  = "missing"

  dimensions = {
    ClusterName = aws_eks_cluster.main.name
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]

  tags = {
    Project = var.project_name
  }
}

# ─── CloudWatch Dashboard ────────────────────────────────────
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-production"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "# ⚡ CompileHub Production Dashboard"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 1
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Sum", period = 60 }]
          ]
          title  = "ALB Request Count"
          region = var.aws_region
          period = 60
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 1
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Average", period = 60 }]
          ]
          title  = "ALB Average Response Time (seconds)"
          region = var.aws_region
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 1
        width  = 8
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "HTTPCode_Target_2XX_Count", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Sum", period = 60, color = "#2ca02c" }],
            ["AWS/ApplicationELB", "HTTPCode_Target_4XX_Count", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Sum", period = 60, color = "#ff7f0e" }],
            ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Sum", period = 60, color = "#d62728" }]
          ]
          title  = "HTTP Status Codes"
          region = var.aws_region
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 7
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "HealthyHostCount", "TargetGroup", aws_lb_target_group.server.arn_suffix, "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Average", color = "#2ca02c" }],
            ["AWS/ApplicationELB", "UnHealthyHostCount", "TargetGroup", aws_lb_target_group.server.arn_suffix, "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Average", color = "#d62728" }]
          ]
          title  = "Backend Target Health"
          region = var.aws_region
          view   = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 7
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "ActiveConnectionCount", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Sum", period = 60 }]
          ]
          title  = "Active Connections"
          region = var.aws_region
          view   = "timeSeries"
        }
      }
    ]
  })
}
