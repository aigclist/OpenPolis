# Security Policy

## Reporting a Vulnerability

OpenPolis is governance software that handles sensitive organizational data.
We take security seriously.

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email your report to [INSERT SECURITY EMAIL]
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: Within 48 hours of report
- **Initial Assessment**: Within 5 business days
- **Fix Target**: Critical vulnerabilities within 7 days, others within 30 days

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | Yes                |
| < latest | No                |

## Security Considerations

As governance software, OpenPolis has specific security requirements:

- **Data Isolation**: Workspace data must remain isolated between tenants
- **Audit Trails**: All agent actions must be traceable and non-repudiable
- **Permission Boundaries**: Agents operate under bounded authority, not unlimited access
- **Sensitive Fields**: Certain data fields are subject to governance policies
- **Approval Gates**: Sensitive operations require human confirmation

## Best Practices for Deployment

- Always use HTTPS in production
- Configure environment variables securely; never commit `.env` files
- Review and customize governance policies before deployment
- Enable audit logging
- Regularly review agent action logs
- Keep dependencies updated
