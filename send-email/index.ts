import { Resend } from 'resend';
import minimist from 'minimist';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local file
// Use script directory (parent of build directory)
const envPath = path.join(path.dirname(path.dirname(process.argv[1])), '.env.local');
dotenv.config({ path: envPath });

// Parse command line arguments
const argv = minimist(process.argv.slice(2));

// Get API key from command line argument or fall back to environment variable
const apiKey = argv.key || process.env.RESEND_API_KEY;

// Get sender email address from command line argument or fall back to environment variable
const senderEmailAddress = argv.sender || process.env.SENDER_EMAIL_ADDRESS || 'onboarding@resend.dev';

// Get recipient email from command line argument or use default
const recipientEmail = argv.to || process.env.RECIPIENT_EMAIL_ADDRESS;

// Get JSON data from command line argument
const jsonData = argv.data;

if (!apiKey) {
  console.error(
    'No API key provided. Please set RESEND_API_KEY in .env.local file or use --key argument',
  );
  process.exit(1);
}

const resend = new Resend(apiKey);

async function sendErrEmail(errorMessage:any){
    await resend.emails.send({
    from: senderEmailAddress,
    to: recipientEmail,
    subject: "Hacker News Failed",
    text: `${errorMessage}`
  });
}
// Parse JSON data
let data;
try {
  data = JSON.parse(jsonData);
} catch (error) {
  console.error('Failed to parse JSON data:', error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  await sendErrEmail(errorMessage)
  console.log('程序继续运行，等待下一次执行...');
}

// Generate HTML email content
function generateHTML(data: any): string {
  const { date, topics } = data;

  const topicHTMLs = topics.map((topic: any) => {
    const imageUrl = topic.image_url || topic.imageUrl || '';
    const url = topic.url || '';
    const title = topic.title || '';
    const summary = topic.summary || '';

    return `
        <div class="topic">
            <div class="topic-title">${escapeHtml(title)}</div>
            ${imageUrl ? `<img class="topic-image" src="${escapeHtml(imageUrl)}" alt="话题图片">` : ''}
            <div class="topic-url">URL: <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></div>
            <div class="topic-summary"><strong>摘要:</strong> ${escapeHtml(summary)}</div>
        </div>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .topic { background: white; margin: 15px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .topic-title { font-size: 18px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .topic-image { width: 100%; max-width: 600px; height: auto; border-radius: 6px; margin: 10px 0; }
        .topic-url { font-size: 14px; color: #666; margin: 8px 0; word-break: break-all; }
        .topic-summary { font-size: 15px; color: #444; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Hacker News</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">${escapeHtml(date)}</p>
    </div>
    <div class="content">
        ${topicHTMLs}
    </div>
    <div class="footer">
        <p>🤖hacker-news agent自动推送 | 小时级更新</p>
    </div>
</body>
</html>`;
}

// Generate plain text content
function generateText(data: any): string {
  const { date, topics } = data;

  const topicTexts = topics.map((topic: any, index: number) => {
    const url = topic.url || '';
    const title = topic.title || '';
    const summary = topic.summary || '';

    return `${index + 1}. ${title}\n   ${summary}\n   ${url}`;
  }).join('\n\n');

  return `Hacker news Summary - ${date}

${topicTexts}

🤖Hacker news agent自动推送 | 小时更新`;
}

// Escape HTML special characters
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Generate email content
const htmlContent = generateHTML(data);
const textContent = generateText(data);
const subject = `Hacker news Summary - ${data.date}`;

// Send email
async function sendEmail() {
  try {
    const response = await resend.emails.send({
      from: senderEmailAddress,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
      text: textContent,
    });

    if (response.error) {
      console.error('Email failed to send:', JSON.stringify(response.error));
      const errorMessage = response.error instanceof Error ? response.error.message : String(response.error);
      await sendErrEmail(errorMessage)
      console.log('邮件发送失败，程序继续运行，等待下一次执行...');
    }

    console.log('Email sent successfully!');
    console.log('Email ID:', response.data?.id);
  } catch (error) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    await sendErrEmail(errorMessage)
    console.log('邮件发送失败，程序继续运行，等待下一次执行...');
  }
}

sendEmail();