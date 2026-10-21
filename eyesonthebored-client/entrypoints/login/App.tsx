import LoginForm from '@/components/LoginForm';
import SignUpForm from '@/components/SignUpForm';
import { authClient, tokenItem } from '@/lib/auth-client';
import { server } from '@/lib/server-client';
import '@/assets/tailwind.css';
export default function App() {
    const [status, setStatus] = useState("")
    const [userStatus, setUserStatus] = useState("")
    const [signUpStatus, setSignUpStatus] = useState(false)
    const handleLogin = async (signUp: boolean) => {
        setSignUpStatus(signUp)
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
            setUserStatus("Not Logged in!")
        }
        if (res.data) {
            setStatus("Server is online")
        }
        else if (res.error) {
            setStatus(res.error.value.message ?? "Unknown Error")
        }
        const apiURL = import.meta.env.WXT_API_URL!
        console.log(apiURL)
    }

    return (
        <main style={{ maxWidth: 320, margin: '80px auto' }}>
            { !signUpStatus &&
            <LoginForm onSubmit={handleLogin} />
            }
            {
            signUpStatus &&
            <SignUpForm onSubmit={handleLogin} />
            }
            
            <button onClick={checkServer} className="btn btn-dash btn-info">Test Server Availability</button>
            <p>{userStatus}</p>
            <p>{status}</p>
        </main>
    );
}