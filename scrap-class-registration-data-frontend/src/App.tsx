import React from "react";
import "./styles/App.css";

function generateCalendar() {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const startHour = 6;
  const endHour = 22;
  const timeSlotMinutes = 15;

  const calendar = [];

  function convertTime(hour: number) {
    let clockTime;

    if (hour > 12) {
      clockTime = hour - 12;
    } else if (hour == 12) {
      clockTime = hour;
    } else if (hour < 12) {
      clockTime = hour;
    }

    return clockTime;
  }

  // Loop through each time slot
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += timeSlotMinutes) {
      let time = "";
      let className = "";
      const actualTime = `${convertTime(hour)}:${
        minute === 0 ? "00" : minute
      } ${hour < 12 ? "AM" : "PM"}`;
      if (minute === 0) {
        time = `${convertTime(hour)}:${minute === 0 ? "00" : minute} ${
          hour < 12 ? "AM" : "PM"
        }`;
        className = "showTime";
      } else {
        time = "----";
        className = "hideTime";
      }

      const row = (
        <tr key={time} className={className}>
          <td>{time}</td>
          {daysOfWeek.map((day) => (
            <td key={`${day}-${time}`}>----</td>
          ))}
        </tr>
      );

      calendar.push(row);
    }
  }

  return calendar;
}

function App() {
  return (
    <div className="outerDivStyle">
      <div className="innerDivStyle">
        <div className="centeredDivStyle">
          <table className="table">
            <thead className="thead">
              <tr>
                <th>Time</th>
                <th>Sunday</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
              </tr>
            </thead>
            <tbody>{generateCalendar()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
