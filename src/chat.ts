import { normalizeChannel } from './domain';

export function embedParents(hostname: string, extra = ''): string[] {
  const parents = [hostname, ...extra.split(',')].map(value => value.trim()).filter(Boolean);
  if (!parents.length || parents.some(value => !/^(localhost|[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)$/i.test(value))) {
    throw new Error('Twitch parent configuration must contain hostnames only, separated by commas.');
  }
  return [...new Set(parents)];
}
export interface ChatProvider {
  readonly name: string;
  readonly capabilities: { readonly readMessages: false; readonly signedInViaEmbed: true };
  embedUrl(channel: string, parents: string[]): string;
  externalUrl(channel: string): string;
}
export const twitchChat: ChatProvider = {
  name: 'Twitch', capabilities: { readMessages: false, signedInViaEmbed: true },
  embedUrl(channel, parents) {
    const url = new URL(`https://www.twitch.tv/embed/${normalizeChannel(channel)}/chat`);
    for (const parent of parents) url.searchParams.append('parent', parent);
    url.searchParams.set('darkpopout', '');
    return url.href;
  },
  externalUrl: channel => `https://www.twitch.tv/popout/${normalizeChannel(channel)}/chat?popout=`,
};
