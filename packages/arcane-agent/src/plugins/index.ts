/**
 * Plugins - Export plugin system
 */

export { setGlobalRegistry, getGlobalRegistry, registerAgent, registerTool } from './decorators';
export { PluginLoader, type PluginLoaderConfig } from './PluginLoader';
export type { PluginAgentDefinition, PluginManifest, ToolDecoratorConfig, AgentDecoratorConfig } from './types';
