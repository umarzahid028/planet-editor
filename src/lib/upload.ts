/**
 * Offline image upload handler: embeds the picked file as a base64 data URL.
 * No network required — the image is stored inline in the document.
 *
 * For online use, pass your own handler to `<Editor uploadImage={...} />` that
 * uploads to your backend and resolves to the stored URL.
 */
export async function base64Upload(
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
): Promise<string> {
  if (!file) throw new Error("No file provided")

  // Simulate progress so the upload UI animates.
  for (let progress = 0; progress <= 100; progress += 25) {
    if (abortSignal?.aborted) throw new Error("Upload cancelled")
    await new Promise((resolve) => setTimeout(resolve, 60))
    onProgress?.({ progress })
  }

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read image file"))
    if (abortSignal) {
      abortSignal.addEventListener("abort", () => {
        reader.abort()
        reject(new Error("Upload cancelled"))
      })
    }
    reader.readAsDataURL(file)
  })
}
