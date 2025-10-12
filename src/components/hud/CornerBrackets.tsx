import React from "react";

export const CornerBrackets: React.FC = () => {
  const corner = (pos: "tl" | "tr" | "bl" | "br") => {
    const base = "pointer-events-none absolute w-12 h-12";
    const border = "border-2 border-primary/60";
    const glow = "shadow-[0_0_20px_rgba(255,140,0,0.4)]";
    const common = `${border} ${glow}`;
    switch (pos) {
      case "tl":
        return <div className={`${base} top-16 left-0`}><div className={`absolute inset-0 border-r-0 border-b-0 rounded-tl ${common}`} /></div>;
      case "tr":
        return <div className={`${base} top-16 right-0`}><div className={`absolute inset-0 border-l-0 border-b-0 rounded-tr ${common}`} /></div>;
      case "bl":
        return <div className={`${base} bottom-0 left-0`}><div className={`absolute inset-0 border-r-0 border-t-0 rounded-bl ${common}`} /></div>;
      case "br":
        return <div className={`${base} bottom-0 right-0`}><div className={`absolute inset-0 border-l-0 border-t-0 rounded-br ${common}`} /></div>;
    }
  };
  return (
    <>
      {corner("tl")}
      {corner("tr")}
      {corner("bl")}
      {corner("br")}
    </>
  );
};
