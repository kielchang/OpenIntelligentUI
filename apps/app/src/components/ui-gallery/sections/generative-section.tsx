"use client";

import { GallerySection } from "../gallery-section";
import { GenerativeSample } from "../generative-sample";
import { SAMPLE_PAYLOADS } from "../sample-payloads";

export function GenerativeSection() {
  return (
    <GallerySection
      id="generative"
      intro={
        <>
          <p>
            這一段用<strong>正式的串流渲染器</strong>重播六欄位 payload：先看到 placeholder，css 到齊後出現預覽 iframe 逐段 morph，html 完成後換成有橋接的 Websandbox，再注入 jsFunctions 與逐條執行 jsExpressions。
            每筆都能看原始 prompt、四個程式欄位的原文，並下載成獨立 HTML（與 ExportOverlay 走同一個組裝器）。
          </p>
          <p>
            repo 裡真正存在的輸出只有三份 seed 範本與技能文件裡的 SVG；帳單分攤、3D 飛機、海岸地圖等 launch 片段<strong>沒有留下輸出</strong>，所以這裡依技能規範重建，並明確標示。
            需要 esm.sh／jsdelivr／USGS 的範例在離線環境會顯示自己的錯誤狀態，這也是契約要求的可見失敗。
          </p>
          <p>
            沙箱裡的「送出」按鈕會呼叫 <code>Websandbox.connection.remote.sendPrompt</code>；展示頁用 stub 接住並以 toast 顯示，不會啟動代理。
          </p>
        </>
      }
    >
      <div className="gal-stack">
        {SAMPLE_PAYLOADS.map((sample, index) => (
          <GenerativeSample key={sample.id} sample={sample} autoStart={index < 2} />
        ))}
      </div>
    </GallerySection>
  );
}
