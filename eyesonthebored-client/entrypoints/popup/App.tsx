import { useState, useEffect } from 'react';
import blackboard from '@/assets/blackboard.png';
import eye from "@/assets/eye.webp"
import './App.css';
import { server } from '../../lib/server-client';


function App() {
  const [status, setStatus] = useState("loading...")
  const [toggle, setToggle] = useState("loading...")
  const [enabled, setEnabled] = useState(false)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [id, setId] = useState("")
  const privacyurl = browser.runtime.getURL('/privacy.html');
  const loginurl = browser.runtime.getURL('/login.html')
  useEffect(() => {
    tabLoggerStatus();
  }, []);

  const handleSubmit = async () => {
    const res = await server.ack.post({attendanceCode:code})
    if(res.data)
    {
      setStatus("ackd" + res.data.attendanceCode)
    }
  }
  const tabLoggerStatus = async () => {
    const { tabLoggingEnabled = false } = await browser.storage.local.get("tabLoggingEnabled");
    const hasName = await storage.getItem<string>("local:userName") 
    const hasId = await storage.getItem<string>("local:userId")
    const hasCode = await storage.getItem<string>("local:meetCode")
    if(hasName){
      setName(hasName)
    }
    if(hasId){
      setId(hasId)
    }
    if(hasCode){
      setCode(hasCode)
    }
    if (tabLoggingEnabled) {
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
    await storage.setItem("local:userId",id)
  }
  const tabLoggerToggle = async () => {
    const { tabLoggingEnabled = false } =
      await browser.storage.local.get("tabLoggingEnabled");
    if(!tabLoggingEnabled){
      const response = await browser.runtime.sendMessage({
        type: "enable_logging",
        code: code.trim(),
        name: name.trim(),
        id: id.trim()
      })
      await storage.setItem<string>("local:meetCode",code)
    }
    else{
      await storage.removeItem("local:meetCode")
      setCode("")
    }
    await browser.storage.local.set({
      tabLoggingEnabled: !tabLoggingEnabled,
    });
    await tabLoggerStatus()
  }
  return (
    <>
      <div>
        <a href={loginurl} target="_blank">
          <img src={blackboard} className="logo" alt="WXT logo" />
        </a>
        <a href={privacyurl} target="_blank">
          <img src={eye} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>EyesOnTheBored</h1>
      <div className="card">
        <button onClick={tabLoggerToggle}>
          {toggle}
        </button>
        <p>
          <label>attendance code:
            <input value={code} required disabled={enabled} onChange={(e) => setCode(e.target.value)} name='code'></input>
          </label>
        </p>
        <button onClick={handleSubmit}>
          test server
        </button>
        <p>
          {status}
        </p><p>
          <label>Name:
            <input value={name} required disabled={enabled} onChange={(e) => setName(e.target.value)} name='name'></input>
          </label>
        </p>
        <p>
          <label>ID:
            <input value={id} required disabled={enabled} onChange={(e) => setId(e.target.value)} name='studentId'></input>
          </label>
        </p>
      </div>
        <button onClick={setDefaults}>
          set as default
        </button>

      <p className="read-the-docs">
        YOUR PRIVACY IS FORFEIT WHILE THIS IS TURNED ON, PLEASE READ THE DOCS BY CLICKING THE EYE.
      </p>
    </>
  );
}

export default App;
