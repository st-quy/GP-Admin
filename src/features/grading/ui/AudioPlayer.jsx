import { useState, useRef, useEffect } from "react"
import { Button, Slider, Dropdown } from "antd"
import { CaretRightOutlined, PauseOutlined, DownloadOutlined } from "@ant-design/icons"

export default function AudioPlayer({ audioUrl, audioFileName = "audio-file" }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hoverTime, setHoverTime] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0 })
  const audioRef = useRef(null)
  const sliderRef = useRef(null)
  const [playbackRate, setPlaybackRate] = useState(1)
  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setPlaybackRate(1)

    // If audio was playing, make sure it stops
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [audioUrl])

  useEffect(() => {
    const audio = audioRef.current

    const setAudioData = () => {
      setDuration(audio.duration)
    }

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime)
    }

    audio.addEventListener("loadeddata", setAudioData)
    audio.addEventListener("timeupdate", setAudioTime)
    audio.addEventListener("ended", () => setIsPlaying(false))

    return () => {
      audio.removeEventListener("loadeddata", setAudioData)
      audio.removeEventListener("timeupdate", setAudioTime)
      audio.removeEventListener("ended", () => setIsPlaying(false))
    }
  }, [audioRef])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  // Format time in MM:SS
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`
  }

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSliderChange = (value) => {
    const newTime = (value / 100) * duration
    setCurrentTime(newTime)
    audioRef.current.currentTime = newTime
  }

  const handleSliderHover = (e) => {
    if (!sliderRef.current || !duration) return

    const sliderRect = sliderRef.current.getBoundingClientRect()
    const offsetX = Math.max(0, Math.min(e.clientX - sliderRect.left, sliderRect.width))
    const percentage = (offsetX / sliderRect.width) * 100
    const time = (percentage / 100) * duration

    setHoverTime(time)
    setTooltipPosition({ left: offsetX })
  }

  const handleSliderLeave = () => {
    setHoverTime(null)
  }

  const downloadAudio = async () => {
    try {
      const response = await fetch(audioUrl, { mode: "cors" });
      if (!response.ok) {
        throw new Error(`Failed to fetch the audio file. Status: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${audioFileName}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Revoke the object URL to free up memory
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading the audio file:", error);
    }
  }

  const speedOptions = [
    { key: "0.25", label: "0.25x" },
    { key: "0.5", label: "0.5x" },
    { key: "1", label: "1x" },
    { key: "1.5", label: "1.5x" },
    { key: "2", label: "2x" },
  ]

  const handleSpeedChange = (e) => {
    const newRate = Number.parseFloat(e.key)
    setPlaybackRate(newRate)
  }

  // Calculate slider percentage
  const sliderValue = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center space-x-4 w-full max-w-md p-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <Button
        type="text"
        onClick={togglePlay}
        icon={isPlaying ? <PauseOutlined /> : <CaretRightOutlined />}
        className="text-2xl flex items-center justify-center"
        title={isPlaying ? "Pause" : "Play"}
      />

      {/* Current time */}
      <span className="text-xs w-10">{formatTime(currentTime)}</span>

      {/* Progress bar */}
      <div
        className="relative w-[29.625rem]"
        ref={sliderRef}
        onMouseMove={handleSliderHover}
        onMouseLeave={handleSliderLeave}
      >
        <Slider
          value={sliderValue}
          onChange={handleSliderChange}
          tooltip={{ formatter: null }}
          styles={{
            track: { backgroundColor: "#003087", height: 4 },
            rail: { backgroundColor: "#8899A8", height: 4 },
          }}
        />

        {/* Custom tooltip that follows cursor */}
        {hoverTime !== null && (
          <div
            className="absolute top-[-30px] transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs"
            style={{ left: `${tooltipPosition.left}px` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {/* Duration */}
      <span className="text-xs w-10">{formatTime(duration)}</span>

      {/* Playback speed dropdown */}
      <Dropdown
        menu={{
          items: speedOptions,
          onClick: handleSpeedChange,
          selectedKeys: [playbackRate.toString()],
        }}
        placement="bottomRight"
      >
        <Button type="text" className="text-xs w-10 flex items-center justify-center">
          {playbackRate}x
        </Button>
      </Dropdown>

      {/* Download button */}
      <Button
        type="text"
        onClick={downloadAudio}
        icon={<DownloadOutlined />}
        className="text-2xl flex items-center justify-center"
        title="Download"
      />
    </div>
  )
}
