import { DocumentNode } from "graphql";

export function getOperationName(doc: DocumentNode): string {
  for (const def of doc.definitions) {
    if (def.kind === "OperationDefinition") {
      return def.name?.value || "";
    }
  }

  return "";
}
