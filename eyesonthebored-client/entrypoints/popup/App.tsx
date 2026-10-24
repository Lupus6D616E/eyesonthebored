import { useState, useEffect } from 'react';
import blackboard from '@/assets/blackboard.png';
import eye from "@/assets/eye.webp"
import '@/assets/tailwind.css'; 
import { server } from '../../lib/server-client'; 
export const tabLoggingEnabled = storage.defineItem<boolean>('local:tabLoggingEnabled', {
  fallback: false,
});

function Popup() {
  const [status, setStatus] = useState("loading...")
  const [toggle, setToggle] = useState("loading...")
  const [enabled, setEnabled] = useState(false)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [id, setId] = useState("")
  const privacyurl = browser.runtime.getURL('/privacy.html');
  const loginurl = browser.runtime.getURL('/login.html')


  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "not_found") {
      await tabLoggerToggle()
      setStatus("no meet with that code found")
    }
    if (message.type === "meet_closed") {
      await tabLoggerStatus()
      setStatus("that meet is currently closed.")
    }
  })

  useEffect(() => {
    tabLoggerStatus();
  }, []);

  const handleSubmit = async () => {
    const res = await server.ack.post({ attendanceCode: code })
    if (res.data) {
      setStatus("ackd" + res.data.attendanceCode)
    }
  }
  const tabLoggerStatus = async () => {
    const tabLogging = await tabLoggingEnabled.getValue()
    const hasName = await storage.getItem<string>("local:userName")
    const hasId = await storage.getItem<string>("local:userId")
    const hasCode = await storage.getItem<string>("local:meetCode")
    if (hasName) {
      setName(hasName)
    }
    if (hasId) {
      setId(hasId)
    }
    if (hasCode) {
      setCode(hasCode)
    }
    if (tabLogging) {
      setEnabled(true)
      setStatus("enabled")
      setToggle("disable?")
    }
    else {
      setEnabled(false)
      setStatus("disabled")
      setToggle("enable?")
    }
  }
  const setDefaults = async () => {
    await storage.setItem("local:userName", name)
    await storage.setItem("local:userId", id)
  }

  const tabLoggerToggle = async () => {
    const tabLogging = await tabLoggingEnabled.getValue()
    if (!tabLogging) {
      const response = await browser.runtime.sendMessage({
        type: "enable_logging",
        code: code.trim(),
        name: name.trim(),
        id: id.trim()
      })
      await storage.setItem<string>("local:meetCode", code)
    }
    else {
      await storage.removeItem("local:meetCode")
      setCode("")
    }
    await tabLoggingEnabled.setValue(!tabLogging)
    ;
    await tabLoggerStatus()
  }
  return (
    
   <>
  <div className="min-h-screen bg-base-200 p-4 sm:p-6">
    <div className="mx-auto w-full max-w-md">
      {/* Header */}
      <div className="card overflow-hidden bg-base-100 shadow-xl">
        <div className="bg-neutral px-6 py-5 text-neutral-content">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Attendance Assistant
              </h1>
              <p className="mt-1 text-sm opacity-70">
                Extension settings
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={loginurl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-circle btn-ghost btn-sm"
                aria-label="Open Blackboard"
                title="Open Blackboard"
              >
                <img
                  src={blackboard}
                  alt="Blackboard"
                  className="h-6 w-6 object-contain"
                />
              </a>

              <a
                href={privacyurl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-circle btn-ghost btn-sm"
                aria-label="View privacy statement"
                title="Privacy statement"
              >
                <img
                  src={eye}
                  alt="Privacy"
                  className="h-6 w-6 object-contain"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="card-body gap-5 p-6">
          <div>
            <h2 className="text-lg text-primary font-semibold">
              Configuration
            </h2>
            <p className="mt-1 text-sm text-base-content/60">
              Manage your attendance details and extension status.
            </p>
          </div>

          {/* Toggle */}
          <div className="rounded-xl border border-base-300 bg-base-200/50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-primary">Attendance automation</p>
                <p className="mt-1 text-xs text-base-content/60">
                  Enable or disable the extension.
                </p>
              </div>

              <button
                onClick={tabLoggerToggle}
                className="btn btn-primary btn-sm shrink-0"
              >
                {toggle}
              </button>
            </div>
          </div>

          {/* Attendance code */}
          <div className="form-control w-full">
            <label className="label" htmlFor="attendance-code">
              <span className="label-text text-primary font-semibold">
                Attendance code
              </span>
              <span className="label-text-alt text-primary text-base-content/50">
                Required
              </span>
            </label>

            <input
              id="attendance-code"
              type="text"
              name="code"
              placeholder="Enter attendance code"
              value={code}
              required
              disabled={enabled}
              onChange={(e) => setCode(e.target.value)}
              className="input text-primary input-bordered w-full focus:input-primary"
            />

            <label className="label">
              <span className="label-text-alt text-base-content/50">
                Enter the code for your current session.
              </span>
            </label>
          </div>

          {/* Personal details */}
          <div className="divider my-0  text-xs text-base-content/50">
            STUDENT DETAILS
          </div>

          <div className="form-control w-full">
            <label className="label" htmlFor="student-name">
              <span className="label-text text-primary font-semibold">Full name</span>
            </label>

            <input
              id="student-name"
              type="text"
              name="name"
              placeholder="Enter your name"
              value={name}
              required
              disabled={enabled}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered text-primary w-full focus:input-primary"
            />
          </div>

          <div className="form-control w-full">
            <label className="label" htmlFor="student-id">
              <span className="label-text text-primary font-semibold">Student ID</span>
            </label>

            <input
              id="student-id"
              type="text"
              name="studentId"
              placeholder="Enter your student ID"
              value={id}
              required
              disabled={enabled}
              onChange={(e) => setId(e.target.value)}
              className="input input-bordered text-primary w-full focus:input-primary"
            />
          </div>

          {/* Test server */}
          <div className="rounded-xl border border-base-300 p-4">
            <div className="mb-3">
              <h3 className="font-semibold">Connection status</h3>
              <p className="mt-1 text-sm text-base-content/60">
                Check whether the server is responding.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              className="btn btn-outline btn-primary w-full"
            >
              Test server
            </button>

            {status && (
              <div
                role="status"
                aria-live="polite"
                className="alert mt-3 bg-base-200 text-sm shadow-sm"
              >
                <span className="break-words">{status}</span>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex flex-col gap-3 pt-1">
            <button
              onClick={setDefaults}
              className="btn btn-primary w-full"
            >
              Set as default
            </button>

            <p className="text-center text-xs leading-relaxed text-base-content/50">
              Click the eye icon above to view the privacy statement.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-4 text-center text-xs text-base-content/40">
        Attendance Assistant · Extension settings
      </p>
    </div>
  </div>
</>
  );
}

function App(){
  return (
    <ThemeProvider>
      <Popup />
    </ThemeProvider>
  )
}

export default App;
