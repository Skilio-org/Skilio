import { useEffect, useState } from "react";

const changed = "account-avatar-updated";

export function accountAvatarUrl(userId: string, version = "") {
  const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  return `${base}/api/v1/users/avatar/${userId}${version ? `?v=${version}` : ""}`;
}

export function markAccountAvatarUpdated(userId: string) {
  const version = String(Date.now());
  localStorage.setItem(`account-avatar-version:${userId}`, version);
  window.dispatchEvent(new Event(changed));
  return version;
}

export function useAccountAvatarUrl(userId?: string) {
  const [version, setVersion] = useState("");
  useEffect(() => {
    const update = () => setVersion(userId ? localStorage.getItem(`account-avatar-version:${userId}`) ?? "" : "");
    update();
    window.addEventListener(changed, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(changed, update);
      window.removeEventListener("storage", update);
    };
  }, [userId]);
  return userId ? accountAvatarUrl(userId, version) : undefined;
}
