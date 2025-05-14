"use client";
import React from "react";
// import FileSearchSetup from "./file-search-setup"; // Commented out as it's not used
// import WebSearchConfig from "./websearch-config"; // Commented out as it's not used
// import FunctionsView from "./functions-view"; // Commented out as it's not used
// import PanelConfig from "./panel-config"; // Commented out as it's not used
// import useToolsStore from "@/stores/useToolsStore"; // Commented out if no state is used from it

export default function ContextPanel() {
  /* // Commenting out unused state variables if useToolsStore is fully commented out or if these specific states are unused
  const {
    fileSearchEnabled,
    setFileSearchEnabled,
    webSearchEnabled,
    setWebSearchEnabled,
    functionsEnabled,
    setFunctionsEnabled,
  } = useToolsStore();
  */
  return (
    <div className="h-full p-8 w-full bg-[#f9f9f9] rounded-t-xl md:rounded-none border-l-1 border-stone-100">
      <div className="flex flex-col overflow-y-scroll h-full">
        {/*
        <PanelConfig
          title="File Search"
          tooltip="Allows to search a knowledge base (vector store)"
          enabled={fileSearchEnabled}
          setEnabled={setFileSearchEnabled}
        >
          <FileSearchSetup />
        </PanelConfig>
        <PanelConfig
          title="Web Search"
          tooltip="Allows to search the web"
          enabled={webSearchEnabled}
          setEnabled={setWebSearchEnabled}
        >
          <WebSearchConfig />
        </PanelConfig>
        <PanelConfig
          title="Functions"
          tooltip="Allows to use locally defined functions"
          enabled={functionsEnabled}
          setEnabled={setFunctionsEnabled}
        >
          <FunctionsView />
        </PanelConfig>
        */}
      </div>
    </div>
  );
}
