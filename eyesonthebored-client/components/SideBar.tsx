
import { authClient } from "@/lib/auth-client";
import { server } from "@/lib/server-client";
import { useState } from "react";
import { Eye, EyeClosed } from 'lucide-react';



export type Selection =
    | { type: "option"; id: string }
    | { type: "history"; id: number }
    | null;

interface SidebarProps {
    selected: Selection;
    meetCreated: number;
    updateCount: number;
    onSelect: (selection: Selection) => void;
}

const navigation = [
    { label: "Dashboard", icon: "🏠" },
    { label: "Settings", icon: "⚙️" },
];


const initialHistory = [
    { title: "item 1", id: 1, code: "code-1231", status: "disabled" },
    { title: "item 2", id: 2, code: "code-1231", status: "disabled" },
    { title: "item 3", id: 3, code: "code-1231", status: "disabled" },
    { title: "item 4", id: 4, code: "code-1231", status: "disabled" },
    { title: "item 5", id: 5, code: "code-1231", status: "disabled" },
    { title: "item 6", id: 6, code: "code-1231", status: "disabled" },
];
export default function Sidebar({ updateCount, meetCreated, selected, onSelect }: SidebarProps) {
    const [active, setActive] = useState("Dashboard");
    const [history, setHistory] = useState(initialHistory);

    const getHistory = async () => {
        const res = await server.host.meeting.list.get()
        if (res.data) {
            setHistory(res.data)
        }
    }
    useEffect(() => {
        getHistory()
        if (meetCreated === 0) {
            onSelect({ type: "option", id: "dashboard" })
        }
        else {
            onSelect({ type: "history", id: meetCreated })
        }
    }, [meetCreated])
     useEffect(() => {
        getHistory()
    }, [updateCount])

    useEffect(() => {
        getHistory()
    }, [])
    const isActive = (type: "option" | "history", id: string | number) =>
        selected?.type === type && selected.id === id;

    const logOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    location.href = browser.runtime.getURL('/login.html')
                },
            },
        });
    }

    return (
        <aside className="w-64 h-screen bg-base-200
                      border-r border-base-300
                      flex flex-col p-4">

            {/* App header */}
            <div className="text-xl font-bold mb-6 px-2">
                EyesOnTheBored 
            </div>

            {/* Navigation options */}
            <ul className="menu w-full p-0 gap-1">
                {navigation.map((item) => (
                    <li key={item.label}>
                        <button
                            className={
                                active === item.label ? "active" : ""
                            }
                            onClick={() => onSelect({ type: "option", id: item.label.toLowerCase() })}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="divider my-4" />

            {/* History header */}
            <div className="flex items-center justify-between
                      px-2 mb-2">
                <h2 className="text-xs font-semibold uppercase
                       tracking-wider opacity-60">
                    History
                </h2>

                <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setHistory([])}
                    aria-label="Clear history"
                >
                    Clear
                </button>
            </div>

            {/* Scrollable history list */}
            <ul className="menu w-full p-0 gap-1
                     flex-1 overflow-y-auto">
                {history.map((item) => (
                    <li key={item.id} className="flex flex-row items-center">
                        <button
                            className="flex-1 min-w-0 flex items-center gap-2 text-sm text-left"
                            title={item.title}
                            onClick={() => onSelect({ type: "history", id: item.id })}
                        >
                            {item.status === "enabled" && <Eye />}
                            {item.status === "disabled" && <EyeClosed />}
                            <span className="truncate">{item.title}</span>

                        </button>

                        <CopyButton text={item.code} />
                    </li>
                ))}
            </ul>

            {/* Bottom section */}
            <div className="divider my-3" />

            <button onClick={logOut} className="btn btn-ghost justify-start">
                <span>👤</span>
                Log out
            </button>
        </aside>
    );
}
