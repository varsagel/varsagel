# 🚀 Varsagel Security Deployment Guide

## Pre-Deployment Security Checklist

### ✅ Environment Configuration

#### Required Environment Variables (`.env`):
```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Authentication
AUTH_SECRET="your-secure-random-string-min-32-chars"
NEXTAUTH_URL="https://www.varsagel.com"
AUTH_URL="https://www.varsagel.com"
AUTH_TRUST_HOST="true"

# Google OAuth (if using)
GOOGLE_ID="your-google-client-id"
GOOGLE_SECRET="your-google-client-secret"

# Email Configuration (if using)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
SMTP_FROM="noreply@varsagel.com"

# Security Settings
NODE_ENV="production"
FORCE_VARSAGEL_DOMAIN="true"
```

#### SSL Certificate Setup:
1. **Obtain SSL Certificate**:
   ```bash
   # Using Let's Encrypt (recommended)
   sudo certbot --nginx -d varsagel.com -d www.varsagel.com
   ```

2. **Configure HTTPS Redirects**:
   - All HTTP traffic automatically redirects to HTTPS
   - Non-www domains redirect to www.varsagel.com
   - HSTS headers enforce HTTPS

---

### ✅ Database Security

#### PostgreSQL Security Configuration:
```sql
-- Enable SSL
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';

-- Create dedicated application user
CREATE USER varsagel_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE varsagel TO varsagel_app;
GRANT USAGE ON SCHEMA public TO varsagel_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO varsagel_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO varsagel_app;

-- Set connection limits
ALTER ROLE varsagel_app CONNECTION LIMIT 50;
```

#### Database Backup Security:
```bash
# Encrypted backups
pg_dump -h localhost -U varsagel_app varsagel | gzip | openssl enc -aes-256-cbc -salt -out backup.sql.gz.enc

# Secure backup storage
aws s3 cp backup.sql.gz.enc s3://your-secure-bucket/backups/ --sse aws:kms
```

---

### ✅ Server Security Hardening

#### Ubuntu/Debian Server Setup:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban

# Configure SSH
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no
# Set: PubkeyAuthentication yes
sudo systemctl restart sshd

# Install security updates automatically
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

#### Nginx Configuration (if using):
```nginx
server {
    listen 80;
    server_name varsagel.com www.varsagel.com;
    return 301 https://www.varsagel.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name varsagel.com;
    return 301 https://www.varsagel.com$request_uri;
    
    ssl_certificate /etc/letsencrypt/live/varsagel.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/varsagel.com/privkey.pem;
}

server {
    listen 443 ssl http2;
    server_name www.varsagel.com;
    
    ssl_certificate /etc/letsencrypt/live/www.varsagel.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.varsagel.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;";
    
    # Hide server information
    server_tokens off;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=10 nodelay;
        limit_req zone=auth burst=5 nodelay;
    }
}
```

---

### ✅ Application Deployment

#### Production Build:
```bash
# Install dependencies
npm ci --only=production

# Build application
npm run build

# Start production server
npm start
```

#### PM2 Process Management:
```bash
# Install PM2
npm install -g pm2

# Create PM2 ecosystem file
echo 'module.exports = {
  apps: [{
    name: "varsagel",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_file: "./logs/combined.log",
    time: true
  }]
};' > ecosystem.config.js

# Start application
pm2 start ecosystem.config.js

# Setup startup script
pm2 startup
pm2 save
```

---

### ✅ Security Monitoring

#### Log Monitoring Setup:
```bash
# Create log directories
mkdir -p /var/log/varsagel
mkdir -p /var/log/nginx

# Configure logrotate
sudo nano /etc/logrotate.d/varsagel
# Add:
/var/log/varsagel/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
```

#### Security Event Monitoring:
```javascript
// Add to your monitoring system
const securityEvents = [
  'Rate limit exceeded',
  'Suspicious request detected',
  'Unauthorized admin access attempt',
  'Failed authentication',
  'Database connection error'
];

// Send alerts for critical events
if (securityEvents.includes(event.type)) {
  sendSecurityAlert(event);
}
```

---

### ✅ Post-Deployment Verification

