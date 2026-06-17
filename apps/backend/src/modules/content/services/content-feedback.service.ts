import type { AuthenticatedUser } from '@kuberone/shared-types';
import { type contentFeedbackSchema } from '@kuberone/shared-validation';
import type { z } from 'zod';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { contentRepository } from '../repositories/content.repository.js';

type FeedbackInput = z.infer<typeof contentFeedbackSchema>;

export const contentFeedbackService = {
  async submit(actor: AuthenticatedUser, input: FeedbackInput) {
    const request = await contentRepository.request.findById(input.requestId);
    if (!request) throw new NotFoundError('ContentGenerationRequest', input.requestId);

    return contentRepository.feedback.create({
      request: { connect: { id: input.requestId } },
      rating: input.rating,
      comment: input.comment,
      tags: input.tags as never,
      submittedBy: { connect: { id: actor.id } },
    });
  },
};
