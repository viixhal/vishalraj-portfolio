export function openExternalUrl(url) {
  if (!url) return;

  const childWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (childWindow) childWindow.opener = null;
}
