const SIZE = 400

export type CropArea = {
  x: number
  y: number
  width: number
  height: number
}

export async function cropToAvatar(file: File, area: CropArea): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  try {
    const canvas = new OffscreenCanvas(SIZE, SIZE)
    const context = canvas.getContext('2d')
    if (context === null) {
      throw new Error('Canvas 2D is not supported')
    }
    context.imageSmoothingQuality = 'high'
    context.drawImage(bitmap, area.x, area.y, area.width, area.height, 0, 0, SIZE, SIZE)
    return await canvas.convertToBlob({ type: 'image/png' })
  } finally {
    bitmap.close()
  }
}
