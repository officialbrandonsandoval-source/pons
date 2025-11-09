import { ponsAgent } from '@/core/agents/pons';

export async function runAgent(input: string) {
  return await ponsAgent(input);
}
