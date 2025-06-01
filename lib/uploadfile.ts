// utils/uploadfile.ts
//usage const imageUrl = await uploadToGoogleDrive(imageFile, "image-name-prefix");
export async function uploadToGoogleDrive(
  file: File,
  namePrefix = "upload"
): Promise<string> {
  if (!file) {
    throw new Error("Please provide a file to upload");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("namePrefix", namePrefix);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Upload failed");
  }

  const data = await response.json();
  return data.url;
}
