import { hostnameSetting } from "@/components/SettingsCard";
type LogLevel = "active" | "idle" | "locked";

type LogEntry = {
    id: number;
    timestamp: Date;
    name: string;
    idle: LogLevel;
    tab: string;
    userId: string;
    ip: string;
    windowFocus: boolean;
    url: string;
};

type PersonMetrics = {
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

type Options = {
    classStart: Date;
    classEnd: Date;
    maxSampleMs?: number;
    sessionGapMs?: number;
    minSessionMs?: number;
};

const DEFAULT_MAX_SAMPLE_MS = 40_000;
const DEFAULT_SESSION_GAP_MS = 120_000;
const DEFAULT_MIN_SESSION_MS = 0;
const DEFAULT_HOSTNAME = await hostnameSetting.getValue()

function isMeetUrl(rawUrl: string): boolean {
    try {
        const url = new URL(rawUrl);
        console.log(DEFAULT_HOSTNAME)
        return (
            url.protocol === "https:" &&
            url.hostname === DEFAULT_HOSTNAME
        );
    } catch {
        return false;
    }
}

export function calculateDashboard(
    logs: LogEntry[],
    options: Options
): DashboardMetrics {
    const {
        classStart,
        classEnd,
        maxSampleMs = DEFAULT_MAX_SAMPLE_MS,
        sessionGapMs = DEFAULT_SESSION_GAP_MS,
        minSessionMs = DEFAULT_MIN_SESSION_MS,
    } = options;

    if (classEnd <= classStart) {
        throw new Error("classEnd must be after classStart");
    }

    if (maxSampleMs <= 0 || sessionGapMs <= 0) {
        throw new Error("Duration thresholds must be positive");
    }

    // Use one identity key per student, not their display name.
    const byUser = new Map<string, LogEntry[]>();

    for (const log of logs) {
        if (
            !log.userId ||
            !Number.isFinite(log.timestamp.getTime())
        ) {
            continue;
        }

        const list = byUser.get(log.userId) ?? [];
        list.push(log);
        byUser.set(log.userId, list);
    }

    const people: PersonMetrics[] = [];

    for (const [userId, entries] of byUser) {
        entries.sort(
            (a, b) =>
                a.timestamp.getTime() - b.timestamp.getTime() ||
                a.id - b.id
        );

        // Build estimated attendance intervals.
        const intervals: {
            start: number;
            end: number;
            focused: boolean;
        }[] = [];

       
for (let i = 0; i < entries.length; i++) {
  const entry = entries[i]!;
  const start = entry.timestamp.getTime();

  if (start >= classEnd.getTime()) continue;

  const nextTime =
    i + 1 < entries.length
      ? entries[i + 1]!.timestamp.getTime()
      : start + maxSampleMs;

  const end = Math.min(
    start + maxSampleMs,
    nextTime,
    classEnd.getTime()
  );

  const clippedStart = Math.max(
    start,
    classStart.getTime()
  );

  if (end <= clippedStart) continue;

  // All observed browser states count toward attendance.
  intervals.push({
    start: clippedStart,
    end,
    focused:
      entry.windowFocus && isMeetUrl(entry.url),
  });
}


        // Merge adjacent observations into attendance sessions.
        // A long gap splits sessions; no time is credited for the gap.
        let totalTimeMs = 0;
        let focusedTimeMs = 0;
        let sessionCount = 0;

        let sessionStart: number | null = null;
        let sessionEnd: number | null = null;
        let sessionDuration = 0;

        const finishSession = () => {
            if (sessionStart === null || sessionEnd === null) return;

            if (sessionDuration >= minSessionMs) {
                totalTimeMs += sessionDuration;
                sessionCount++;
            }

            sessionStart = null;
            sessionEnd = null;
            sessionDuration = 0;
        };

        let firstSeen: number | null = null;
        let lastSeen: number | null = null;

        for (const interval of intervals) {
            if (
                sessionEnd !== null &&
                interval.start - sessionEnd > sessionGapMs
            ) {
                finishSession();
            }

            if (sessionStart === null) {
                sessionStart = interval.start;
            }

            sessionEnd = interval.end;
            sessionDuration += interval.end - interval.start;

            firstSeen =
                firstSeen === null
                    ? interval.start
                    : Math.min(firstSeen, interval.start);

            lastSeen =
                lastSeen === null
                    ? interval.end
                    : Math.max(lastSeen, interval.end);

            if (interval.focused) {
                focusedTimeMs += interval.end - interval.start;
            }
        }

        finishSession();

        // If minSessionMs is used, focused time must also exclude
        // discarded sessions. Keep minSessionMs = 0 for this
        // simple implementation, or aggregate focus per session.
        const safeFocusedTimeMs = Math.min(
            focusedTimeMs,
            totalTimeMs
        );

        people.push({
            userId,
            name: entries[entries.length - 1]?.name ?? "Unknown",
            totalTimeMs,
            focusedTimeMs: safeFocusedTimeMs,
            focusPercentage:
                totalTimeMs > 0
                    ? (safeFocusedTimeMs / totalTimeMs) * 100
                    : 0,
            firstSeen: firstSeen === null ? null : new Date(firstSeen),
            lastSeen: lastSeen === null ? null : new Date(lastSeen),
            sessionCount,
        });
    }

    const totalAttendanceMs = people.reduce(
        (sum, p) => sum + p.totalTimeMs,
        0
    );

    const totalFocusedMs = people.reduce(
        (sum, p) => sum + p.focusedTimeMs,
        0
    );

    const attendees = people.filter(
        p => p.totalTimeMs > 0
    );
    console.log("calculated!")
    return {
        totalUniqueAttendees: attendees.length,
        totalAttendanceMs,
        totalFocusedMs,
        averageFocusPercentage:
            attendees.length > 0
                ? attendees.reduce(
                    (sum, p) => sum + p.focusPercentage,
                    0
                ) / attendees.length
                : 0,
        people: people.sort(
            (a, b) => b.totalTimeMs - a.totalTimeMs
        ),
    };
}
