# Masirep - Setup and Configuration Guide

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure your values:

```bash
cp .env.example .env.local
```

**⚠️ CRITICAL SECURITY STEP:**
Generate a secure NextAuth secret:

```bash
openssl rand -base64 32
```

Update `NEXTAUTH_SECRET` in `.env.local` with the generated value.

### 2. Database Setup

Initialize the database with seed data:

```bash
npm run db:push
npm run db:seed
```

### 3. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and sign in with the pre-configured technician accounts.

## Environment Variables

### Required Variables

| Variable | Description | Example Value | Notes |
|----------|-------------|----------------|-------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` | Auto-configured for local development |
| `NEXTAUTH_SECRET` | JWT signing secret | `openssl rand -base64 32` | **CRITICAL** - Must be unique and cryptographically secure |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` | Update for production deployment |

### Optional Variables

| Variable | Description | Default | Recommended |
|----------|-------------|---------|-------------|
| `NODE_ENV` | Environment mode | `development` | `production` for deployment |
| `NEXTAUTH_DEBUG` | Debug logging | `false` | `false` in production |
| `NEXTAUTH_URL_INTERNAL` | Internal URL | `NEXTAUTH_URL` | Useful for Docker setups |

## Pre-configured User Accounts

The system comes with 7 technician accounts pre-configured:

| Email | Technician ID | Password | Role |
|-------|---------------|----------|------|
| carlos.rodriguez@masirep.com | TEC-001 | temp123 | tecnico |
| maría.gonzalez@masirep.com | TEC-002 | temp123 | tecnico |
| juan.perez@masirep.com | TEC-003 | temp123 | tecnico |
| ana.martinez@masirep.com | TEC-004 | temp123 | tecnico |
| luis.fernandez@masirep.com | TEC-005 | temp123 | tecnico |
| sofia.lopez@masirep.com | TEC-006 | temp123 | tecnico |
| diego.sanchez@masirep.com | TEC-007 | temp123 | tecnico |

**⚠️ IMPORTANT:** Change the default passwords in production by updating the seed data or implementing a password change feature.

## Security Configuration

### Production Deployment Checklist

1. **Generate secure NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

2. **Update environment variables:**
   ```env
   NODE_ENV=production
   NEXTAUTH_DEBUG=false
   NEXTAUTH_URL=https://your-domain.com
   ```

3. **Configure CORS in next.config.ts:**
   ```typescript
   value: 'https://your-domain.com'  // Replace with actual domain
   ```

4. **Ensure HTTPS is enabled** (required for secure cookies)

### Rate Limiting

The application includes built-in rate limiting:

- **Authentication endpoints**: 5 attempts per 15 minutes
- **General API endpoints**: 100 requests per 15 minutes
- **Rate limit headers** included in all responses

### Security Headers

Automatic security headers are configured:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run integration tests specifically
npm test -- src/__tests__/auth.integration.test.ts
```

### Test Coverage

The test suite includes:

- **Unit Tests**: Auth configuration, bcrypt verification
- **Integration Tests**: Complete login/logout flow, rate limiting
- **Security Tests**: Session hijacking prevention, rate limit enforcement

## Development Notes

### Database

- **Type**: SQLite with Prisma ORM
- **Location**: `./prisma/dev.db`
- **Schema**: See `prisma/schema.prisma`
- **Seed Data**: `prisma/seed.ts` (7 technician accounts)

### Authentication

- **Provider**: NextAuth.js v4 with Credentials Provider
- **Strategy**: JWT sessions with HTTP-only cookies
- **Session Duration**: 24 hours
- **Rate Limiting**: Built-in protection against brute force

### Architecture

- **Framework**: Next.js 16 with App Router
- **Database**: SQLite + Prisma ORM
- **Authentication**: NextAuth.js v4
- **UI**: React + Tailwind CSS
- **Type Safety**: TypeScript throughout

## Troubleshooting

### Common Issues

1. **Build errors with bcryptjs:**
   - Ensure `next.config.ts` doesn't use deprecated `serverExternalPackages`
   - Run `npm install` to update dependencies

2. **Authentication not working:**
   - Check `NEXTAUTH_SECRET` is properly configured
   - Verify `NEXTAUTH_URL` matches your deployment URL
   - Ensure database is seeded with user accounts

3. **Rate limiting issues:**
   - Rate limiting is stored in memory and resets on server restart
   - Different IP addresses have separate rate limits
   - Check rate limit headers in API responses

4. **CORS errors:**
   - Update `CORS_ORIGIN` in next.config.ts
   - Ensure proper domain configuration for production

### Debug Mode

Enable debug logging by setting:

```env
NEXTAUTH_DEBUG=true
RATE_LIMIT_DEBUG=true
```

**Only use in development - never enable debug logging in production!**

## Support

For issues or questions:

1. Check the console/server logs for detailed error messages
2. Verify environment variables are correctly set
3. Ensure database is properly initialized
4. Test with the pre-configured technician accounts