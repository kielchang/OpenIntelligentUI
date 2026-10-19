/**
 * 產生 /gallery 的靜態重製版 Artifact：dist/index.html（fragment）與 dist/assets/**。
 * 執行：cd artifact-gen && node build.mjs
 */
import { buildPage } from "./page";
import { renderOverviewSection } from "./sections/overview";
import { renderMethodSection } from "./sections/method";
import { renderDesignSystemSection } from "./sections/design-system";
import { renderColorSection } from "./sections/color";
import { renderChatShellSection } from "./sections/chat-shell";
import { renderResponseSection } from "./sections/response";
import { renderGenerativeSection } from "./sections/generative";
import { renderUnmountedSection } from "./sections/unmounted";
import { renderAgentDefinedSection } from "./sections/agent-defined";
import { renderCatalogSection } from "./sections/catalogs";
import { renderFindingsSection } from "./sections/findings";

buildPage([
  renderOverviewSection(),
  renderMethodSection(),
  renderDesignSystemSection(),
  renderColorSection(),
  renderChatShellSection(),
  renderResponseSection(),
  renderGenerativeSection(),
  renderUnmountedSection(),
  renderAgentDefinedSection(),
  renderCatalogSection(),
  renderFindingsSection(),
]);
