export function awsToAzure(service) {
  const m = { "EC2": "Virtual Machines", "S3": "Blob Storage", "Lambda": "Azure Functions", "RDS": "Azure SQL", "IAM Role": "Managed Identity" }; return m[service] ?? "inconnu";
}
