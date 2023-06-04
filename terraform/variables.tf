variable SMARS_ENVIRONMENT {
  type        = string
  default     = "staging"
  description = "Name of the SMARS environment (staging or production)"
}

variable DOMAIN_NAME {
  type        = string
  description = "URL at which the game can be played"
}

variable ZONE_ID {
  type        = string
  description = "The ID of the game's hosted zone (related to its domain address)"
}

variable SSH_ALLOW_ORIGIN {
  type        = string
  description = "IP address to be allowed to access SSH port (22) in the server's security group"
}
