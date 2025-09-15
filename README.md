# your-money-personality

## Email delivery configuration

The application now sends transactional email through [SendGrid](https://sendgrid.com/).

### Required environment variables

Set the following variable in your deployment environment (for example, in Vercel's
Project Settings → Environment Variables):

| Name | Description |
| --- | --- |
| `SENDGRID_API_KEY` | API key with permission to send mail via SendGrid. |

After adding or updating the variable, redeploy the project so that the new value is
picked up by the serverless email endpoint at `api/send-email.js`.

### Customizing the sender and email content

Transactional email bodies are generated inside
`src/services/emailService.ts`, where you can adjust copy, styling, or the
default `from` address (`Money Personality <notifications@yourmoneypersonality.com>`).
Make sure any sender address you use has been verified within your SendGrid
account (either via domain authentication or a single sender). All HTML content is
passed directly to SendGrid in the API request, so you can modify it in code without
needing SendGrid templates unless you prefer to manage them there.