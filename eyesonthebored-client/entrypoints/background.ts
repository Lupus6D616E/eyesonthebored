import { server } from "../lib/server-client";
import eye from "@/assets/eye.webp"
import { tabLoggingEnabled } from "./popup/App";
export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  console.log({ tabs: browser.tabs.query({}) })
  let code = "NOCODE"
  let name = "NONAME"
  let id = "NOID"
  let windowFocused = true
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "enable_logging") {
      code = message.code
      name = message.name
      id = message.id
    }
  })
  browser.windows.onFocusChanged.addListener(async (windowId) => {
    const tabLogging = await tabLoggingEnabled.getValue()

    if (windowId !== browser.windows.WINDOW_ID_NONE) {
      windowFocused = true
      if(tabLogging){
        logTabs()
      }
      return;
    }

    // WINDOW_ID_NONE: could be a real focus loss or an
    // intermediate event during a switch between windows.
    const lastFocused = await browser.windows.getLastFocused();

    if (lastFocused.focused) {
      windowFocused = true
      if(tabLogging){
        logTabs()
      }
      return;
    }
    windowFocused = false
    if(tabLogging){
        logTabs()
      }
  });
  const tabLoggerToggle = async () => {
    const tabLogging = await tabLoggingEnabled.getValue()
    if (!tabLogging) {
      console.log("how the hell did this happen????")
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
    }
    await tabLoggingEnabled.setValue(!tabLogging)
      ;
  }
  const ALARM_NAME = "tab-logger";
  const INTERVAL_MINUTES = 0.5;
  async function logTabs() {
    try {
      const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
      const x = tabs.map((tab) => ({
        id: tab.id,
        title: tab.title,
        url: tab.url,
        active: tab.active,
        windowId: tab.windowId,
      })
      )
      const window = await browser.windows.getAll()
      const res = await server.monitor.post({ name: name, id: id, code: code, url: x[0]?.url ?? "NO URL FOUND?", tab: (x[0]?.title ?? "NO TAB FOUND?"), idle: await browser.idle.queryState(15), windowFocus: windowFocused })
      if (res.status === 404) {
        const response = await browser.runtime.sendMessage({
          type: "not_found",
        })
      }
      else if (res.status === 403) {
        await tabLoggerToggle()
        await browser.notifications.create('meet_closed', {
          type: 'basic',
          iconUrl: eye, // file in public/icon/
          title: 'Meet Closed!',
          message: 'the meet with code ' + code + " has been closed.",
          requireInteraction: true,
        });
        const response = await browser.runtime.sendMessage({
          type: "meet_closed",
        })
      }

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
