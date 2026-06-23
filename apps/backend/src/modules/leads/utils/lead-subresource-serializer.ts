type AuthorLike = { email?: string | null; phone?: string | null } | null | undefined;

function authorLabel(author: AuthorLike): string | null {
  if (!author) return null;
  return author.email ?? author.phone ?? null;
}

export function serializeLeadActivity<T extends {
  activityType: string;
  description?: string | null;
  disposition?: string | null;
  performedBy?: AuthorLike;
}>(activity: T) {
  return {
    ...activity,
    title: activity.description?.trim() || activity.activityType,
    subject: activity.activityType,
    outcome: activity.disposition ?? null,
    performedByName: authorLabel(activity.performedBy),
    createdByName: authorLabel(activity.performedBy),
  };
}

export function serializeLeadNote<T extends {
  content: string;
  author?: AuthorLike;
}>(note: T) {
  return {
    ...note,
    note: note.content,
    createdByName: authorLabel(note.author),
    authorName: authorLabel(note.author),
  };
}

export function serializeLeadFollowUp<T extends {
  followUpType?: string | null;
  notes?: string | null;
  description?: string | null;
}>(followUp: T) {
  return {
    ...followUp,
    type: followUp.followUpType ?? null,
    description: followUp.notes ?? followUp.description ?? null,
  };
}
