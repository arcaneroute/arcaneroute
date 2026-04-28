/**
 * UserPrompt - Format prompts untuk user consumption
 */

import type { ApprovalRequest } from '../types';

export interface UserPromptOptions {
  showContext?: boolean;
  showTimestamp?: boolean;
  colorize?: boolean;
}

export class UserPrompt {
  format(
    request: ApprovalRequest,
    options: UserPromptOptions = {}
  ): string {
    const { showContext = true, showTimestamp = true, colorize = false } = options;

    const lines: string[] = [];
    const divider = colorize ? '\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m' : '━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    lines.push(divider);
    lines.push(`${colorize ? '\x1b[36m' : ''}🤖 Agent: ${request.agent}${colorize ? '\x1b[0m' : ''}`);
    lines.push(`${colorize ? '\x1b[33m' : ''}📋 Action: ${request.action}${colorize ? '\x1b[0m' : ''}`);
    lines.push(divider);
    lines.push('');
    lines.push(request.description);
    lines.push('');

    if (showContext && Object.keys(request.context).length > 0) {
      lines.push(divider);
      lines.push('Context:');
      lines.push('```json');
      lines.push(JSON.stringify(request.context, null, 2));
      lines.push('```');
      lines.push(divider);
      lines.push('');
    }

    if (showTimestamp) {
      const date = new Date(request.createdAt).toLocaleString();
      lines.push(`📅 ${date}`);
      lines.push('');
    }

    lines.push(divider);
    lines.push('Your decision:');
    lines.push('  • "y" / "approve" - proceed with action');
    lines.push('  • "n" / "reject" - cancel action');
    lines.push('  • "m <description>" - modify and proceed');
    lines.push(divider);

    return lines.join('\n');
  }

  formatMinimal(request: ApprovalRequest): string {
    return `[${request.agent}] ${request.action}: ${request.description.slice(0, 100)}`;
  }
}
