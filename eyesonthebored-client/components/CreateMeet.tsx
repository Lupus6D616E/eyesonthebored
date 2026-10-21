import { server } from "@/lib/server-client";
import { useState, type ChangeEvent, type KeyboardEvent } from "react";

type StatusType = "info" | "success" | "error";

interface Status {
  type: StatusType;
  text: string;
}



type MeetCreateProps = {
  onMeetCreateTrigger: (meetItem: number) => void;
};
const alertClasses: Record<StatusType, string> = {
  info: "alert-info",
  success: "alert-success",
  error: "alert-error",
};

export default function CreateMeetPage({ onMeetCreateTrigger }: MeetCreateProps) {
  const [value, setValue] = useState<string>("");
  const [status, setStatus] = useState<Status>({
    type: "info",
    text: "Waiting for input.",
  });

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setStatus({ type: "error", text: "Enter a value before submitting." });
      return;
    }
    const res = await server.host.meeting.create.post({name: value})
    if(res.status === 409){
    setStatus({ type: "error", text: `You already have a meet by this name.` });
    }
    else if (res.status === 200){
    setStatus({ type: "success", text: `Submitted "${trimmed}".` })
    setTimeout(() => {
    onMeetCreateTrigger(res.data?.id!)
    },2000)
    }
    else{
    setStatus({ type: "error", text: `Unknown Error.` })
    }
    setValue("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">Enter Meeting Name</h1>

          <input
            type="text"
            placeholder="Meeting Name..."
            className="input input-bordered w-full"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <div className="card-actions mt-2">
            <button className="btn btn-primary w-full" onClick={handleSubmit}>
              Submit
            </button>
          </div>

          <div role="status" className={`alert ${alertClasses[status.type]} mt-2 py-2`}>
            <span>{status.text}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
