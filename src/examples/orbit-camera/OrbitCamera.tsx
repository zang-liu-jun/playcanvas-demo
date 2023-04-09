import { useEffect, useRef } from "react"
// css
import styles from "./OrbitCamera.module.scss"
// hook
import useViewModel from "./hooks/useViewModel"
import usePointerStyle from "./hooks/usePointerStyle"
// url
import { publicURL, baseURL } from "@/config"
// icon
import { RedoOutlined } from '@ant-design/icons'

export default function OrbitCamera() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { orbitCameraRef } = useViewModel(canvasRef, `${baseURL}/models/picModel.glb`)
  const { pointerStyle, handleMouseDown, handleMouseUp } = usePointerStyle()

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <RedoOutlined onClick={()=>{orbitCameraRef.current?.reposition()}} style={{ position: "absolute", fontSize: "24px", top: "20px", right: "20px", cursor: "pointer" }} />
        <canvas ref={canvasRef} style={{ cursor: pointerStyle }} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} />
      </div>
    </div>
  )
}