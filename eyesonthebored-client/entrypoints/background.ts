import { server } from "../lib/server-client";
export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  console.log({ tabs: browser.tabs.query({}) })
  let code = "NOCODE"
  let name = "NONAME"
  let id = "NOID"
  browser.runtime.onMessage.addListener((message,sender,sendResponse) =>{
    if(message.type === "enable_logging"){
      code = message.code
      name = message.name
      id = message.id
    }
  })
  const ALARM_NAME = "tab-logger";
  const INTERVAL_MINUTES = 0.5;
  async function logTabs() {
    try {
      const tabs = await browser.tabs.query({active: true});
      const x = tabs.map((tab) => ({  
          id: tab.id,
          title: tab.title,
          url: tab.url,
          active: tab.active,
          windowId: tab.windowId,
        })
      )

      await server.monitor.post({name: name,id:id,code:code,tab: (x[0]?.title ?? "NO TAB FOUND?"), idle: await browser.idle.queryState(15)})
      console.log(
        `[${new Date().toLocaleTimeString()}] Open tabs (${tabs.length}):`,
        tabs.map((tab) => ({
          id: tab.id,
          title: tab.title,
          url: tab.url,
          active: tab.active,
          windowId: tab.windowId,
        }))
      )
    } catch (error) {
      console.error("Failed to retrieve tabs:", error);
    }
  }

  async function syncAlarm() {
    const { tabLoggingEnabled = false } =
      await browser.storage.local.get("tabLoggingEnabled");

    if (tabLoggingEnabled) {
      const existingAlarm = await browser.alarms.get(ALARM_NAME);
      if (!existingAlarm) {
        await browser.alarms.create(ALARM_NAME, {
          periodInMinutes: INTERVAL_MINUTES,
        });
        // Log once immediately when enabling.
        await logTabs();
      }
    } else {
      await browser.alarms.clear(ALARM_NAME);
    }
  }

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
      void logTabs();
    }
  });

  // Restore the alarm state when the background starts.
  void syncAlarm();

  // Synchronize whenever the popup changes the toggle.
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes.tabLoggingEnabled) {
      void syncAlarm();
    }
  });
});
