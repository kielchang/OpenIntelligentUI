"use client";

import { Component, type ReactNode } from "react";

/** 把第三方渲染器的例外侷限在單一 demo 內，不讓整頁白掉 */
export class RenderBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
