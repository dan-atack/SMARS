variable smars_environment {
  type        = string
  default     = "staging"
  description = "Name of the SMARS environment (staging or production)"
}

variable domain_name {
  type        = string
  description = "URL at which the game can be played"
}

variable zone_id {
  type        = string
  description = "The ID of the game's hosted zone (related to its domain address)"
}

variable ssh_allow_origin {
  type        = string
  description = "IP address to be allowed to access SSH port (22) in the server's security group"
}
