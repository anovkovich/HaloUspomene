const GAP_SECONDS = 1.5;

export async function mergeAndDownload(
  urls: string[],
  filename: string
): Promise<void> {
  const audioCtx = new OfflineAudioContext(1, 1, 44100); // temporary for decoding

  // Fetch and decode all audio files
  const buffers: AudioBuffer[] = [];
  for (const url of urls) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    // Use a fresh online context for decoding (OfflineAudioContext.decodeAudioData works too)
    const onlineCtx = new AudioContext();
    const decoded = await onlineCtx.decodeAudioData(arrayBuffer);
    buffers.push(decoded);
    await onlineCtx.close();
  }

  if (buffers.length === 0) return;

  // Calculate total duration
  const sampleRate = buffers[0].sampleRate;
  const totalDuration = buffers.reduce(
    (sum, buf) => sum + buf.duration,
    0
  ) + GAP_SECONDS * (buffers.length - 1);

  const totalSamples = Math.ceil(totalDuration * sampleRate);

  // Create offline context for rendering
  const offlineCtx = new OfflineAudioContext(1, totalSamples, sampleRate);

  let offset = 0;
  for (const buf of buffers) {
    const source = offlineCtx.createBufferSource();
    source.buffer = buf;
    source.connect(offlineCtx.destination);
    source.start(offset);
    offset += buf.duration + GAP_SECONDS;
  }

  const rendered = await offlineCtx.startRendering();

  // Encode as WAV
  const wavBlob = encodeWAV(rendered);

  // Trigger download
  const url = URL.createObjectURL(wavBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  audioCtx.startRendering(); // cleanup the temporary context
}

function encodeWAV(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitsPerSample = 16;

  const data = buffer.getChannelData(0);
  const dataLength = data.length * (bitsPerSample / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, "WAVE");

  // fmt sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // sub-chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  // Write PCM samples
  let pcmOffset = 44;
  for (let i = 0; i < data.length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(pcmOffset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    pcmOffset += 2;
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
