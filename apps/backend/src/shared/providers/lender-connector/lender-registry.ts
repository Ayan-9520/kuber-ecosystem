import type { LenderConnector } from './lender-connector.interface.js';
import { MockLenderConnector } from './mock-lender.connector.js';
import { HdfcLenderConnector } from './hdfc-lender.connector.js';
import { IciciLenderConnector } from './icici-lender.connector.js';
import { BajajLenderConnector } from './bajaj-lender.connector.js';

const connectors = new Map<string, LenderConnector>();

export function registerLender(connector: LenderConnector): void {
  connectors.set(connector.lenderCode, connector);
  console.log(`[LenderRegistry] Registered: ${connector.lenderCode} (${connector.lenderName})`);
}

export function getLender(code: string): LenderConnector {
  const connector = connectors.get(code);
  if (!connector) {
    throw new Error(`No lender connector registered for code: ${code}`);
  }
  return connector;
}

export function getLenderOrDefault(code: string): LenderConnector {
  return connectors.get(code) ?? connectors.get('MOCK')!;
}

export function listLenders(): LenderConnector[] {
  return Array.from(connectors.values());
}

export function initializeLenders(): void {
  connectors.clear();

  registerLender(new MockLenderConnector());

  const hdfc = new HdfcLenderConnector();
  registerLender(hdfc.isConfigured ? hdfc : new MockLenderConnector('HDFC', 'HDFC Bank (Mock)'));

  const icici = new IciciLenderConnector();
  registerLender(icici.isConfigured ? icici : new MockLenderConnector('ICICI', 'ICICI Bank (Mock)'));

  const bajaj = new BajajLenderConnector();
  registerLender(bajaj.isConfigured ? bajaj : new MockLenderConnector('BAJAJ', 'Bajaj Finserv (Mock)'));

  console.log(`[LenderRegistry] Initialized ${connectors.size} connectors`);
}
