import React, { useEffect, useState } from "react";
import copy_start from "../assets/images/icons/copy_start.svg";
import copy_end from "../assets/images/icons/copy_end.svg";
import copy_done from "../assets/images/icons/copy_done.svg";
import copy from "copy-to-clipboard";

function CopyToClipboard({ value }) {
  const [pending, setPending] = useState(true);
  const [clicked, setCLicked] = useState(false);
  const [active, setActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currClass, setClass] = useState(null);
  const [currImg, setImg] = useState(copy_start);

  useEffect(() => {
    if (pending) {
      setClass("copy_to pending");
      setImg(copy_start);
    } else if (clicked) {
      setClass("copy_to clicked");
      setImg(copy_end);
    } else if (active) {
      setClass("copy_to active");
      setImg(copy_end);
    } else {
      setClass("copy_to copied");
      setImg(copy_done);
    }
  }, [active, clicked, pending, copied]);

  const copyFunc = () => {
    copy(JSON.stringify(value));
    setCLicked(true);
    setPending(false);
    setTimeout(() => {
      setActive(true);
      setCLicked(false);
    }, 2000);

    setTimeout(() => {
      setCopied(true);
      setActive(false);
    }, 10000);
  };

  return (
    <div className={`flex items-center ${currClass}`} onClick={copyFunc}>
      <img src={currImg} alt="copy" />
      <span className="ml-1">{pending ? "Copy to clipboard" : "Copied"}</span>
    </div>
  );
}

export default CopyToClipboard;
