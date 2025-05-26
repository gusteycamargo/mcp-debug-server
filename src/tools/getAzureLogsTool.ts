import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import { Tool } from "../decorators/Tool.js";

const execAsync = promisify(exec);

const schema = z.object({
  containerAppName: z.string().describe("Nome do Container App"),
  revision: z
    .string()
    .optional()
    .describe("Revisão específica do Container App (opcional)"),
  tail: z
    .number()
    .optional()
    .describe("Número de linhas para retornar (opcional)"),
  follow: z
    .boolean()
    .optional()
    .describe("Acompanhar logs em tempo real (opcional)"),
  search: z
    .string()
    .optional()
    .describe("Filtrar logs que contenham esta string (opcional)"),
  subscription: z
    .string()
    .optional()
    .describe("Nome da assinatura do Azure (opcional)"),
});

class AzureContainerAppCliCommand {
  private command = "az containerapp logs show";

  constructor(
    private readonly resourceGroup: string,
    private readonly containerAppName: string,
    private readonly revision?: string,
    private readonly tail?: number,
    private readonly follow?: boolean
  ) {
    this.command += ` --name ${this.containerAppName} --resource-group ${this.resourceGroup}`;

    if (this.revision) this.command += ` --revision ${this.revision}`;
    if (this.tail) this.command += ` --tail ${this.tail}`;
    if (this.follow) this.command += ` --follow`;
  }

  getCommand() {
    return this.command;
  }

  static async getContainerAppName(containerAppName: string) {
    const { stdout, stderr } = await execAsync(
      `az containerapp list --query "[?contains(name, '${containerAppName.toLowerCase()}')].name" -o tsv`
    );

    if (stderr) throw new Error(`Error on get container app name: ${stderr}`);

    return stdout.trim();
  }

  static async getResourceGroup(containerAppName: string) {
    const { stdout, stderr } = await execAsync(
      `az containerapp list --query "[?name=='${containerAppName}'].resourceGroup" -o tsv`
    );

    if (stderr) throw new Error(`Error on get resource group: ${stderr}`);

    return stdout.trim();
  }

  static async changeSubscription(subscription: string) {
    const { stdout, stderr } = await execAsync(`az account list --output json`);

    if (stderr) throw new Error(`Error on list subscriptions: ${stderr}`);

    const subscriptions = JSON.parse(stdout);

    const subscriptionId = subscriptions.find((sub: { name: string }) =>
      sub.name.toLowerCase().includes(subscription.toLowerCase())
    );

    if (!subscriptionId)
      throw new Error(`Subscription ${subscription} not found`);

    const { stderr: changeSubscriptionError } = await execAsync(
      `az account set --subscription ${subscriptionId.id}`
    );

    if (changeSubscriptionError)
      throw new Error(
        `Error on change subscription: ${changeSubscriptionError}`
      );
  }
}

export class GetAzureLogsTool {
  @Tool({ schema: schema.shape })
  async getAzureContainerAppLogs({
    containerAppName: rawContainerAppName,
    revision,
    tail,
    follow,
    search,
    subscription,
  }: z.infer<typeof schema>) {
    try {
      let allLogs = "";
      if (subscription) {
        await AzureContainerAppCliCommand.changeSubscription(subscription);
      }

      const containerAppName =
        await AzureContainerAppCliCommand.getContainerAppName(
          rawContainerAppName
        );

      const resourceGroup = await AzureContainerAppCliCommand.getResourceGroup(
        containerAppName
      );

      const replicas = await this.getReplicaNames(
        resourceGroup,
        containerAppName,
        revision
      );

      for (const replica of replicas) {
        const command = new AzureContainerAppCliCommand(
          resourceGroup,
          containerAppName,
          revision,
          tail,
          follow
        ).getCommand();

        const { stdout, stderr } = await execAsync(command);

        let logs = stderr ? `\n${stderr}\n` : `\n${stdout}\n`;

        if (search) {
          logs = logs
            .split("\n")
            .filter((line) => line.includes(search))
            .join("\n");
        }

        allLogs += `\n=== Logs of replica: ${replica} ===\n${logs}`;
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Logs of the Container App ${containerAppName}:\n${allLogs}`,
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text" as const,
            text: `Error executing the command: ${errorMessage}`,
          },
        ],
      };
    }
  }

  async getReplicaNames(
    resourceGroup: string,
    containerAppName: string,
    revision?: string
  ): Promise<string[]> {
    let command = `az containerapp replica list --name ${containerAppName} --resource-group ${resourceGroup}`;
    if (revision) command += ` --revision ${revision}`;
    command += ` --output json`;

    const { stdout: replicasJson, stderr } = await execAsync(command);

    if (stderr) throw new Error(`Error executing the command: ${stderr}`);

    const replicas = JSON.parse(replicasJson);

    return replicas.map((replica: { name: string }) => replica.name);
  }
}
