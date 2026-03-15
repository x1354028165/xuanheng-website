/**
 * 通知服务：企微 Webhook + 邮件（mock）
 */

export async function sendWecomNotification(data: Record<string, string>): Promise<void> {
  const webhookUrl = process.env.WECOM_WEBHOOK_URL;
  if (!webhookUrl) return; // 未配置时静默跳过

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      msgtype: 'markdown',
      markdown: { content: formatLeadMessage(data) },
    }),
    signal: AbortSignal.timeout(5000),
  }).catch((err) => console.error('[wecom] Webhook failed:', err));
}

function formatLeadMessage(data: Record<string, string>): string {
  return Object.entries(data)
    .filter(([, v]) => v)
    .map(([k, v]) => `**${k}**: ${v}`)
    .join('\n');
}

export async function sendEmailNotification(data: Record<string, string>): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    // SMTP 未配置，静默跳过（mock 模式）
    console.log('[email] SMTP not configured, skipping. Data:', JSON.stringify(data));
    return;
  }
  // TODO: 接入 nodemailer，当前 mock 不报错
  console.log('[email] Would send notification:', JSON.stringify(data));
}
