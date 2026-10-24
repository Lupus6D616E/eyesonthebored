
import { useMemo, useState } from "react";

export type PersonMetrics = {
    userId: string;
    name: string;
    totalTimeMs: number;
    focusedTimeMs: number;
    focusPercentage: number;
    firstSeen: Date | null;
    lastSeen: Date | null;
    sessionCount: number;
};

export type DashboardMetrics = {
    totalUniqueAttendees: number;
    totalAttendanceMs: number;
    totalFocusedMs: number;
    averageFocusPercentage: number;
    people: PersonMetrics[];
};

type Props = {
    metrics: DashboardMetrics | undefined;
};


function AttendanceDashboardSkeleton() {
    return (
        <main className="min-h-screen bg-base-200 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header skeleton */}
                <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <div className="skeleton h-8 w-64" />
                        <div className="skeleton h-4 w-80 max-w-full" />
                    </div>
                    <div className="skeleton h-8 w-32 rounded-full" />
                </header>

                {/* Summary cards skeleton */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="card border border-base-300 bg-base-100 shadow-sm"
                        >
                            <div className="card-body gap-4 p-5">
                                <div className="flex items-center justify-between">
                                    <div className="skeleton h-4 w-28" />
                                    <div className="skeleton size-6 rounded-lg" />
                                </div>
                                <div className="skeleton h-9 w-32" />
                                <div className="skeleton h-3 w-40 max-w-full" />
                            </div>
                        </div>
                    ))}
                </section>

                {/* Table skeleton */}
                <section className="card border border-base-300 bg-base-100 shadow-sm">
                    <div className="card-body gap-4 p-4 sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-2">
                                <div className="skeleton h-6 w-40" />
                                <div className="skeleton h-4 w-28" />
                            </div>
                            <div className="skeleton h-12 w-full sm:max-w-xs" />
                        </div>

                        <div className="overflow-x-auto rounded-box border border-base-300">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {[
                                            "Attendee",
                                            "Attendance",
                                            "Focused Time",
                                            "Focus",
                                            "Sessions",
                                            "First Seen",
                                            "Last Seen",
                                        ].map((heading) => (
                                            <th key={heading}>
                                                <span className="text-base-content/60">
                                                    {heading}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="skeleton size-10 shrink-0 rounded-full" />
                                                    <div className="space-y-2">
                                                        <div className="skeleton h-4 w-28" />
                                                        <div className="skeleton h-3 w-20" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="skeleton h-4 w-16" />
                                            </td>
                                            <td>
                                                <div className="skeleton h-4 w-16" />
                                            </td>
                                            <td>
                                                <div className="skeleton h-4 w-20" />
                                            </td>
                                            <td>
                                                <div className="skeleton h-4 w-8" />
                                            </td>
                                            <td>
                                                <div className="skeleton h-4 w-24" />
                                            </td>
                                            <td>
                                                <div className="skeleton h-4 w-24" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

// Convert milliseconds to hours and minutes.
// Seconds are intentionally discarded.
function formatDuration(ms: number): string {
    const totalMinutes = Math.floor(Math.max(0, ms) / 60_000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;

    return `${hours}h ${minutes}m`;
}

function formatDate(date: Date | null): string {
    if (!date) return "—";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatPercentage(value: number): string {
    return `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`;
}

function SummaryCard({
    title,
    value,
    description,
    icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: string;
}) {
    return (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-base-content/60">{title}</p>
                    <span
                        className="text-xl text-primary"
                        aria-hidden="true"
                    >
                        {icon}
                    </span>
                </div>
                <p className="text-3xl font-bold tracking-tight">
                    {value}
                </p>
                <p className="text-xs text-base-content/60">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default function AttendanceDashboard({ metrics }: Props) {
    if (!metrics) {
        return <AttendanceDashboardSkeleton />;
    }
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<
        "name" | "attendance" | "focus" | "sessions"
    >("name");
    const [sortDirection, setSortDirection] = useState<
        "asc" | "desc"
    >("asc");



    const people = useMemo(() => {
        const query = search.trim().toLowerCase();

        return [...metrics.people]
            .filter((person) =>
                person.name.toLowerCase().includes(query)
            )
            .sort((a, b) => {
                let comparison = 0;

                switch (sortBy) {
                    case "name":
                        comparison = a.name.localeCompare(b.name);
                        break;
                    case "attendance":
                        comparison = a.totalTimeMs - b.totalTimeMs;
                        break;
                    case "focus":
                        comparison = a.focusPercentage - b.focusPercentage;
                        break;
                    case "sessions":
                        comparison = a.sessionCount - b.sessionCount;
                        break;
                }

                return sortDirection === "asc"
                    ? comparison
                    : -comparison;
            });
    }, [metrics.people, search, sortBy, sortDirection]);

    function changeSort(
        column: typeof sortBy
    ) {
        if (sortBy === column) {
            setSortDirection((current) =>
                current === "asc" ? "desc" : "asc"
            );
        } else {
            setSortBy(column);
            setSortDirection(
                column === "name" ? "asc" : "desc"
            );
        }
    }

    function sortLabel(column: typeof sortBy) {
        if (sortBy !== column) return "↕";
        return sortDirection === "asc" ? "↑" : "↓";
    }

    const averageFocus = Number.isFinite(
        metrics.averageFocusPercentage
    )
        ? metrics.averageFocusPercentage
        : 0;

    return (
        <main className="min-h-screen bg-base-200 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold sm:text-3xl">
                            Attendance Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-base-content/60">
                            Monitor attendance, session activity, and focus.
                        </p>
                    </div>

                    <div className="badge badge-primary badge-outline gap-2 p-3">
                        <span className="inline-block size-2 rounded-full bg-success" />
                        {metrics.totalUniqueAttendees} attendees
                    </div>
                </header>

                {/* Summary cards */}
                <section
                    aria-label="Attendance summary"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <SummaryCard
                        title="Unique Attendees"
                        value={metrics.totalUniqueAttendees.toLocaleString()}
                        description="Total individual participants"
                        icon="♙"
                    />

                    <SummaryCard
                        title="Total Attendance"
                        value={formatDuration(metrics.totalAttendanceMs)}
                        description="Combined time in attendance"
                        icon="◷"
                    />

                    <SummaryCard
                        title="Focused Time"
                        value={formatDuration(metrics.totalFocusedMs)}
                        description="Combined time focused"
                        icon="◎"
                    />

                    <SummaryCard
                        title="Average Focus"
                        value={formatPercentage(averageFocus)}
                        description="Average attendee focus percentage"
                        icon="◩"
                    />
                </section>

                {/* People table */}
                <section className="card border border-base-300 bg-base-100 shadow-sm">
                    <div className="card-body gap-4 p-4 sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="card-title text-xl">
                                    Attendee Details
                                </h2>
                                <p className="text-sm text-base-content/60">
                                    {people.length} of {metrics.people.length} people
                                </p>
                            </div>

                            <label className="input input-bordered flex w-full items-center gap-2 sm:max-w-xs">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="size-4 opacity-60"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m16 16 4 4" />
                                </svg>
                                <input
                                    type="search"
                                    className="grow"
                                    placeholder="Search attendees..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    aria-label="Search attendees by name"
                                />
                            </label>
                        </div>

                        <div className="overflow-x-auto rounded-box border border-base-300">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>
                                            <button
                                                className="btn btn-ghost btn-xs"
                                                onClick={() => changeSort("name")}
                                            >
                                                Attendee {sortLabel("name")}
                                            </button>
                                        </th>
                                        <th>Attendance</th>
                                        <th>Focused Time</th>
                                        <th>
                                            <button
                                                className="btn btn-ghost btn-xs"
                                                onClick={() => changeSort("focus")}
                                            >
                                                Focus {sortLabel("focus")}
                                            </button>
                                        </th>
                                        <th>
                                            <button
                                                className="btn btn-ghost btn-xs"
                                                onClick={() => changeSort("sessions")}
                                            >
                                                Sessions {sortLabel("sessions")}
                                            </button>
                                        </th>
                                        <th>First Seen</th>
                                        <th>Last Seen</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {people.map((person) => {
                                        const focus = Number.isFinite(
                                            person.focusPercentage
                                        )
                                            ? person.focusPercentage
                                            : 0;

                                        const focusColor =
                                            focus >= 80
                                                ? "progress-success"
                                                : focus >= 50
                                                    ? "progress-warning"
                                                    : "progress-error";

                                        const initials = person.name
                                            .trim()
                                            .split(/\s+/)
                                            .map((part) => part[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase();

                                        return (
                                            <tr key={person.userId}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar placeholder">
                                                            <div className="w-10 rounded-full bg-primary/10 text-primary">
                                                                <span className="text-xs font-semibold">
                                                                    {initials || "?"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">
                                                                {person.name}
                                                            </div>
                                                            <div className="text-xs text-base-content/50">
                                                                ID: {person.userId}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="whitespace-nowrap font-medium">
                                                    {formatDuration(person.totalTimeMs)}
                                                </td>

                                                <td className="whitespace-nowrap">
                                                    {formatDuration(person.focusedTimeMs)}
                                                </td>

                                                <td className="min-w-36">
                                                    <div className="flex items-center gap-2">
                                                        <progress
                                                            className={`progress ${focusColor} w-16`}
                                                            value={Math.min(100, Math.max(0, focus))}
                                                            max={100}
                                                            aria-label={`Focus ${formatPercentage(focus)}`}
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {formatPercentage(focus)}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>{person.sessionCount}</td>

                                                <td className="whitespace-nowrap text-sm">
                                                    {formatDate(person.firstSeen)}
                                                </td>

                                                <td className="whitespace-nowrap text-sm">
                                                    {formatDate(person.lastSeen)}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {people.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-12 text-center text-base-content/60"
                                            >
                                                {metrics.people.length === 0
                                                    ? "No attendee data available."
                                                    : "No attendees match your search."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <p className="text-xs text-base-content/50">
                            All durations are displayed in hours and minutes.
                            Seconds are omitted.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
