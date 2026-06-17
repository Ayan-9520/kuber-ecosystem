import { NotFoundError } from '../../../shared/errors/app-error.js';
import { errorTrackingRepository } from '../repositories/error-tracking.repository.js';

export const errorResolutionService = {
  async resolve(input: {
    groupId: string;
    resolvedById: string;
    resolutionType: string;
    rootCause?: string;
    fixDescription?: string;
  }) {
    const group = await errorTrackingRepository.group.findById(input.groupId);
    if (!group) throw new NotFoundError('Error group not found');

    const mttrMinutes = Math.round((Date.now() - group.firstSeenAt.getTime()) / 60_000);

    const resolution = await errorTrackingRepository.resolution.create({
      group: { connect: { id: input.groupId } },
      resolvedBy: { connect: { id: input.resolvedById } },
      resolutionType: input.resolutionType,
      rootCause: input.rootCause,
      fixDescription: input.fixDescription,
      mttrMinutes,
    });

    await errorTrackingRepository.group.update(input.groupId, { status: 'RESOLVED' });

    return resolution;
  },

  async addComment(input: { groupId: string; authorId: string; content: string }) {
    const group = await errorTrackingRepository.group.findById(input.groupId);
    if (!group) throw new NotFoundError('Error group not found');

    return errorTrackingRepository.comment.create({
      group: { connect: { id: input.groupId } },
      author: { connect: { id: input.authorId } },
      content: input.content,
    });
  },

  async updateGroup(id: string, data: { status?: string; priority?: string }) {
    const group = await errorTrackingRepository.group.findById(id);
    if (!group) throw new NotFoundError('Error group not found');
    return errorTrackingRepository.group.update(id, {
      ...(data.status ? { status: data.status as never } : {}),
      ...(data.priority ? { priority: data.priority as never } : {}),
    });
  },
};
