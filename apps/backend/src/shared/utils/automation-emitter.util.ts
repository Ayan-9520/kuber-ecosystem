import { automationTriggerService } from '../../modules/automation/automation.module.js';

export function emitAutomationEvent(params: {
  triggerType: string;
  subjectId: string;
  subjectType?: string;
  userId?: string;
  context?: Record<string, unknown>;
}): void {
  void automationTriggerService.emit(params).catch((error: unknown) => {
    console.error(`Automation emit failed [${params.triggerType}]:`, error);
  });
}
