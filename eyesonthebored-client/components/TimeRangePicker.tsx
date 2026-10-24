
import { useState } from "react";

type TimeRangePickerProps = {
    onChange: (start: Date, end: Date) => void;
    initialDate?: string;
    initialStart?: string;
    initialEnd?: string;
};

export function TimeRangePicker({
    onChange,
    initialDate = new Date().toLocaleDateString("en-CA"),
    initialStart = "09:00",
    initialEnd = "17:00",
}: TimeRangePickerProps) {
    const [date, setDate] = useState(initialDate);
    const [startTime, setStartTime] = useState(initialStart);
    const [endTime, setEndTime] = useState(initialEnd);

    function emitChange(
        nextDate: string,
        nextStart: string,
        nextEnd: string
    ) {
        if (!nextDate || !nextStart || !nextEnd) return;
        console.log("pressed?")
        const start = new Date(`${nextDate}T${nextStart}:00`);
        const end = new Date(`${nextDate}T${nextEnd}:00`);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return;
        }

        onChange(start, end);
    }

    function handleDateChange(value: string) {
        setDate(value);
    }

    function handleStartChange(value: string) {
        setStartTime(value);
    }

    function handleEndChange(value: string) {
        setEndTime(value);
    }

    return (
        <div className="flex flex-wrap items-end gap-4">
            <label className="form-control w-full max-w-xs">
                <span className="label-text mb-1">Date</span>
                <input
                    type="date"
                    className="input input-bordered w-full"
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                />
            </label>

            <label className="form-control w-full max-w-xs">
                <span className="label-text mb-1">Time started</span>
                <input
                    type="time"
                    step={60}
                    className="input input-bordered w-full"
                    value={startTime}
                    onChange={(e) => handleStartChange(e.target.value)}
                />
            </label>

            <label className="form-control w-full max-w-xs">
                <span className="label-text mb-1">Time ended</span>
                <input
                    type="time"
                    step={60}
                    className="input input-bordered w-full"
                    value={endTime}
                    onChange={(e) => handleEndChange(e.target.value)}
                />
            </label>

            <button
                type="button"
                className={`btn btn-primary"}`}
                onClick={() =>{emitChange(date, startTime,endTime)}}
            >
                Set Time 
            </button>
        </div>
    );
}
