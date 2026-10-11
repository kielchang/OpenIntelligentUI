import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { basicCatalog } from "@copilotkit/a2ui-renderer";
import { FORM_STYLES_CSS, IMPORTMAP, SVG_CLASSES_CSS, THEME_CSS } from "@repo/design-system";
import { tableCatalog } from "@/components/generative-ui/table-catalog";
import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_BASIC_COMPONENTS,
  A2UI_BASIC_FUNCTIONS,
  A2UI_ICON_NAMES,
  A2UI_RUNTIME_EXTRA_FUNCTIONS,
  A2UI_V08_COMPONENTS,
  COLLECTIONS,
  CONTROLLED_COMPONENTS,
  SANDBOX_MATERIALS,
  SKILL_MATERIALS,
  TABLE_CATALOG_ID,
} from "../catalog-content";
import { A2UI_SURFACES, surfaceMessages } from "../a2ui-catalog-samples";

const APP_ROOT = resolve(__dirname, "../../../..");
const REPO_ROOT = resolve(APP_ROOT, "../..");

/** 從 renderer 的實際安裝位置往上找 @a2ui/web_core 的 schema 檔，避免寫死 pnpm 路徑 */
function webCoreSchema(version: "v0_8" | "v0_9", file: string): Record<string, unknown> {
  const appRequire = createRequire(import.meta.url);
  const rendererRequire = createRequire(appRequire.resolve("@copilotkit/a2ui-renderer"));
  let dir = dirname(rendererRequire.resolve(version === "v0_9" ? "@a2ui/web_core/v0_9/basic_catalog" : "@a2ui/web_core/v0_8"));
  for (let depth = 0; depth < 6; depth += 1) {
    const candidate = resolve(dir, "schemas", file);
    if (existsSync(candidate)) return JSON.parse(readFileSync(candidate, "utf8"));
    dir = dirname(dir);
  }
  throw new Error(`schema not found: ${version}/${file}`);
}

const names = (entries: { name: string }[]) => entries.map((entry) => entry.name);
const sorted = (list: Iterable<string>) => [...list].sort();

describe("A2UI basic catalog inventory", () => {
  it("lists exactly the components and functions the installed basicCatalog exposes", () => {
    expect(basicCatalog.id).toBe(A2UI_BASIC_CATALOG_ID);
    expect(sorted(basicCatalog.components.keys())).toEqual(sorted(names(A2UI_BASIC_COMPONENTS)));
    expect(A2UI_BASIC_COMPONENTS).toHaveLength(18);
    const runtimeFunctions = sorted(basicCatalog.functions.keys());
    expect(runtimeFunctions).toEqual(sorted([...names(A2UI_BASIC_FUNCTIONS), ...A2UI_RUNTIME_EXTRA_FUNCTIONS]));
    expect(A2UI_BASIC_FUNCTIONS).toHaveLength(14);
    expect(A2UI_RUNTIME_EXTRA_FUNCTIONS).toHaveLength(11);
  });

  it("keeps the component order, icon names and enums in sync with the v0.9 schema file", () => {
    const schema = webCoreSchema("v0_9", "basic_catalog.json") as {
      catalogId: string;
      components: Record<string, { allOf?: { properties?: Record<string, { oneOf?: { enum?: string[] }[] }> }[] }>;
    };
    expect(schema.catalogId).toBe(A2UI_BASIC_CATALOG_ID);
    expect(Object.keys(schema.components)).toEqual(names(A2UI_BASIC_COMPONENTS));
    const iconProps = schema.components.Icon.allOf?.find((part) => part.properties?.name)?.properties?.name;
    const iconEnum = iconProps?.oneOf?.find((branch) => branch.enum)?.enum;
    expect(iconEnum).toEqual(A2UI_ICON_NAMES);
    expect(A2UI_ICON_NAMES).toHaveLength(59);
    const schemaFunctions = Object.keys((schema as unknown as { functions: Record<string, unknown> }).functions);
    expect(sorted(schemaFunctions)).toEqual(sorted(names(A2UI_BASIC_FUNCTIONS)));
  });

  it("documents the v0.8 standard catalog that form.py still targets", () => {
    const schema = webCoreSchema("v0_8", "standard_catalog_definition.json") as { components: Record<string, unknown> };
    expect(sorted(Object.keys(schema.components))).toEqual(A2UI_V08_COMPONENTS);
    const v09 = new Set(names(A2UI_BASIC_COMPONENTS));
    const v08 = new Set(A2UI_V08_COMPONENTS);
    expect([...v08].filter((name) => !v09.has(name))).toEqual(["MultipleChoice"]);
    expect([...v09].filter((name) => !v08.has(name))).toEqual(["ChoicePicker"]);
    const formPy = readFileSync(resolve(REPO_ROOT, "apps/agent/src/form.py"), "utf8");
    expect(formPy).toContain('"surfaceUpdate"');
    expect(formPy).toContain('"beginRendering"');
    expect(formPy).toContain('"usageHint"');
    expect(formPy).not.toContain("createSurface");
  });

  it("matches the project's table catalog id", () => {
    expect(tableCatalog.id).toBe(TABLE_CATALOG_ID);
    expect(sorted(tableCatalog.components.keys())).toEqual(["Table"]);
  });
});

