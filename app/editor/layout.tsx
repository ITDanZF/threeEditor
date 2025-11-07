"use client";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import EditPanel from "./compenents/EditPanel";
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-row bg-[#0b1220]">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={30} minSize={15}>
          <EditPanel />
        </Panel>
        <PanelResizeHandle className="w-1.5 md:w-2 cursor-col-resize bg-white/10 hover:bg-cyan-400/50 active:bg-cyan-400/70 transition-colors" />
        <Panel>
          <main className="w-full h-full">{children}</main>
        </Panel>
      </PanelGroup>
    </div>
  );
}
