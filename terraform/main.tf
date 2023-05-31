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

resource "aws_security_group" "smars_prod_sg" {
    description = "SMARS Production Server Security Group"
    name = "SMARS_Prod_SG"

    ingress {
      description = "SSH from me"
      from_port = 22
      to_port = 22
      protocol = "tcp"
      cidr_blocks = ["192.226.135.170/32"]
    }

    ingress {
      description = "HTTPS from anywhere"
      from_port = 443
      to_port = 443
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

resource "aws_instance" "smars_prod_server" {
  ami           = "ami-0a695f0d95cefc163"
  instance_type = "t2.small"
  vpc_security_group_ids = ["${aws_security_group.smars_prod_sg.id}"]
  key_name      = "SMARS_Prod_EC2"
  tags = {
    Name = "SMARS_Prod_Server"
  }
}

resource "aws_eip" "smars_prod_eip" {
  instance = aws_instance.smars_prod_server.id
}

resource "aws_route53_record" "freesmars" {
  zone_id = "Z066017510JYQP23YIULK"
  name = "freesmars.com"
  type = "A"
  ttl = 300
  records = [aws_instance.smars_prod_server.public_ip]
}