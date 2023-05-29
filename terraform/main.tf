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

resource "aws_instance" "smars_prod_server" {
  ami           = "ami-0a695f0d95cefc163"
  instance_type = "t2.small"
  key_name      = "SMARS_Prod_EC2"
  tags = {
    Name = "SMARS_Prod_01"
  }
}