describe("A2UI gallery surfaces", () => {
  const referenceIds = (component: Record<string, unknown>): string[] => {
    const refs: string[] = [];
    for (const key of ["child", "trigger", "content"]) {
      if (typeof component[key] === "string") refs.push(component[key] as string);
    }
    const children = component.children;
    if (Array.isArray(children)) refs.push(...(children as string[]));
    else if (children && typeof children === "object") refs.push((children as { componentId: string }).componentId);
    if (Array.isArray(component.tabs)) refs.push(...(component.tabs as { child: string }[]).map((tab) => tab.child));
    return refs;
  };

  it("uses unique ids, one root per surface and only components from the basic catalog", () => {
    for (const surface of A2UI_SURFACES) {
      const ids = surface.components.map((component) => component.id as string);
      expect(new Set(ids).size, surface.id).toBe(ids.length);
      expect(ids.filter((id) => id === "root"), surface.id).toHaveLength(1);
      for (const component of surface.components) {
        expect(basicCatalog.components.has(component.component as string), `${surface.id}:${component.id}`).toBe(true);
        for (const ref of referenceIds(component)) {
          expect(ids, `${surface.id}:${component.id} → ${ref}`).toContain(ref);
        }
      }
      for (const name of surface.covers) {
        expect(surface.components.some((component) => component.component === name), `${surface.id} covers ${name}`).toBe(true);
      }
    }
  });

  it("covers all 18 basic catalog components across the three surfaces", () => {
    const used = new Set(A2UI_SURFACES.flatMap((surface) => surface.components.map((component) => component.component as string)));
    expect(sorted(used)).toEqual(sorted(names(A2UI_BASIC_COMPONENTS)));
  });

  it("validates every sample component against the catalog's own schema", () => {
    for (const surface of A2UI_SURFACES) {
      for (const component of surface.components) {
        const api = basicCatalog.components.get(component.component as string) as { schema: { safeParse: (value: unknown) => { success: boolean; error?: unknown } } };
        const full = api.schema.safeParse(component);
        if (full.success) continue;
        const props: Record<string, unknown> = { ...component };
        delete props.id;
        delete props.component;
        const propsOnly = api.schema.safeParse(props);
        expect(propsOnly.success, `${surface.id}:${component.id} ${JSON.stringify(full.error ?? propsOnly.error).slice(0, 300)}`).toBe(true);
      }
    }
  });

  it("emits createSurface before the data model and the component tree", () => {
    for (const surface of A2UI_SURFACES) {
      const messages = surfaceMessages(surface);
      expect(messages[0]).toEqual({ version: "v0.9", createSurface: { surfaceId: surface.id, catalogId: A2UI_BASIC_CATALOG_ID } });
      expect(messages.at(-1)).toHaveProperty("updateComponents.surfaceId", surface.id);
      if (surface.data) expect(messages[1]).toHaveProperty("updateDataModel.value", surface.data);
      expect(messages.every((message) => message.version === "v0.9")).toBe(true);
    }
  });
});

