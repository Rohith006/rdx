import React from "react";
import { CopyBlock, tomorrow } from "react-code-blocks";
import raw from "raw.macro";
import CopyToClipboard from "../../../UI/CopyToClipboard";

export default function TrackerUseScript() {
  const tracker = raw("./trackerUsage.txt");
  return (
    <div>
      <CopyBlock
        text={tracker}
        language="javascript"
        theme={tomorrow}
        showLineNumbers={true}
      />
      <div className="tracker_copy">
        <CopyToClipboard value={tracker} />
      </div>
    </div>
  );
}