#### Security Testing Commands:
```bash
# Test security headers
curl -I https://www.varsagel.com/api/health

# Test rate limiting
for i in {1..10}; do curl -s -o /dev/null -w "%{http_code}\n" https://www.varsagel.com/api/health; done

# Test HTTPS redirect
curl -I http://varsagel.com

# Test CSP headers
curl -I https://www.varsagel.com | grep -i "content-security-policy"
```

#### Automated Security Testing:
```bash
# Run security verification script
node security-verification.js

# Test with security tools
nmap -sV -sC www.varsagel.com
nikto -h https://www.varsagel.com
```

---

### ✅ Maintenance & Updates

#### Regular Security Tasks:
1. **Daily**: Review security logs for anomalies
2. **Weekly**: Check for dependency updates
3. **Monthly**: Run full security audit
4. **Quarterly**: Review and update security policies

#### Update Process:
```bash
# Backup before updates
pg_dump varsagel | gzip > backup-$(date +%Y%m%d).sql.gz

# Update dependencies
npm audit
npm update

# Test in staging first
git checkout staging
git merge main
npm test

# Deploy to production
git checkout main
git pull origin main
pm2 restart varsagel
```

---

### 🚨 Emergency Procedures

#### Security Incident Response:
1. **Immediate Actions**:
   ```bash
   # Block suspicious IPs
   sudo ufw deny from <suspicious-ip>
   
   # Check recent logs
   tail -f /var/log/varsagel/security.log
   
   # Restart application if needed
   pm2 restart varsagel
   ```

2. **Investigation**:
   ```bash
   # Analyze access logs
   grep "suspicious-pattern" /var/log/nginx/access.log
   
   # Check application logs
   pm2 logs varsagel --lines 1000
   
   # Database audit
   psql varsagel -c "SELECT * FROM logs WHERE created_at > NOW() - INTERVAL '1 hour'"
   ```

3. **Recovery**:
   ```bash
   # Restore from clean backup if needed
   gunzip < backup-clean.sql.gz | psql varsagel
   
   # Reset compromised credentials
   npm run generate:secrets
   
   # Update security measures
   npm audit fix
   ```

---

### 📊 Monitoring Dashboard

#### Key Metrics to Monitor:
- **Request Rate**: Monitor for DDoS patterns
- **Error Rate**: Track 4xx and 5xx errors
- **Response Time**: Ensure performance doesn't degrade
- **Security Events**: Rate limiting, blocked requests, auth failures
- **Database Performance**: Query execution times, connection pool usage

#### Recommended Tools:
- **Sentry**: Error tracking and performance monitoring
- **Datadog**: Infrastructure monitoring
- **Cloudflare**: CDN and DDoS protection
- **Uptime Robot**: Uptime monitoring
- **LogRocket**: User session recording

---

### 🔒 Security Contacts & Escalation

#### Internal Team:
- **Security Team**: security@varsagel.com
- **DevOps Team**: devops@varsagel.com
- **Development Team**: dev@varsagel.com

#### External Services:
- **Hosting Provider**: [Your hosting provider support]
- **CDN Provider**: [Your CDN support]
- **Certificate Authority**: [Your CA support]

---

## 🎯 DEPLOYMENT VERIFICATION

### Final Checklist Before Going Live:
- [ ] All environment variables configured
- [ ] SSL certificates installed and valid
- [ ] Database secured with SSL and proper user permissions
- [ ] Security headers verified with curl
- [ ] Rate limiting tested and working
- [ ] Error handling verified
- [ ] Monitoring and alerting configured
- [ ] Backup procedures tested
- [ ] Security audit completed
- [ ] Team notified of deployment

### Post-Deployment Verification:
- [ ] Application accessible via HTTPS
- [ ] All API endpoints responding correctly
- [ ] Security headers present in responses
- [ ] Rate limiting working as expected
- [ ] No critical errors in logs
- [ ] Performance metrics within acceptable range
- [ ] User authentication working
- [ ] Admin functionality secure
- [ ] Database connections stable
- [ ] Monitoring alerts configured

---

**🎉 CONGRATULATIONS!** 
Your Varsagel application is now enterprise-ready with comprehensive security measures. The site is protected against common vulnerabilities, has proper monitoring, and is ready for production traffic.

**Next Steps**:
1. Deploy using this guide
2. Monitor closely for first 24 hours
3. Set up regular security reviews
4. Keep security measures updated
5. Train team on security procedures

**Emergency Contact**: For critical security issues, contact the security team immediately at security@varsagel.com