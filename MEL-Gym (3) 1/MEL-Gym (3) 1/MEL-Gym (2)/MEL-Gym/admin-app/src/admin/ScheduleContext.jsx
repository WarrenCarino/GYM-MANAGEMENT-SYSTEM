// C:\Users\Rona\Desktop\MEL-Gym\trainer-app\src\trainer\ScheduleContext.jsx
import React, { createContext, useState } from "react";

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  // ===========================
  // OLD SAMPLE SCHEDULE (Dashboard Display)
  // ===========================
  const [scheduleData, setScheduleData] = useState([
    {
      day: "Monday",
      slots: [
        { time: "9:00 AM", event: "Team Meeting" },
        { time: "2:00 PM", event: "Lunch Break" },
      ],
    },
    {
      day: "Tuesday",
      slots: [
        { time: "10:00 AM", event: "Code Review" },
        { time: "3:00 PM", event: "Client Call" },
      ],
    },
    { day: "Wednesday", slots: [{ time: "11:00 AM", event: "Project Update" }] },
    {
      day: "Thursday",
      slots: [
        { time: "9:30 AM", event: "Design Session" },
        { time: "1:00 PM", event: "Break" },
      ],
    },
    { day: "Friday", slots: [{ time: "4:00 PM", event: "Weekly Wrap-up" }] },
    { day: "Saturday", slots: [] },
    { day: "Sunday", slots: [] },
  ]);

  const updateSchedule = (day, newSlot) => {
    setScheduleData((prev) =>
      prev.map((d) =>
        d.day === day ? { ...d, slots: [...d.slots, newSlot] } : d
      )
    );
  };

  // ===========================
  // NEW: SESSION MANAGEMENT FOR TRAINERS & ADMIN
  // ===========================
  const [sessions, setSessions] = useState([
    // Example entry structure
    // {
    //   id: "abc123",
    //   type: "Personal" | "Class",
    //   trainer: "John Doe",
    //   client: { name, contact, email },
    //   clients: [{ name, contact, email }], // only for Class
    //   date: "2025-10-16",
    //   time: "09:00",
    // }
  ]);

  // Add or assign sessions (used by Admin ManageSchedule.jsx)
  const assignSessions = (newSessions) => {
    setSessions((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const filtered = newSessions.filter((s) => !existingIds.has(s.id));
      return [...filtered, ...prev];
    });
  };

  // Add a single session manually (Trainer or Admin can use)
  const addSession = (session) => setSessions((p) => [session, ...p]);

  // Remove a session (e.g. cancelled)
  const removeSession = (id) =>
    setSessions((p) => p.filter((s) => s.id !== id));

  return (
    <ScheduleContext.Provider
      value={{
        scheduleData,
        updateSchedule,
        sessions,
        assignSessions,
        addSession,
        removeSession,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};
