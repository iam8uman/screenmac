/**
 * Screen recording file size maths. Everything here is plain bitrate arithmetic:
 * size = bitrate × duration. No averages or presets are assumed; the visitor supplies
 * the bitrate, or a sample file to measure it from.
 */

/** Megabytes are decimal (1 MB = 1,000,000 bytes), like Finder shows them. */
export const BYTES_PER_MB = 1_000_000;

export interface Duration {
  hours: number;
  minutes: number;
  seconds: number;
}

export const toSeconds = (d: Duration) => Math.max(0, (d.hours || 0) * 3600 + (d.minutes || 0) * 60 + (d.seconds || 0));

/** Bytes for a total bitrate in kilobits per second over a duration in seconds. */
export function bytesFor(totalKbps: number, seconds: number): number {
  if (!(totalKbps > 0) || !(seconds > 0)) return 0;
  return (totalKbps * 1000 * seconds) / 8;
}

/** Size from separate video (megabits/s) and audio (kilobits/s) bitrates. */
export function sizeFromBitrates(videoMbps: number, audioKbps: number, seconds: number): number {
  const total = Math.max(0, videoMbps || 0) * 1000 + Math.max(0, audioKbps || 0);
  return bytesFor(total, seconds);
}

/** The average total bitrate (kbps) of an existing file, from its size and length. */
export function bitrateFromSample(sampleMB: number, sampleSeconds: number): number {
  if (!(sampleMB > 0) || !(sampleSeconds > 0)) return 0;
  return (sampleMB * BYTES_PER_MB * 8) / 1000 / sampleSeconds;
}

/** The highest average total bitrate (kbps) that keeps a recording under a size limit. */
export function maxBitrateForTarget(targetMB: number, seconds: number): number {
  if (!(targetMB > 0) || !(seconds > 0)) return 0;
  return (targetMB * BYTES_PER_MB * 8) / 1000 / seconds;
}

/** Human-readable decimal size: 950 KB, 12.4 MB, 1.21 GB. */
export function formatBytes(bytes: number): string {
  if (!(bytes > 0)) return "0 MB";
  if (bytes < BYTES_PER_MB) return `${Math.round(bytes / 1000)} KB`;
  if (bytes < 1000 * BYTES_PER_MB) {
    const mb = bytes / BYTES_PER_MB;
    return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
  }
  return `${(bytes / (1000 * BYTES_PER_MB)).toFixed(2)} GB`;
}

/** 850 kbps or 4.2 Mbps. */
export function formatKbps(kbps: number): string {
  if (!(kbps > 0)) return "0 kbps";
  if (kbps < 1000) return `${Math.round(kbps)} kbps`;
  const mbps = kbps / 1000;
  return `${mbps < 10 ? mbps.toFixed(1) : Math.round(mbps)} Mbps`;
}
