import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';
import { architectureChatbotRouteRef } from './routes';

export const plugin = createPlugin({
  id: 'architecture-chatbot',
  routes: {
    root: architectureChatbotRouteRef,
  },
});

export const ArchitectureChatbotPage = plugin.provide(
  createRoutableExtension({
    name: 'ArchitectureChatbotPage',
    component: () => import('./components/ArchitectureChatbotPage').then(m => m.ArchitectureChatbotPage),
    mountPoint: architectureChatbotRouteRef,
  }),
);