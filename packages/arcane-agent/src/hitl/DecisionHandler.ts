/**
 * DecisionHandler - Handle user decisions untuk HITL approvals
 */

import type { ApprovalRequest, ApprovalResponse, ApprovalDecision } from '../types';

export class DecisionHandler {
  parseInput(input: string): {
    decision: ApprovalDecision;
    feedback?: string;
    modifiedParams?: Record<string, unknown>;
  } {
    const trimmed = input.trim().toLowerCase();

    if (trimmed === 'y' || trimmed === 'yes' || trimmed === 'approve') {
      return { decision: 'approve' };
    }

    if (trimmed === 'n' || trimmed === 'no' || trimmed === 'reject') {
      return { decision: 'reject' };
    }

    if (trimmed.startsWith('m ') || trimmed.startsWith('modify ')) {
      const description = input.slice(input.indexOf(' ') + 1).trim();
      return {
        decision: 'modify',
        feedback: description,
        modifiedParams: this.parseModification(description),
      };
    }

    return { decision: 'reject', feedback: 'Invalid input' };
  }

  private parseModification(description: string): Record<string, unknown> {
    try {
      const parsed = JSON.parse(description);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    } catch {
    }

    return { description };
  }

  async handleDecision(
    request: ApprovalRequest,
    input: string
  ): Promise<ApprovalResponse> {
    const parsed = this.parseInput(input);

    return {
      requestId: request.id,
      decision: parsed.decision,
      feedback: parsed.feedback,
      modifiedParams: parsed.modifiedParams,
    };
  }
}
