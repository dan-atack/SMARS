terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version : "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-2"
}

resource "aws_security_group" "smars_server_sg" {
  description = "SMARS ${var.SMARS_ENVIRONMENT} Server Security Group"
  name = "smars_${var.SMARS_ENVIRONMENT}_sg"

  ingress {
    description = "SSH from me"
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = [var.SSH_ALLOW_ORIGIN]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port = 443
    to_port = 443
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP from anywhere"
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

# Create the role that will be assumed by the server instance to allow it to talk to the S3 bucket
resource "aws_iam_role" "s3_access_role" {
  name = "s3-database-backup-access-role"

  assume_role_policy = <<-EOF
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Action": "sts:AssumeRole",
          "Effect": "Allow",
          "Principal": {
            "Service": "ec2.amazonaws.com"
          }
        }
      ]
    }
  EOF
}

# Create an IAM policy that specifies access permissions for communicating with the S3 bucket, allowing it to read/write to it
# TODO: Replace the hard-coded bucket name for 'resource' with a variable for the environment when creating the actual bucket with TF
resource "aws_iam_policy" "s3_access_policy" {
  name        = "s3-database-backup-access-policy"
  path        = "/"
  description = "Policy to provide S3 access to the server instance"

  policy = <<-EOF
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "s3:List*",
            "s3:GetObject",
            "s3:PutObject"
          ],
          "Resource": "arn:aws:s3:::smars-${var.SMARS_ENVIRONMENT}-bucket/*"
        }
      ]
    }
  EOF
}

# Create an attachment between the S3 access role and the policy, to link them together
resource "aws_iam_policy_attachment" "s3_access_policy_role" {
  name       = "s3_access_attachment"
  roles      = [aws_iam_role.s3_access_role.name]
  policy_arn = aws_iam_policy.s3_access_policy.arn
}

# Create an EC2 instance PROFILE to finally connect the role attachment to the EC2 instance
resource "aws_iam_instance_profile" "s3_access_profile" {
  name = "s3_access_profile"
  role = aws_iam_role.s3_access_role.name
}

# Create the server computer (docker host machine)
resource "aws_instance" "smars_server_instance" {
  ami           = "ami-0a695f0d95cefc163"
  instance_type = "t2.small"
  vpc_security_group_ids = ["${aws_security_group.smars_server_sg.id}"]
  key_name      = "SMARS_Prod_EC2"
  iam_instance_profile = aws_iam_instance_profile.s3_access_profile.name
# Import shell script template used to configure the instance once it's launched
  user_data     = templatefile("configure_instance.tftpl", { SMARS_ENVIRONMENT = var.SMARS_ENVIRONMENT, DOMAIN_NAME = var.DOMAIN_NAME })
  
  tags = {
    Name = "smars_${var.SMARS_ENVIRONMENT}_server"
  }
}

resource "aws_eip" "smars_server_eip" {
  instance = aws_instance.smars_server_instance.id
}

resource "aws_route53_record" "freesmars" {
  zone_id = var.ZONE_ID
  name = var.DOMAIN_NAME
  type = "A"
  ttl = 300
  records = [aws_eip.smars_server_eip.public_ip]
}

resource "aws_s3_bucket" "smars-backups-bucket" {
  bucket = "smars-${var.SMARS_ENVIRONMENT}-bucket"

  tags   = {
    Name = "SMARS ${var.SMARS_ENVIRONMENT} Backup Bucket"
    Environment = "${var.SMARS_ENVIRONMENT}"
  }
}