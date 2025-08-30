import { Project, Node } from "ts-morph";
import { writeFileSync } from "fs";
import { relative } from "path";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
const out: Record<string, any[]> = {};

for (const sf of project.getSourceFiles()) {
  const rel = relative(process.cwd(), sf.getFilePath());
  const entries: any[] = [];

  sf.forEachDescendant(node => {
    if (!Node.isFunctionLikeDeclaration(node) && !Node.isMethodDeclaration(node)) return;
    const start = node.getStartLineNumber();
    const end = node.getEndLineNumber();
    const name = (node as any).getName?.();

    let firstParagraph = "";
    let logdoc: string | undefined;

    const docs = (node as any).getJsDocs?.() ?? [];
    for (const d of docs) {
      const text = d.getComment() ?? "";
      if (!firstParagraph && text) {
        const [first] = text.split(/\n\s*\n/);
        firstParagraph = (first ?? "").trim();
      }
      for (const t of d.getTags?.() ?? []) {
        const tn = t.getTagName?.();
        const tv = t.getComment?.()?.trim();
        if (tn === "logdoc") logdoc = tv || "";
        if (tn === "nolog") logdoc = ""; // sentinel: suppress
      }
    }

    entries.push({ start, end, name, firstParagraph, logdoc });
  });

  if (entries.length) out[rel] = entries;
}

writeFileSync("dist/logdoc-map.json", JSON.stringify(out));
console.log("Wrote dist/logdoc-map.json");