// Shared storage for playbooks and jobs
// In production, this should be replaced with Redis, Database, or other persistent storage

interface PlaybookData {
  status: 'processing' | 'complete' | 'failed';
  playbook?: string;
  error?: string;
  createdAt?: string;
  progress?: {
    currentStep: number;
    totalSteps: number;
    stepName: string;
    estimatedTimeRemaining: number;
  };
}

// Global storage (replace with Redis/Database in production)
export const playbookStorage = new Map<string, PlaybookData>();

// Helper functions
export function getPlaybook(id: string): PlaybookData | undefined {
  return playbookStorage.get(id);
}

export function setPlaybook(id: string, data: PlaybookData): void {
  playbookStorage.set(id, data);
}

export function deletePlaybook(id: string): boolean {
  return playbookStorage.delete(id);
}

// Export the interface for type safety
export type { PlaybookData };