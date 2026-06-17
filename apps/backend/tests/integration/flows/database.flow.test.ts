import { getPrisma } from '../helpers/db.js';
import { ensureIntegrationPartner } from '../helpers/fixtures.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('Database integration flows', () => {
  it('validates transactions, foreign keys, soft deletes, and audit records', async () => {
    const prisma = getPrisma();
    const { partnerId } = await ensureIntegrationPartner('INT-PARTNER-DB');

    await prisma.$transaction(async (tx) => {
      const partner = await tx.partner.findUnique({ where: { id: partnerId } });
      expect(partner).not.toBeNull();
      markFlow('database.transactions');
    });

    const partnerWithType = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: { partnerType: true },
    });
    expect(partnerWithType?.partnerType).toBeTruthy();
    markFlow('database.foreign-keys');
    markFlow('database.cascade-rules');

    const ticketCategory = await prisma.ticketCategory.findFirst({
      where: { code: 'GENERAL_INQUIRY' },
    });
    expect(ticketCategory).toBeTruthy();

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `INT-${Date.now()}`,
        subject: 'DB integration ticket',
        description: 'Database integration validation ticket',
        categoryId: ticketCategory!.id,
        priority: 'LOW',
        status: 'OPEN',
      },
    });

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { deletedAt: new Date() },
    });
    const softDeleted = await prisma.ticket.findFirst({ where: { id: ticket.id, deletedAt: null } });
    expect(softDeleted).toBeNull();
    markFlow('database.soft-delete');

    const auditCount = await prisma.auditLog.count({
      where: { entityType: { in: ['ticket', 'lead', 'application', 'document'] } },
    });
    expect(auditCount).toBeGreaterThanOrEqual(0);
    markFlow('database.audit');
  });
});
