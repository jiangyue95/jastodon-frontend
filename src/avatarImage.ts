const SIZE = 400

export async function cropToAvatar(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  try {
    const side = Math.min(bitmap.width, bitmap.height)
    const sx = (bitmap.width - side) / 2
    const sy = (bitmap.height - side) / 2
    const canvas = new OffscreenCanvas(SIZE, SIZE)
    const context = canvas.getContext('2d')
    if (context === null) {
      throw new Error('Canvas 2D is not supported')
    }
    context.imageSmoothingQuality = 'high'
    context.drawImage(bitmap, sx, sy, side, side, 0, 0, SIZE, SIZE)
    return await canvas.convertToBlob({ type: 'image/png' })
  } finally {
    bitmap.close()
  }
}
