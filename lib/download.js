/**
 * Triggers a direct browser file download for a given URL and filename.
 * Leverages Supabase Storage's ?download parameter when applicable.
 * Falls back to Blob fetch and final window.open if CORS or errors occur.
 * 
 * @param {string} fileUrl The URL of the file to download.
 * @param {string} fileName The desired name for the downloaded file.
 */
export async function triggerDownload(fileUrl, fileName) {
  if (!fileUrl) return;

  try {
    // Clean file name
    let cleanName = fileName || "";
    if (!cleanName && fileUrl.includes("/")) {
      cleanName = fileUrl.split("/").pop().split("?")[0];
    }
    cleanName = cleanName || "download";

    // 1. Check if it's a Supabase storage URL (contains "/storage/v1/object/public/")
    // If it is, append `?download=` to instruct Supabase to serve with Content-Disposition: attachment.
    if (fileUrl.includes("/storage/v1/object/public/")) {
      const downloadUrl = fileUrl + (fileUrl.includes("?") ? "&" : "?") + "download=" + encodeURIComponent(cleanName);
      
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = cleanName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 2. Fetch-blob method for non-Supabase URLs to avoid opening in tab
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (err) {
    console.error("Direct download failed, falling back to opening URL:", err);
    // Ultimate fallback: open in a new tab
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  }
}

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 * 
 * @param {File} fileObj The browser File object.
 * @param {object} supabase Supabase client instance.
 * @param {string} bucket Bucket name (default: "class-materials").
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
export async function uploadFile(fileObj, supabase, bucket = "class-materials") {
  if (!fileObj || typeof fileObj === "string") return fileObj || "";
  
  const fileExt = fileObj.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  
  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileObj);
  if (uploadErr) throw uploadErr;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
  
  return publicUrl;
}

