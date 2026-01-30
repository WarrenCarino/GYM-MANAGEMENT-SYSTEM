import React, { createContext, useState } from "react";

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  // Store all trainer info after login
  const [trainer, setTrainer] = useState({
    trainer_id: null,
    trainer_name: "Coach Name",
    email: "",
    contact: "",
    profilePic: "/assets/1.png",
  });

  return (
    <ProfileContext.Provider
      value={{
        trainer,
        setTrainer,          // allows login to update the trainer info
        coachName: trainer.trainer_name,
        setCoachName: (name) => setTrainer((prev) => ({ ...prev, trainer_name: name })),
        setProfilePic: (pic) => setTrainer((prev) => ({ ...prev, profilePic: pic })),
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
