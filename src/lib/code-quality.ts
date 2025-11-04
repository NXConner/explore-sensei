/**
 * Code quality and testing utilities
 */

export const generateTestId = (component: string, element: string): string => {
  return `${component}-${element}`.toLowerCase().replace(/\s+/g, '-');
};

export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${value}`);
};

export const exhaustiveCheck = (_value: never): void => {
  // This function is used for exhaustiveness checking in switch statements
};

export const isDevelopment = (): boolean => {
  return import.meta.env?.DEV || false;
};

export const isProduction = (): boolean => {
  return import.meta.env?.PROD || false;
};

export const isTest = (): boolean => {
  return import.meta.env?.MODE === 'test';
};

export const getEnvironment = (): 'development' | 'production' | 'test' => {
  if (isTest()) return 'test';
  if (isProduction()) return 'production';
  return 'development';
};

export const createMockData = <T>(template: T, count: number = 5): T[] => {
  return Array.from({ length: count }, (_, i) => ({
    ...template,
    id: `mock-${i}`,
  }));
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await delay(delayMs);
    return retry(fn, retries - 1, delayMs * 2);
  }
};
