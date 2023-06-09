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

resource "aws_instance" "smars_prod_server" {
  ami           = "ami-0a695f0d95cefc163"
  instance_type = "t2.small"
  vpc_security_group_ids = ["${aws_security_group.smars_server_sg.id}"]
  key_name      = "SMARS_Prod_EC2"
  
  user_data = <<-EOF
    #!/bin/bash
    # Install Docker
    sudo apt-get update
    sudo apt-get install ca-certificates curl gnupg -y
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
    "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
    # For non-dev environments, install Certbot, and use it to create the TLS/SSL certificates required to run the backend's HTTPS mode
    if [ $TF_VAR_SMARS_ENVIRONMENT != "dev" ]
    then 
        sudo apt update
        sudo apt install snapd
        sudo snap install core; sudo snap refresh core
        sudo snap install --classic certbot
        sudo ln -s /snap/bin/certbot /usr/bin/certbot
        sudo certbot certonly --non-interactive --agree-tos --email dan_atack@hotmail.com --domain ${var.DOMAIN_NAME} --standalone
    else
        echo "Booting in HTTP mode for Dev environment"
    fi
    # Get SMARS source code and build the Docker images with Docker compose
    mkdir ~/smars
    cd ~/smars
    sudo git clone https://github.com/dan-atack/SMARS.git .
    # Add local environment variable files to assist docker image build
    echo "SMARS_ENVIRONMENT=${var.SMARS_ENVIRONMENT}" | cat > .env
    echo "DOMAIN_NAME=${var.DOMAIN_NAME}" | cat >> .env
    docker compose up
  EOF
  
  tags = {
    Name = "smars_${var.SMARS_ENVIRONMENT}_server"
  }
}

resource "aws_eip" "smars_server_eip" {
  instance = aws_instance.smars_prod_server.id
}

resource "aws_route53_record" "freesmars" {
  zone_id = var.ZONE_ID
  name = var.DOMAIN_NAME
  type = "A"
  ttl = 300
  records = [aws_eip.smars_server_eip.public_ip]
}