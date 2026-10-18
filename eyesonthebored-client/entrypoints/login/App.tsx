import LoginForm from '@/components/LoginForm';
import SignUpForm from '@/components/SignUpForm';
import { authClient, tokenItem } from '@/lib/auth-client';
import { server } from '@/lib/server-client';
export default function App() {
    const [status, setStatus] = useState("")
    const [userStatus, setUserStatus] = useState("")
    const handleLogin = async (email: string, password: string) => {
        const { data, error } = await authClient.signIn.email({
            email, password
        }, {
            onRequest: (ctx) => {
                setStatus("logging in...")
            },
            onSuccess: (ctx) => {
                setStatus("logged in successfully")
                location.href = browser.runtime.getURL('/host.html')
            },
            onError: (ctx) => {
                // display the error message
                alert(ctx.error.message);
            },
        })
    };
    const handleSignUp = async (email: string, password: string, name: string) => {
        const { data, error } = await authClient.signUp.email({
            name: name,
            password: password,
            email: email
        }, {
            onRequest: (ctx) => {
                setStatus("Signing up...")
            },
            onSuccess: (ctx) => {
                setStatus(("signup success! welcome " + name))
            },
            onError: (ctx) => {
                // display the error message
                alert(ctx.error.message);
                setStatus("error!")
            },
        })
    };
    const checkServer = async () => {
        const loggedIn = await server.me.get()
        const token = await tokenItem.getValue();
        console.log(token)
        const res = await server.ack.post({ attendanceCode: "hello!" })
        if (loggedIn.data) {
            setUserStatus(loggedIn.data.email)
        }
        else {
            setUserStatus("Not Lged in!")
        }
        if (res.data) {
            setStatus("Server is online")
        }
        else if (res.error) {
            setStatus(res.error.value.message ?? "Unknown Error")
        }
    }

    return (
        <main style={{ maxWidth: 320, margin: '80px auto' }}>
            <h1>Log in</h1>
            <LoginForm onSubmit={handleLogin} />
            <h1>Sign up</h1>
            <SignUpForm onSubmit={handleSignUp} />
            <button onClick={checkServer}>Test Server availability </button>
            <p>{userStatus}</p>
            <p>{status}</p>
        </main>
    );
}