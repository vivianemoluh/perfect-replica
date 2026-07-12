import { useState } from "react";
import { uploadMedia } from "@/lib/admin-utils";

export function useCloudinaryUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File, folder = "uploads"): Promise<string | null> {
    setIsLoading(true);
    setError(null);
    try {
      return await uploadMedia(file, folder);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { upload, isLoading, error };
}
