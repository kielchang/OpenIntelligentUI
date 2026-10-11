import { SEED_SAMPLES } from "./seed-templates";
import { SVG_FLOW_SAMPLE } from "./svg-three-step-flow";
import { BILL_SPLITTER_SAMPLE } from "./bill-splitter";
import { WEEKEND_COMPARE_SAMPLE } from "./weekend-compare";
import { MONTY_HALL_SAMPLE } from "./monty-hall";
import { BICYCLE_GEARS_SAMPLE } from "./bicycle-gears";
import { CHARTJS_BAR_SAMPLE } from "./chartjs-bar";
import { AIRPLANE_3D_SAMPLE } from "./airplane-3d";
import { COASTAL_TRIP_SAMPLE } from "./coastal-trip";
import type { GallerySample } from "./types";

export type { GallerySample, SampleNetwork, SampleProvenance } from "./types";
export { RECONSTRUCTED_LABEL, toContent } from "./types";

/** 展示區的範例清單：先是內建範本，再是技能原文，最後是依技能規範重建的示範。 */
export const SAMPLE_PAYLOADS: GallerySample[] = [
  ...SEED_SAMPLES,
  SVG_FLOW_SAMPLE,
  BILL_SPLITTER_SAMPLE,
  WEEKEND_COMPARE_SAMPLE,
  MONTY_HALL_SAMPLE,
  BICYCLE_GEARS_SAMPLE,
  CHARTJS_BAR_SAMPLE,
  AIRPLANE_3D_SAMPLE,
  COASTAL_TRIP_SAMPLE,
];
