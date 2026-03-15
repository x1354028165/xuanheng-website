import type { Core } from '@strapi/strapi';

/**
 * Ensure the Public role has the correct API permissions.
 * Runs on every bootstrap to keep permissions in sync.
 */
export async function setupPermissions(strapi: Core.Strapi): Promise<void> {
  strapi.log.info('[permissions] Configuring public API permissions…');

  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('[permissions] Public role not found — skipping.');
    return;
  }

  // Actions the Public role should have
  const requiredActions = [
    // Read-only content types
    'api::article.article.find',
    'api::article.article.findOne',
    'api::product.product.find',
    'api::product.product.findOne',
    'api::solution.solution.find',
    'api::solution.solution.findOne',
    'api::faq.faq.find',
    'api::faq.faq.findOne',
    'api::compatible-brand.compatible-brand.find',
    'api::compatible-brand.compatible-brand.findOne',
    'api::job-posting.job-posting.find',
    'api::job-posting.job-posting.findOne',
    'api::i18n-key.i18n-key.find',
    'api::i18n-key.i18n-key.findOne',
    // Write-only (form submissions)
    'api::lead.lead.create',
    'api::repair-ticket.repair-ticket.create',
  ];

  // Get existing permissions for the public role
  const existingPermissions = await strapi
    .query('plugin::users-permissions.permission')
    .findMany({
      where: { role: publicRole.id },
    });

  const existingActions = new Set(existingPermissions.map((p: { action: string }) => p.action));

  let added = 0;
  for (const action of requiredActions) {
    if (!existingActions.has(action)) {
      await strapi.query('plugin::users-permissions.permission').create({
        data: {
          action,
          role: publicRole.id,
        },
      });
      added++;
    }
  }

  if (added > 0) {
    strapi.log.info(`[permissions] Added ${added} permissions to Public role.`);
  } else {
    strapi.log.info('[permissions] All permissions already configured.');
  }
}
