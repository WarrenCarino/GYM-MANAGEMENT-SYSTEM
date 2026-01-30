import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";

function WorkoutDashboard() {
  const [activeTab, setActiveTab] = useState("Week");
  const [weightData, setWeightData] = useState([
    { name: "Week 1", weight: 72.0 },
    { name: "Week 2", weight: 71.5 },
    { name: "Week 3", weight: 71.8 },
    { name: "Week 4", weight: 70.5 },
    { name: "Week 5", weight: 70.0 },
  ]);
  const [goals, setGoals] = useState([
    { id: 1, title: "Lose 5kg", current: 2, target: 5, unit: "kg" },
    { id: 2, title: "Workout 5x/week", current: 3, target: 5, unit: "days" },
    { id: 3, title: "Run 50km/month", current: 22, target: 50, unit: "km" },
  ]);
  const [workoutLogs, setWorkoutLogs] = useState([
    { id: 1, date: "Oct 7, 2025", exercise: "Bench Press", sets: 4, reps: 10, weight: 60, notes: "Felt strong today" },
    { id: 2, date: "Oct 7, 2025", exercise: "Squats", sets: 3, reps: 12, weight: 80, notes: "" },
    { id: 3, date: "Oct 6, 2025", exercise: "Deadlift", sets: 5, reps: 5, weight: 100, notes: "PR!" },
    { id: 4, date: "Oct 5, 2025", exercise: "Pull-ups", sets: 3, reps: 8, weight: 0, notes: "Bodyweight" },
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [showAddWeightForm, setShowAddWeightForm] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    exercise: "",
    sets: "",
    reps: "",
    weight: "",
    notes: ""
  });
  const [newGoal, setNewGoal] = useState({
    title: "",
    current: "",
    target: "",
    unit: ""
  });
  const [newWeight, setNewWeight] = useState({
    week: "",
    weight: ""
  });

  const handleAddWorkout = () => {
    if (newWorkout.exercise && newWorkout.sets && newWorkout.reps) {
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setWorkoutLogs([
        {
          id: Date.now(),
          date: today,
          exercise: newWorkout.exercise,
          sets: parseInt(newWorkout.sets),
          reps: parseInt(newWorkout.reps),
          weight: parseInt(newWorkout.weight) || 0,
          notes: newWorkout.notes
        },
        ...workoutLogs
      ]);
      setNewWorkout({ exercise: "", sets: "", reps: "", weight: "", notes: "" });
      setShowAddForm(false);
    }
  };

  const handleDeleteWorkout = (id) => {
    setWorkoutLogs(workoutLogs.filter(log => log.id !== id));
  };

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.target && newGoal.unit) {
      setGoals([
        ...goals,
        {
          id: Date.now(),
          title: newGoal.title,
          current: parseInt(newGoal.current) || 0,
          target: parseInt(newGoal.target),
          unit: newGoal.unit
        }
      ]);
      setNewGoal({ title: "", current: "", target: "", unit: "" });
      setShowAddGoalForm(false);
    }
  };

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const handleAddWeight = () => {
    if (newWeight.week && newWeight.weight) {
      setWeightData([
        ...weightData,
        {
          name: newWeight.week,
          weight: parseFloat(newWeight.weight)
        }
      ]);
      setNewWeight({ week: "", weight: "" });
      setShowAddWeightForm(false);
    }
  };

  const currentWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : 70;

  return (
    <div style={{
      background: "linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)",
      minHeight: "100vh",
      padding: "2rem",
      fontFamily: "Poppins, sans-serif",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ color: "#111", fontSize: "2rem", fontWeight: "700", margin: "0 0 0.5rem 0" }}>
            Workout Dashboard
          </h1>
          <p style={{ color: "#666", margin: 0 }}>Track your fitness journey</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}>
            <h3 style={{ color: "#666", fontSize: "0.85rem", fontWeight: "600", margin: "0 0 0.5rem 0", textTransform: "uppercase" }}>Weight</h3>
            <p style={{ color: "#111", fontSize: "2rem", fontWeight: "700", margin: "0" }}>{currentWeight.toFixed(1)} kg</p>
            <p style={{ color: "#22c55e", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>↓ 2kg this month</p>
          </div>
          
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}>
            <h3 style={{ color: "#666", fontSize: "0.85rem", fontWeight: "600", margin: "0 0 0.5rem 0", textTransform: "uppercase" }}>BMI</h3>
            <p style={{ color: "#111", fontSize: "2rem", fontWeight: "700", margin: "0" }}>22.1</p>
            <p style={{ color: "#666", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>Healthy range</p>
          </div>
          
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}>
            <h3 style={{ color: "#666", fontSize: "0.85rem", fontWeight: "600", margin: "0 0 0.5rem 0", textTransform: "uppercase" }}>Total Workouts</h3>
            <p style={{ color: "#111", fontSize: "2rem", fontWeight: "700", margin: "0" }}>{workoutLogs.length}</p>
            <p style={{ color: "#666", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>This week</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
          
          {/* Weight Progress Chart */}
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#111", fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>
                Weight Progress
              </h2>
              <button
                onClick={() => setShowAddWeightForm(!showAddWeightForm)}
                style={{
                  background: "#b58a23",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                {showAddWeightForm ? "Cancel" : "+ Add Weight"}
              </button>
            </div>

            {/* Add Weight Form */}
            {showAddWeightForm && (
              <div style={{
                background: "#f9fafb",
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "1.5rem",
                border: "2px solid #e5e7eb"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", color: "#666", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                      Week Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Week 6"
                      value={newWeight.week}
                      onChange={(e) => setNewWeight({...newWeight, week: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        fontSize: "0.95rem",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#666", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="69.5"
                      value={newWeight.weight}
                      onChange={(e) => setNewWeight({...newWeight, weight: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        fontSize: "0.95rem",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddWeight}
                  style={{
                    background: "#22c55e",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 2rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.95rem"
                  }}
                >
                  Add Weight Entry
                </button>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {["Week", "Month", "Year"].map((label) => (
                <button
                  key={label}
                  onClick={() => setActiveTab(label)}
                  style={{
                    background: activeTab === label ? "#b58a23" : "#f2f2f2",
                    color: activeTab === label ? "#fff" : "#111",
                    border: "none",
                    padding: "0.5rem 1.25rem",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ width: "100%", height: "250px" }}>
              <ResponsiveContainer>
                <LineChart data={weightData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#eee" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#666" }} />
                  <YAxis tick={{ fill: "#666" }} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      color: "#111",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#e7c35d"
                    strokeWidth={3}
                    dot={{ fill: "#fff", stroke: "#e7c35d", strokeWidth: 2, r: 6 }}
                  >
                    <LabelList
                      dataKey="weight"
                      position="top"
                      fill="#222"
                      formatter={(value) => `${value.toFixed(1)}kg`}
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Goals Section */}
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}>
            <h2 style={{ color: "#111", fontSize: "1.25rem", fontWeight: "700", margin: "0 0 1.5rem 0" }}>
              Goals
            </h2>
            
            {goals.map((goal) => {
              const percentage = (goal.current / goal.target) * 100;
              return (
                <div key={goal.id} style={{ marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ color: "#111", fontWeight: "600", fontSize: "0.9rem" }}>{goal.title}</span>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ color: "#666", fontSize: "0.85rem" }}>
                        {goal.current}/{goal.target} {goal.unit}
                      </span>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        style={{
                          background: "transparent",
                          color: "#dc2626",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "1.3rem",
                          padding: "0",
                          fontWeight: "bold",
                          lineHeight: "1"
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div style={{
                    background: "#f2f2f2",
                    borderRadius: "10px",
                    height: "8px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      background: percentage >= 100 ? "#22c55e" : "#e7c35d",
                      width: `${Math.min(percentage, 100)}%`,
                      height: "100%",
                      transition: "width 0.3s",
                      borderRadius: "10px",
                    }} />
                  </div>
                </div>
              );
            })}
            
            <button 
              onClick={() => setShowAddGoalForm(!showAddGoalForm)}
              style={{
                background: "#b58a23",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "0.75rem",
                width: "100%",
                fontWeight: "600",
                cursor: "pointer",
                marginTop: "1rem",
              }}>
              {showAddGoalForm ? "Cancel" : "+ Add New Goal"}
            </button>

            {/* Add Goal Form */}
            {showAddGoalForm && (
              <div style={{
                background: "#f9fafb",
                borderRadius: "12px",
                padding: "1.5rem",
                marginTop: "1rem",
                border: "2px solid #e5e7eb"
              }}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", color: "#666", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                    Goal Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Run 100km"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "0.95rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", color: "#666", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                      Current
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newGoal.current}
                      onChange={(e) => setNewGoal({...newGoal, current: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        fontSize: "0.95rem",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#666", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                      Target
                    </label>
                    <input
                      type="number"
                      placeholder="100"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        fontSize: "0.95rem",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", color: "#666", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="km"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "0.95rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <button
                  onClick={handleAddGoal}
                  style={{
                    background: "#22c55e",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 2rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    width: "100%"
                  }}
                >
                  Add Goal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Workout Logs */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ color: "#111", fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>
              Workout Logs
            </h2>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                background: "#b58a23",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "0.5rem 1rem",
                fontWeight: "600",
                cursor: "pointer",
              }}>
              {showAddForm ? "Cancel" : "+ Log Workout"}
            </button>
          </div>

          {/* Add Workout Form */}
          {showAddForm && (
            <div style={{
              background: "#f9fafb",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
              border: "2px solid #e5e7eb"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: "#666", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Bench Press"
                    value={newWorkout.exercise}
                    onChange={(e) => setNewWorkout({...newWorkout, exercise: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "0.95rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#666", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                    Sets
                  </label>
                  <input
                    type="number"
                    placeholder="3"
                    value={newWorkout.sets}
                    onChange={(e) => setNewWorkout({...newWorkout, sets: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "0.95rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#666", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                    Reps
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={newWorkout.reps}
                    onChange={(e) => setNewWorkout({...newWorkout, reps: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "0.95rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "#666", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    placeholder="60"
                    value={newWorkout.weight}
                    onChange={(e) => setNewWorkout({...newWorkout, weight: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "0.95rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: "#666", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="How did it feel?"
                  value={newWorkout.notes}
                  onChange={(e) => setNewWorkout({...newWorkout, notes: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "0.95rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              <button
                onClick={handleAddWorkout}
                style={{
                  background: "#22c55e",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.75rem 2rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.95rem"
                }}
              >
                Add Workout
              </button>
            </div>
          )}

          {/* Workout Logs Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f2f2f2" }}>
                  <th style={{ textAlign: "left", padding: "1rem", color: "#666", fontWeight: "600", fontSize: "0.85rem" }}>DATE</th>
                  <th style={{ textAlign: "left", padding: "1rem", color: "#666", fontWeight: "600", fontSize: "0.85rem" }}>EXERCISE</th>
                  <th style={{ textAlign: "center", padding: "1rem", color: "#666", fontWeight: "600", fontSize: "0.85rem" }}>SETS</th>
                  <th style={{ textAlign: "center", padding: "1rem", color: "#666", fontWeight: "600", fontSize: "0.85rem" }}>REPS</th>
                  <th style={{ textAlign: "center", padding: "1rem", color: "#666", fontWeight: "600", fontSize: "0.85rem" }}>WEIGHT</th>
                  <th style={{ textAlign: "left", padding: "1rem", color: "#666", fontWeight: "600", fontSize: "0.85rem" }}>NOTES</th>
                  <th style={{ textAlign: "center", padding: "1rem", color: "#666", fontWeight: "600", fontSize: "0.85rem" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {workoutLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                    <td style={{ padding: "1rem", color: "#666", fontSize: "0.9rem" }}>{log.date}</td>
                    <td style={{ padding: "1rem", color: "#111", fontWeight: "600" }}>{log.exercise}</td>
                    <td style={{ padding: "1rem", color: "#111", textAlign: "center" }}>{log.sets}</td>
                    <td style={{ padding: "1rem", color: "#111", textAlign: "center" }}>{log.reps}</td>
                    <td style={{ padding: "1rem", color: "#e7c35d", fontWeight: "600", textAlign: "center" }}>
                      {log.weight > 0 ? `${log.weight}kg` : "BW"}
                    </td>
                    <td style={{ padding: "1rem", color: "#666", fontSize: "0.9rem", fontStyle: log.notes ? "normal" : "italic" }}>
                      {log.notes || "No notes"}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <button
                        onClick={() => handleDeleteWorkout(log.id)}
                        style={{
                          background: "#fee",
                          color: "#dc2626",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.4rem 0.8rem",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          fontWeight: "600"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default WorkoutDashboard;