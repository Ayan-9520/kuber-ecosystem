import { NotFoundError } from '../../../shared/errors/app-error.js';
import { errorTrackingRepository } from '../repositories/error-tracking.repository.js';

export const errorAssignmentService = {
  async assign(input: { groupId: string; assignedToId: string; assignedById: string; notes?: string }) {
    const group = await errorTrackingRepository.group.findById(input.groupId);
    if (!group) throw new NotFoundError('Error group not found');

    const assignment = await errorTrackingRepository.assignment.create({
      group: { connect: { id: input.groupId } },
      assignedTo: { connect: { id: input.assignedToId } },
      assignedBy: { connect: { id: input.assignedById } },
      notes: input.notes,
      status: 'ASSIGNED',
    });

    await errorTrackingRepository.group.update(input.groupId, {
      status: 'ASSIGNED',
      assignedTo: { connect: { id: input.assignedToId } },
    });

    return assignment;
  },
};
