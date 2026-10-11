/** 60-30-10 配額示意：中性 / 結構 / 高飽和強調 */
export function BudgetBar() {
  return (
    <div className="gal-stack">
      <div className="gal-budget" aria-label="60-30-10 色彩配額">
        <span style={{ flex: 60, background: "var(--surface-quaternary)" }}>60% 中性／背景</span>
        <span style={{ flex: 30, background: "var(--border-hover)" }}>30% 結構／邊框</span>
        <span style={{ flex: 10, background: "linear-gradient(135deg, var(--color-lilac-dark), var(--color-mint-dark))", color: "#fff" }}>10%</span>
      </div>
      <p className="gal-lede">
        10% 的高飽和預算由「警示」與「圖表重點色」共用。專案裡吃掉這份預算的東西：lilac→mint 漸層 CTA（cta-btn、TemplateCard Apply、CategoryFilter 作用態、DesktopTipModal 按鈕）、
        七色 CHART_COLORS、QrModal 狀態點、錯誤橫幅的橘框。疲勞來自面積 × 頻率，所以 toast 四秒自清、banner 同時只有一個，比選色更重要。
      </p>
    </div>
  );
}
