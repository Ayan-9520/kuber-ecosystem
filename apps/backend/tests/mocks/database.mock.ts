import { jest } from '@jest/globals';

function modelMock() {
  return {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn().mockResolvedValue({}),
    delete: jest.fn(),
    count: jest.fn(),
  };
}

export const prisma = {
  user: modelMock(),
  lead: modelMock(),
  session: modelMock(),
  refreshToken: modelMock(),
  otpVerification: modelMock(),
  loginHistory: modelMock(),
  auditLog: modelMock(),
  observabilityTrace: modelMock(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
};

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/** Minimal Prisma namespace for error-handler middleware in security/unit tests */
export class PrismaClientKnownRequestError extends Error {
  code: string;
  constructor(message: string, code = 'P2002') {
    super(message);
    this.name = 'PrismaClientKnownRequestError';
    this.code = code;
  }
}

export class PrismaClientInitializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrismaClientInitializationError';
  }
}

export const Prisma = {
  PrismaClientKnownRequestError,
  PrismaClientInitializationError,
};
