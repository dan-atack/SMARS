terraform {
    required_providers {
      aws = {
        source = "hashicorp/aws"
        version: "~> 4.16"
      }
    }
    
    required_version = ">= 1.2.0"
}

provider "aws" {
    region = "us-east-2"
}

resource "aws_instance" "smars_prod_server" {
    ami = "ami-0a695f0d95cefc163"
    instance_type = "t2.small"
    key_name = "smars_prod_key_pair"
}

resource "aws_key_pair" "smars_prod_key_pair" {
    key_name = "smars_prod_key_pair"
    public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC0AaFU3jSUgENrKIf6Xcqq7xPGup582qrK
    n+919LsUYZFb6cID1igSv3CvXZdnr8F18IFJ61oVv9pHf48/6kTItBvPXm4d6Pbl
    8Amy14bvUhyfbBcpukmcQ6HPP48LnvbHeVMNBKMNvFHeFs2/EsroXy8/vQq4uDwG
    +qISVOB6OIPvS/A+Q5KttISzzDbnGQag21RoCjCY1B25D+GH6/fqAyWmMYokelbT
    hmaKOK9CsMI6MEfS0zy4M/u68rHVAvBfSyF709W5SetNH8Lh+4ZuWZzbUtxjssmh
    AYNdIViTX5s3r8GTJGPcYcod/7hjPQQJQ9e2Wg9M89Nle6AbPhY9"
}