import { z } from "zod";
import { Tool } from "../decorators/Tool.js";
import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import {
  DISCORD_DEVELOPMENT_CHANNEL_ID,
  DISCORD_PRODUCTION_CHANNEL_ID,
  DISCORD_STAGING_CHANNEL_ID,
  DISCORD_TOKEN,
} from "../constants/environment.js";

export type DiscordChannel = "development" | "staging" | "production";

const channelMap = {
  development: DISCORD_DEVELOPMENT_CHANNEL_ID,
  staging: DISCORD_STAGING_CHANNEL_ID,
  production: DISCORD_PRODUCTION_CHANNEL_ID,
};

const baseSchema = z.object({
  channelType: z
    .enum(["development", "staging", "production"])
    .describe(
      "Tipo de canal do Discord, deve ser um dos seguintes: development, staging, production"
    ),
});

const schemaMessageList = z
  .object({
    limit: z
      .number()
      .optional()
      .describe("Número de mensagens a retornar (opcional, padrão: 50)"),
  })
  .merge(baseSchema);

const schemaMessage = z
  .object({
    messageId: z.string().describe("ID da mensagem a retornar"),
  })
  .merge(baseSchema);

export class GetDiscordMessageTool {
  private client: Client | null = null;
  private initialized = false;

  private async initialize() {
    if (!this.initialized) {
      if (!DISCORD_TOKEN) {
        throw new Error(
          "DISCORD_TOKEN não está definido nas variáveis de ambiente"
        );
      }

      try {
        this.client = new Client({
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ],
        });
        await this.client.login(DISCORD_TOKEN);
        this.initialized = true;
      } catch (error) {
        throw new Error(
          `Erro ao fazer login no Discord: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`
        );
      }
    }
  }

  private async getChannel(channelType: DiscordChannel) {
    await this.initialize();
    const channel = await this.client!.channels.fetch(channelMap[channelType]);

    if (!channel || !(channel instanceof TextChannel)) {
      throw new Error("Canal não encontrado ou não é um canal de texto");
    }

    return channel;
  }

  @Tool({ schema: schemaMessageList.shape })
  async getDiscordChannelMessageList({
    channelType,
    limit,
  }: z.infer<typeof schemaMessageList>) {
    try {
      const channel = await this.getChannel(channelType);

      const messages = await channel.messages.fetch({ limit });
      const formattedMessages = Array.from(messages.values()).map((msg) => ({
        content: msg.content,
        author: msg.author.username,
        timestamp: msg.createdAt.toISOString(),
        id: msg.id,
        embeds: msg.embeds.map((embed) => ({
          title: embed.title,
          description: embed.description,
          url: embed.url,
          color: embed.color,
          fields: embed.fields,
          author: embed.author,
          footer: embed.footer,
          image: embed.image,
          thumbnail: embed.thumbnail,
          timestamp: embed.timestamp,
        })),
      }));

      return {
        content: [
          {
            type: "text",
            text: `Messages from ${channel.name}:\n${JSON.stringify(
              formattedMessages,
              null,
              2
            )}`,
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `Error getting messages from Discord: ${errorMessage}`,
          },
        ],
      };
    }
  }

  @Tool({ schema: schemaMessage.shape })
  async getDiscordChannelMessage({
    channelType,
    messageId,
  }: z.infer<typeof schemaMessage>) {
    try {
      const channel = await this.getChannel(channelType);

      const message = await channel.messages.fetch(messageId);
      if (!message) {
        throw new Error("Mensagem não encontrada");
      }
      const formattedMessages = [
        {
          content: message.content,
          author: message.author.username,
          timestamp: message.createdAt.toISOString(),
          id: message.id,
          embeds: message.embeds.map((embed) => ({
            title: embed.title,
            description: embed.description,
            url: embed.url,
            color: embed.color,
            fields: embed.fields,
            author: embed.author,
            footer: embed.footer,
            image: embed.image,
            thumbnail: embed.thumbnail,
            timestamp: embed.timestamp,
          })),
        },
      ];

      return {
        content: [
          {
            type: "text",
            text: `Messages from ${channel.name}:\n${JSON.stringify(
              formattedMessages,
              null,
              2
            )}`,
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `Error getting messages from Discord: ${errorMessage}`,
          },
        ],
      };
    }
  }
}
