# JIRA Worklog Dashboard - Deployment Guide

## Environment Variables Setup

This application requires the following environment variables to be configured for secure deployment:

### Required Environment Variables

```bash
JIRA_URL=https://your-domain.atlassian.net
JIRA_API_TOKEN=your-jira-api-token-here
JIRA_USER_EMAIL=your-email@company.com
```

### Getting Your JIRA Credentials

1. **JIRA URL**: Your Atlassian domain (e.g., `https://company.atlassian.net`)
2. **JIRA API Token**: 
   - Go to https://id.atlassian.com/manage-profile/security/api-tokens
   - Create a new API token
   - Copy the generated token
3. **JIRA User Email**: The email address associated with your JIRA account

## Deployment Platforms

### Netlify Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. In Netlify dashboard:
   - Go to Site Settings > Environment Variables
   - Add the three required environment variables
   - Deploy your `dist` folder

### Vercel Deployment

1. In your Vercel project settings:
   - Go to Environment Variables
   - Add the three required environment variables
   - Redeploy your application

### Railway/Render Deployment

1. In your platform's environment settings:
   - Add the three required environment variables
   - The platform will automatically use them during deployment

## Security Features

- **No credentials in code**: All JIRA credentials are stored as environment variables
- **Frontend isolation**: The frontend never sees or handles API tokens
- **Backend authentication**: All JIRA API calls are made securely from the backend
- **Environment separation**: Development and production use separate credential sets

## Post-Deployment Setup

1. Access your deployed application
2. Open Settings (gear icon in top-right)
3. Test JIRA connection to verify environment variables are working
4. Add assignee IDs you want to track
5. Use "Refresh" to fetch worklog data manually
6. The system will automatically fetch data daily at 9:00 AM

## Troubleshooting

- **Connection Failed**: Verify your environment variables are correctly set
- **No Data**: Ensure assignee IDs are valid and have worklog entries for the queried dates
- **Build Errors**: Make sure all environment variables are available during the build process

## Local Development

For local development, you can use the Replit Secrets feature or create a local `.env` file based on `.env.example`.