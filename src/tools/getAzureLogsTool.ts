import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import { Tool } from "../decorators/Tool.js";

const execAsync = promisify(exec);

const schema = z.object({
  resourceGroup: z.string().describe("Nome do grupo de recursos do Azure"),
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
}

export class GetAzureLogsTool {
  @Tool({ schema: schema.shape })
  async getAzureContainerAppLogs({
    resourceGroup,
    containerAppName,
    revision,
    tail,
    follow,
  }: z.infer<typeof schema>) {
    try {
      let allLogs = "";

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

        allLogs += `\n=== Logs of replica: ${replica} ===\n`;

        if (stderr) allLogs += `\n${stderr}\n`;
        else allLogs += `\n${stdout}\n`;

        allLogs += "=".repeat(50) + "\n";
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
