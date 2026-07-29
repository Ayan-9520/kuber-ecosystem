export type {
  LenderApplication,
  LenderApplicationStatus,
  LenderConnector,
  SubmitApplicationParams,
} from './lender-connector.interface.js';

export { MockLenderConnector } from './mock-lender.connector.js';
export { HdfcLenderConnector } from './hdfc-lender.connector.js';
export { IciciLenderConnector } from './icici-lender.connector.js';
export { BajajLenderConnector } from './bajaj-lender.connector.js';

export {
  registerLender,
  getLender,
  getLenderOrDefault,
  listLenders,
  initializeLenders,
} from './lender-registry.js';

export type {
  WebhookPayload,
  WebhookEvent,
  WebhookEventType,
} from './webhook-handler.js';
export { handleWebhook, onWebhookEvent } from './webhook-handler.js';
