variable SMARS_ENVIRONMENT {
  type        = string
  default     = "dev"
  description = "Name of the SMARS environment (staging or production)"
}

variable DOMAIN_NAME {
  type        = string
  default     = "test.freesmars.com"
  description = "URL at which the game can be played (never use 'dev' in a URL - Chrome does not like it!)"
}

variable ZONE_ID {
  type        = string
  description = "The ID of the game's hosted zone (related to its domain address)"
}

variable SSH_ALLOW_ORIGIN {
  type        = string
  description = "IP address to be allowed to access SSH port (22) in the server's security group"
}
