/* ── 10 actions ── */

/**
 * Button：`<button class="lm-btn lm-btn--<variant> [lm-btn--sm] [lm-btn--icon]">`。
 * 圖示放 `svg.lm-btn__icon`（16px、currentColor、aria-hidden）；載入態放 `svg.lm-btn__spinner` 並設 `aria-busy="true"`。
 */
export interface ButtonProps {
  /** 變體：primary（ink）、secondary（邊框）、ghost（透明）、danger（高強度 danger）、brand（品牌漸層，一頁最多一顆）。 */
  variant: "primary" | "secondary" | "ghost" | "danger" | "brand";
  /** 尺寸：md 36px 高（預設）、sm 28px 高（加 `.lm-btn--sm`）。 */
  size?: "md" | "sm";
  /** 純圖示按鈕：加 `.lm-btn--icon` 成正方形，必須同時提供 `ariaLabel`。 */
  iconOnly?: boolean;
  /** 純圖示按鈕的可讀名稱（`aria-label`）。 */
  ariaLabel?: string;
  /** 停用：原生 `disabled`；視覺 `opacity: .5`、`cursor: not-allowed`。 */
  disabled?: boolean;
  /** 載入中：設 `aria-busy="true"`，並把文字改成進行式（「儲存中…」）；不要同時 `disabled`。 */
  busy?: boolean;
  /** 以連結呈現時用 `<a class="lm-btn" href>`；否則 `<button type="button">`。 */
  href?: string;
  /** 按鈕文字（繁體中文、動詞開頭）。 */
  children: string;
}

/**
 * SegmentedControl：`<div class="lm-seg" role="group" aria-label>` 內放多顆 `<button class="lm-seg__btn" aria-pressed>`。
 * 單選由消費者切換 `aria-pressed`（同組只有一顆為 true）；圖示放 `svg.lm-seg__icon`。
 */
export interface SegmentedControlProps {
  /** 群組的可讀名稱（`aria-label`），說明這組在切換什麼，例如「顯示範圍」。 */
  ariaLabel: string;
  /** 選項 2–5 個；`pressed` 為 true 的那顆套選中樣式。 */
  options: Array<{
    /** 顯示文字（四字以內）。 */
    label: string;
    /** 回傳給消費者的值。 */
    value: string;
    /** 是否為目前選中（對應 `aria-pressed="true"`）。 */
    pressed?: boolean;
    /** 16px inline SVG（aria-hidden），放在文字左側。 */
    icon?: string;
    /** 單顆停用（原生 `disabled`）。 */
    disabled?: boolean;
  }>;
  /** 整組停用：每顆都加 `disabled`。 */
  disabled?: boolean;
  /** 點擊後由消費者更新 `aria-pressed`；元件不保存狀態。 */
  onChange?: (value: string) => void;
}
