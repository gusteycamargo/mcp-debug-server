import z from "zod";
import { mcpServer } from "../mcpServer.js";

interface ToolSettings {
  schema: z.ZodRawShape;
}

export function Tool(settings: ToolSettings): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    propertyDescriptor: PropertyDescriptor
  ) {
    const originalMethod = propertyDescriptor.value;

    mcpServer.tool(
      propertyKey.toString(),
      settings.schema,
      async (props: z.infer<z.ZodObject<typeof settings.schema>>) => {
        return await originalMethod.call(target, props);
      }
    );
  };
}
