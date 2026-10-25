import { useState } from "react";
import { server } from "@/lib/server-client";
import { TimeRangePicker } from "./TimeRangePicker";
import { calculateDashboard, type DashboardMetrics } from "@/lib/calc";
import AttendanceDashboard from "./DashboardCards";

type LogLevel = "active" | "idle" | "locked";

interface LogEntry {
    id: number;
    timestamp: Date;
    idle: LogLevel;
    name: string;
    tab: string;
    userId: string;
    ip: string;
    windowFocus: boolean;
    url: string;
}

type MeetInfo = {
    id: number;
    userId: string;
    name: string;
    code: string;
    createdAt: Date;
    status: "enabled" | "disabled";
    meetStart: Date;
    meetEnd: Date;
}

interface MeetStatsProps {
    meetId: number,
    updateSideBar: () => void

}

const COLUMNS: { key: keyof LogEntry; label: string }[] = [
    { key: "timestamp", label: "Timestamp" },
    { key: "idle", label: "Idle" },
    { key: "name", label: "Name" },
    { key: "tab", label: "Tab" },
    { key: "userId", label: "User ID" },
    { key: "ip", label: "Ip" },
    { key: "windowFocus", label: "Browser Focused" },
    { key: "url", label: "url" }

];

const LEVEL_BADGE: Record<LogLevel, string> = {
    active: "badge-info",
    idle: "badge-warning",
    locked: "badge-error",
};

const tempMeetInfo: MeetInfo = {
    id: 1,
    userId: "",
    name: "",
    code: "",
    createdAt: new Date(),
    status: "disabled",
    meetStart: new Date(),
    meetEnd: new Date(Date.now() + 10_800_000)
}

