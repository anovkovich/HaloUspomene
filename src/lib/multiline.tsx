import React from "react";

export function MultilineText({ text }: { text: string }) {
  const lines = text.split(/\\n|\n/);
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}
