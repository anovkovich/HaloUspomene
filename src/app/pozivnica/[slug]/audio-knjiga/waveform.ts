export function drawWaveform(
  canvas: HTMLCanvasElement,
  analyser: AnalyserNode,
  color: string,
  animationRef: { current: number | null }
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    animationRef.current = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    ctx!.fillStyle = "transparent";
    ctx!.clearRect(0, 0, canvas.width, canvas.height);

    ctx!.lineWidth = 2;
    ctx!.strokeStyle = color;
    ctx!.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx!.moveTo(x, y);
      } else {
        ctx!.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx!.lineTo(canvas.width, canvas.height / 2);
    ctx!.stroke();
  }

  draw();
}