describe("other collections", () => {
  it("indexes each collection once and points demos at page anchors", () => {
    const ids = COLLECTIONS.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const entry of COLLECTIONS) {
      if (entry.demo) expect(entry.demo.startsWith("#")).toBe(true);
    }
    expect(COLLECTIONS.find((entry) => entry.id === "a2ui-basic")?.count).toContain("18");
    expect(COLLECTIONS.find((entry) => entry.id === "a2ui-basic")?.count).toContain("14");
    expect(COLLECTIONS.find((entry) => entry.id === "a2ui-basic")?.count).toContain(String(A2UI_RUNTIME_EXTRA_FUNCTIONS.length));
    expect(COLLECTIONS.find((entry) => entry.id === "a2ui-basic")?.count).toContain(String(A2UI_ICON_NAMES.length));
  });

  it("lists the frontend tools the hook actually registers", () => {
    const hook = readFileSync(resolve(APP_ROOT, "src/hooks/use-generative-ui-examples.tsx"), "utf8");
    for (const entry of CONTROLLED_COMPONENTS) {
      if (entry.name.startsWith("（")) {
        expect(hook).toContain("useDefaultRenderTool");
        continue;
      }
      expect(hook, entry.name).toContain(`name: "${entry.name}"`);
      expect(hook, entry.hook).toContain(entry.hook);
    }
    expect(hook).toContain('ignoredTools = ["generate_form"]');
  });

  it("names every skill directory with its own frontmatter description", () => {
    const skillsDir = resolve(REPO_ROOT, "apps/agent/skills");
    expect(sorted(readdirSync(skillsDir))).toEqual(sorted(names(SKILL_MATERIALS)));
    for (const skill of SKILL_MATERIALS) {
      const text = readFileSync(resolve(skillsDir, skill.name, "SKILL.md"), "utf8");
      const description = /^description:\s*"(.+)"\s*$/m.exec(text)?.[1];
      expect(description, skill.name).toBe(skill.description);
    }
  });

  it("only lists sandbox materials the design system really ships", () => {
    const byGroup = Object.fromEntries(SANDBOX_MATERIALS.map((group) => [group.group, group.items]));
    for (const token of [...byGroup["色彩 token（21）"], ...byGroup["字體與圓角（6）"]]) {
      expect(THEME_CSS, token).toContain(`${token}:`);
    }
    expect(byGroup["色彩 token（21）"]).toHaveLength(21);
    for (const cls of byGroup["SVG 色階（9）"]) {
      expect(SVG_CLASSES_CSS, cls).toContain(`${cls} `);
    }
    for (const cls of byGroup["圖表輔助類別（7）"]) {
      expect(new RegExp(`\\${cls}[\\s,{]`).test(SVG_CLASSES_CSS), cls).toBe(true);
    }
    for (const selector of byGroup["表單控制項（預先套好樣式）"]) {
      const base = selector.replace(/\[.*$/, "");
      expect(FORM_STYLES_CSS, selector).toContain(base);
      const type = /type=(\w+)/.exec(selector)?.[1];
      if (type) expect(FORM_STYLES_CSS, selector).toMatch(new RegExp(`type="?${type}"?`));
    }
    const bareImports = Object.keys(IMPORTMAP.imports).filter((key) => !key.endsWith("/"));
    expect(sorted(bareImports)).toEqual(sorted(byGroup["CDN 函式庫 importmap（4）"]));
  });
});
