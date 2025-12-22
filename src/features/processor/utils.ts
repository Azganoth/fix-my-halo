export function download(content: Blob, name: string) {
  const url = URL.createObjectURL(content);

  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const K = 1024;
const SIZES = ["Bytes", "KB", "MB", "GB", "TB"];

export function formatBytes(bytes: number, decimals = 0) {
  if (!bytes) return "0 Bytes";

  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(K));
  return `${parseFloat((bytes / Math.pow(K, i)).toFixed(dm))} ${SIZES[i]}`;
}
