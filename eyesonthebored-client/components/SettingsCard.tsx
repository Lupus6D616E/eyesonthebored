import { useEffect, useState } from 'react';
import { storage } from '#imports'; // or: import { storage } from 'wxt/utils/storage';

// Typed storage items (fallback gives "default" when nothing is stored yet)
export const hostnameSetting = storage.defineItem<string>('local:hostname', { fallback: 'meet.google.com' });

export default function SettingsCard() {
  const [one, setOne] = useState('default');
  const [saved, setSaved] = useState(false);

  // Prefill from storage on mount
  useEffect(() => {
    (async () => {
      const [a] = await Promise.all([
        hostnameSetting.getValue(),
      ]);
      setOne(a);
    })();
  }, []);

  const handleSave = async () => {
    await Promise.all([
      hostnameSetting.setValue(one),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="card w-80 bg-base-100 shadow-md">
      <div className="card-body gap-3">
        <h1 className="mb-4 text-xl font-bold">
          Hostname:
        </h1>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Value one"
          value={one}
          onChange={(e) => setOne(e.target.value)}
        />
        <div className="card-actions justify-end">
          <button
            className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
            onClick={handleSave}
          >
            {saved ? 'Saved' : 'Set as default'}
          </button>
        </div>
      </div>
    </div>
  );
}
