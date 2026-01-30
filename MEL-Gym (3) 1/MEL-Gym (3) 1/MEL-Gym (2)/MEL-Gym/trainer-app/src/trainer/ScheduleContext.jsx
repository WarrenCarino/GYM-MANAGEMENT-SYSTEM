// ScheduleContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  // Weekly schedule display (optional)
  const [scheduleData, setScheduleData] = useState([
    { day: "Monday", slots: [] },
    { day: "Tuesday", slots: [] },
    { day: "Wednesday", slots: [] },
    { day: "Thursday", slots: [] },
    { day: "Friday", slots: [] },
    { day: "Saturday", slots: [] },
    { day: "Sunday", slots: [] },
  ]);

  const updateSchedule = (day, newSlot) => {
    setScheduleData((prev) =>
      prev.map((d) => d.day === day ? { ...d, slots: [...d.slots, newSlot] } : d)
    );
  };

  // Sessions for trainers
  const [sessions, setSessions] = useState([]);
  const [trainer, setTrainer] = useState(null);

  // Fetch sessions automatically when trainer is set
  useEffect(() => {
    if (!trainer) return;
    fetch(`http://localhost:8081/sessions/trainer/${trainer.trainer_name}`)
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(err => console.error("❌ Error fetching sessions:", err));
  }, [trainer]);

  // Assign or add sessions
  const addSession = (session) => setSessions((prev) => [...prev, session]);

  const contextValue = {
    scheduleData,
    updateSchedule,
    sessions,
    setSessions,
    trainer,
    setTrainer,
    addSession,
  };

  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
};
