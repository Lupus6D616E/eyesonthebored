import '@/assets/tailwind.css';
import CreateMeetPage from '@/components/CreateMeet';
import Sidebar from '@/components/SideBar';
import type { Selection } from '@/components/SideBar';
import { authClient, tokenItem } from '@/lib/auth-client';
import { server } from '../../lib/server-client';

export default function App() {
    const [meetCreatedId, setMeetCreatedId] = useState(0);
    const { data: session, isPending } = authClient.useSession();
    const [selected, setSelected] = useState<Selection>({ type: "option", id: "new" });
    if (!session?.user) {
        return (
            <main style={{ maxWidth: 320, margin: '80px auto' }}>
                <h1>This is a protected page for meeting hosts!</h1>
                <p>if you are a student, please return to only using the popup.</p>
                <p>if you are a host, please return to the log-in screen to access this page..</p>
                <button onClick={() => { location.href = browser.runtime.getURL('/login.html') }}>return to login </button>
             
            </main>
        )
    }
    else {
        return (

            <main className="flex h-screen w-full">
                <Sidebar meetCreated={meetCreatedId} selected={selected} onSelect={setSelected} />

                <main className="flex-1 base-100 p-10 overflow-y-auto">

                    {selected?.type === "option" && selected.id === "dashboard" && <CreateMeetPage onMeetCreateTrigger={setMeetCreatedId} />}

                    {selected?.type === "option" && selected.id === "attendance" && <div>attendance</div>}
                    
                    {selected?.type === "option" && selected.id === "settings" && <div>Settings page</div>}

                    {selected?.type === "history" && <div>Showing conversation #{selected.id}</div>}

                </main>
            </main>
        );
    }
}