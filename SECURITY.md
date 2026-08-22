# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| `main` (latest) | Yes |
| `dev` (pre-release) | Best-effort |
| Older branches | No |

Run the latest version from `main` for all security fixes.

---

## Reporting a Vulnerability

Do not report security vulnerabilities through public GitHub Issues.

### How to Report

Open a [GitHub Security Advisory](https://github.com/adhavan13/odoo_hackathon_dayflow/security/advisories/new). This is private and only visible to maintainers.

### What to Include

- Type of vulnerability (e.g. broken auth, IDOR, injection)
- Affected component — module, endpoint, or file
- Steps to reproduce
- Potential impact — what an attacker could achieve
- Suggested fix (optional)

### Response Timeline

| Stage | Target |
|---|---|
| Acknowledgement | Within 48 hours |
| Validity confirmation | Within 5 business days |
| Patch for critical issues | Within 30 days |
| Patch for non-critical issues | Within 90 days |
| Public disclosure | After patch is released |

We follow coordinated disclosure. Credit is given in the security advisory unless you prefer to remain anonymous.

---

## Scope

### In Scope

- Authentication and authorization bypass
- JWT token forgery or improper validation
- NoSQL injection or command injection
- Sensitive data exposure (credentials, tokens, PII)
- Insecure Direct Object References — accessing another company's data
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Server-Side Request Forgery (SSRF)
- Insecure file upload handling
- Privilege escalation (e.g., EMPLOYEE accessing ADMIN endpoints)

### Out of Scope

- Vulnerabilities in upstream services (MongoDB Atlas, Cloudinary, Groq, Vercel)
- Issues requiring physical access to a device
- Self-hosted deployments with operator misconfiguration (e.g. exposed MongoDB without authentication)
- Denial of Service attacks requiring sustained traffic volume
- Missing security headers served by third-party CDNs

---

## Security Recommendations for Self-Hosting

### Secrets

- Use a minimum 32-character random string for `JWT_SECRET`
- Rotate any secret that has been exposed immediately
- Do not commit `.env` files — they are already in `.gitignore`

### Database

- Use MongoDB Atlas with IP allowlisting in production
- Create a dedicated database user with the minimum required permissions
- Enable Atlas auditing for production workloads

### Network

- Deploy the backend behind a reverse proxy or Vercel
- Use HTTPS for all traffic in production — never plain HTTP
- Set `CORS_ORIGIN` to your specific frontend domain — do not use `*` in production

---

## Changelog

Security fixes are recorded in [CHANGELOG.md](CHANGELOG.md).
