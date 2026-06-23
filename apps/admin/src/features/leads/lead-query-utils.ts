import type { QueryClient } from '@tanstack/react-query';

/** Refreshes lead lists, dashboard recent activity, and analytics after create/update/delete. */
export function invalidateLeadQueries(queryClient: QueryClient, leadId?: string) {
  void queryClient.invalidateQueries({ queryKey: ['leads'] });
  void queryClient.invalidateQueries({ queryKey: ['applications'] });
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  void queryClient.invalidateQueries({ queryKey: ['lead-analytics'] });
  if (leadId) {
    queryClient.removeQueries({ queryKey: ['lead', leadId] });
  }
}
