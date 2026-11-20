import { useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import type { CropArea } from './avatarImage'

type Props = {
  imageUrl: string
  onAreaChange: (area: CropArea) => void
}

function AvatarCropper({ imageUrl, onAreaChange }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  return (
    <>
      <div className="avatar-cropper">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_croppedArea: Area, croppedAreaPixels: Area) =>
            onAreaChange(croppedAreaPixels)}
        />
      </div>
      <label htmlFor="avatar-zoom">Zoom</label>
      <input
        id="avatar-zoom"
        type="range"
        min={1}
        max={3}
        step={0.01}
        value={zoom}
        onChange={(event) => setZoom(Number(event.currentTarget.value))}
      />
    </>
  )
}

export default AvatarCropper
