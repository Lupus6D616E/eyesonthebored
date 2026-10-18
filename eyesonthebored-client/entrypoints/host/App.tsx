import LoginForm from '@/components/LoginForm';
import SignUpForm from '@/components/SignUpForm';
import { authClient, tokenItem } from '@/lib/auth-client';
import { server } from '@/lib/server-client';
export default function App() {
    const [status, setStatus] = useState("")
    const [userStatus, setUserStatus] = useState("")
    const { data: session, isPending } = authClient.useSession();
    const checkServer = async () => {
        const loggedIn = await server.me.get()
        const token = await tokenItem.getValue();
        console.log(token)
        const res = await server.ack.post({ attendanceCode: "hello!" })
        if (loggedIn.data) {
            setUserStatus(loggedIn.data.email)
        }
        else {
            setUserStatus("Not Logged in!")
        }
        if (res.data) {
            setStatus("Server is online")
        }
        else if (res.error) {
            setStatus(res.error.value.message ?? "Unknown Error")
        }
    }
    const logOut = async () => {
        await authClient.signOut({
  fetchOptions: {
    onSuccess: () => {
        location.href = browser.runtime.getURL('/login.html')
    },
  },
});
    }
    if (!session?.user) {
        return (
            <main style={{ maxWidth: 320, margin: '80px auto' }}>
                <h1>This is a protected page for meeting hosts!</h1>
                <p>if you are a student, please return to only using the popup.</p>
                <p>if you are a host, please return to the log-in screen to access this page..</p>
                <button onClick={() => { location.href = browser.runtime.getURL('/login.html') }}>return to login </button>
                <p>{userStatus}</p>
                <p>{status}</p>
            </main>
        )
    }
    else {
        return (
            <main style={{ maxWidth: 320, margin: '80px auto' }}>
                <h1>Hello!</h1>
                
                <button onClick={logOut}>LogOut </button>
                <p>{userStatus}</p>
                <p>{status}</p>
            </main>
        );
    }
}