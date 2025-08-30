import { useRef, useState, useEffect } from "react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import "react-day-picker/dist/style.css"

interface DateTimeInputProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  label?: string
}

export default function DateTimeInput({ value, onChange, label }: DateTimeInputProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // estado para la hora (string "HH:MM")
  const [time, setTime] = useState(value ? format(value, "HH:mm") : "")

  // sincronizar la hora cuando cambia el value externo
  useEffect(() => {
    if (value) setTime(format(value, "HH:mm"))
  }, [value])

  // cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange?.(null)
      return
    }
    const [h, m] = time.split(":").map(Number)
    const newDate = new Date(date)
    if (!isNaN(h) && !isNaN(m)) {
      newDate.setHours(h, m)
    }
    onChange?.(newDate)
    setOpen(false)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value)
    if (value) {
      const [h, m] = e.target.value.split(":").map(Number)
      const newDate = new Date(value)
      if (!isNaN(h) && !isNaN(m)) {
        newDate.setHours(h, m)
        onChange?.(newDate)
      }
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full space-y-1">
      {label && <label className="label-text">{label}</label>}

      <input
        type="text"
        readOnly
        value={value ? format(value, "dd/MM/yyyy") : ""}
        placeholder="Selecciona una fecha"
        onClick={() => setOpen(!open)}
        className="input input-bordered w-full cursor-pointer"
      />

      <input
        type="time"
        value={time}
        onChange={handleTimeChange}
        className="input input-bordered w-full"
      />

      {open && (
        <div className="absolute z-10 top-full left-0 mt-2 bg-base-100 shadow-lg rounded-lg p-2 border border-base-300">
          <DayPicker
            mode="single"
            selected={value ?? undefined}
            onSelect={handleDateSelect}
          />
        </div>
      )}
    </div>
  )
}
