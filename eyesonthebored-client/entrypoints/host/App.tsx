import '@/assets/tailwind.css';
import CreateMeetPage from '@/components/CreateMeet';
import Sidebar from '@/components/SideBar';
import type { Selection } from '@/components/SideBar';
import { authClient } from '@/lib/auth-client';
import MeetStats from '@/components/MeetStats';
import { ThemeToggle } from '@/components/ThemeToggle';
import SettingsCard from '@/components/SettingsCard';

export default function App(){
    return(
        <ThemeProvider>
            <Host />
        </ThemeProvider>
    )
}

function Host() {

    const [sideBarsubmitCount, setSideBarSubmitCount] = useState(0);

    function updateSideBar() {
        setSideBarSubmitCount((count) => count + 1);
    }
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
                <Sidebar updateCount={sideBarsubmitCount} meetCreated={meetCreatedId} selected={selected} onSelect={setSelected} />

                <main className="flex-1 base-100 p-10 overflow-y-auto">

                    {selected?.type === "option" && selected.id === "dashboard" && <CreateMeetPage onMeetCreateTrigger={setMeetCreatedId} />}

                    {selected?.type === "option" && selected.id === "settings" && <main className="min-h-screen min-w-72 bg-base-100 p-5 text-base-content">
                        <h1 className="mb-4 text-xl font-bold">
                            My Extension
                        </h1>

                        <ThemeToggle />
                        <SettingsCard />
                    </main>}

                    {selected?.type === "history" && <MeetStats updateSideBar={() => { updateSideBar() }} meetId={selected.id} />}

                </main>
            </main>
        );
    }
}