export default function MeetStats({ meetId, updateSideBar }: MeetStatsProps) {
    const [monitoringEnabled, setMonitoringEnabled] = useState(false);
    const [meetInfo, setMeetinfo] = useState<MeetInfo>(tempMeetInfo)
    const [logs, setLogs] = useState<LogEntry[]>([]); // TODO: populate from your API / websocket
    const [page, setPage] = useState(1);
    const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
    const totalPages = Math.max(1, Math.ceil(logs.length / pageSize!));
    // Clamp so the page stays valid if logs shrink or page size changes
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize!;
    const endIndex = Math.min(startIndex + pageSize!, logs.length);
    const visibleLogs = useMemo(
        () => logs.slice(startIndex, endIndex),
        [logs, startIndex, endIndex]
    );
    const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | undefined>()

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };
    const calculateMetrics = () =>{
        setDashboardMetrics(calculateDashboard(logs,{ classStart: meetInfo.meetStart, classEnd: meetInfo.meetEnd}))
    }
    const toggleMonitoring = async () => {
        // TODO: call your backend to start/stop monitoring
        console.log("tried")
        const toggle = await server.host.meeting.id({ id: meetId }).toggle.get()
        console.log("worked?")
        if (toggle.status === 200) {
            updateSideBar()
            await getMeetInfo(meetId)
        }
        else {
            console.error("what")
        }
    };
    const changeMeetTime = async (startDate: Date, endDate: Date) => {
        const change = await server.host.meeting.id({ id: meetId }).settime.post({
            startTime: startDate,
            endTime: endDate
        })
        console.log(change.status)
        if (change.status === 200) {
            updateSideBar()
            await getMeetInfo(meetId)
        }
        else {
            console.error("what")
        }
    }

    const getLogs = async (id: number) => {
        const logs = await server.host.meeting.id({ id: id }).logs.get()
        if (logs.data) {
            setLogs(logs.data)
        }
    }
    const getMeetInfo = async (id: number) => {
        const info = await server.host.meeting.id({ id: id }).get()
        if (info.data) {
            const data = info.data[0]
            if (data) {
                setMeetinfo(data!)
                if (data.status === "enabled") {
                    setMonitoringEnabled(true)
                }
                else {
                    setMonitoringEnabled(false)
                }
            }

        }
    }
    useEffect(() => {
        const fetchData = async () => {
            try {
                await getLogs(meetId)
                await getMeetInfo(meetId)
                setDashboardMetrics(undefined)
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };
        fetchData()
    }, [meetId])

    const downloadLogs = () => {
        // TODO: swap for a server-side export if logs are paginated
        const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
        const header = COLUMNS.map((c) => escape(c.label)).join(",");
        const rows = logs.map((log) =>
            COLUMNS.map((c) => escape(String(log[c.key]))).join(",")
        );
        const csv = [header, ...rows].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `monitoring-logs-${new Date().toISOString()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-base-200 p-6">
            <div className="mx-auto max-w-7xl">
                <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Monitoring log of {meetInfo.name}</h1>
                        <p className="text-sm opacity-70">
                            Monitoring is {monitoringEnabled ? "on" : "off"}.
                        </p>
                        <p className="text-sm opacity-70">
                            Meet Started at {meetInfo.meetStart.toLocaleString()}.
                        </p>

                        <p className="text-sm opacity-70">
                            Meet Ended at {meetInfo.meetEnd.toLocaleString()}.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            className={`btn ${monitoringEnabled ? "btn-error" : "btn-primary"}`}
                            onClick={toggleMonitoring}
                        >
                            {monitoringEnabled ? "Disable monitoring" : "Enable monitoring"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={calculateMetrics}
                            disabled={logs.length === 0}
                        >
                            calculateMetrics
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={downloadLogs}
                            disabled={logs.length === 0}
                        >
                            Download logs
                        </button>
                    </div>
                </header>

                <div className="overflow-x-auto rounded-box bg-base-100 shadow">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                {COLUMNS.map((column) => (
                                    <th key={column.key}>{column.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleLogs.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={COLUMNS.length}
                                        className="py-12 text-center opacity-70"
                                    >
                                        No log entries yet. Enable monitoring to start collecting
                                        logs.
                                    </td>
                                </tr>
                            ) : (
                                visibleLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="whitespace-nowrap">{log.timestamp.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${LEVEL_BADGE[log.idle]}`}>
                                                {log.idle}
                                            </span>
                                        </td>
                                        <td>{log.name}</td>
                                        <td>{log.tab}</td>
                                        <td>{log.userId}</td>
                                        <td>{log.ip}</td>
                                        <td className="font-mono text-xs">{log.windowFocus ? "Focused" : "Unfocused    "}</td>
                                        <td>{log.url}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>


                <footer className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm">
                        <label htmlFor="page-size" className="opacity-70">
                            Rows per page
                        </label>
                        <select
                            id="page-size"
                            className="select select-bordered select-sm"
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                        <span className="opacity-70">
                            {logs.length === 0
                                ? "0 entries"
                                : `${startIndex + 1}–${endIndex} of ${logs.length}`}
                        </span>
                    </div>

                    <div className="join">
                        <button
                            type="button"
                            className="btn join-item btn-sm"
                            onClick={() => setPage(1)}
                            disabled={currentPage === 1}
                            aria-label="First page"
                        >
                            «
                        </button>
                        <button
                            type="button"
                            className="btn join-item btn-sm"
                            onClick={() => setPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="btn join-item btn-sm pointer-events-none">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            type="button"
                            className="btn join-item btn-sm"
                            onClick={() => setPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                        <button
                            type="button"
                            className="btn join-item btn-sm"
                            onClick={() => setPage(totalPages)}
                            disabled={currentPage === totalPages}
                            aria-label="Last page"
                        >
                            »
                        </button>
                    </div>
                </footer>
                <div className="overflow-x-auto rounded-box bg-base-100 shadow">
                    <TimeRangePicker
                        onChange={(startDate, endDate) => {
                            changeMeetTime(startDate, endDate)
                        }}
                    />
                </div>
                <div className="overflow-x-auto rounded-box bg-base-100 shadow">
                    <AttendanceDashboard metrics={dashboardMetrics} />
                </div>
            </div>
        </div>
    );
}
