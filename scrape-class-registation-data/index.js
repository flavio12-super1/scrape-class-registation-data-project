const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 4050;

// Serve static files from the "build" directory
app.use(
  express.static(
    path.resolve(__dirname, "../scrap-class-registration-data-frontend/build")
  )
);

// Handle requests for the root URL
app.get("/", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "../scrap-class-registration-data-frontend/build",
      "index.html"
    )
  );
});

function convertTimeStamp(timestamp) {
  let clockTime = "";
  const hours = timestamp.substring(0, 2);
  const minutes = timestamp.substring(2, 4);

  if (hours > 12) {
    clockTime = hours - 12 + ":" + minutes + " PM";
  } else if (hours == 12) {
    clockTime = hours + ":" + minutes + " PM";
  } else if (hours < 12) {
    clockTime = hours + ":" + minutes + " AM";
  }

  return clockTime;
}

function cleanTime(timeString) {
  let string = "";
  let cleanHour = 0;
  const parts = timeString.split(":");
  const hour = parts[0];
  cleanHour = parseInt(hour) + 0;
  string = `${cleanHour}:${parts[1]}`;
  console.log(string);
  return string;
}

function courseData(object, num) {
  let startTime = "";
  let endTime = "";
  let hoursWeek = 0;
  startTime = convertTimeStamp(
    object.meetingsFaculty[num].meetingTime.beginTime
  );
  // console.log(startTime);
  endTime = convertTimeStamp(object.meetingsFaculty[num].meetingTime.endTime);
  hoursWeek = object.meetingsFaculty[num].meetingTime.hoursWeek;
  // console.log(endTime);
  return {
    title: object.courseNumber,
    start: cleanTime(startTime),
    end: cleanTime(endTime),
    days: [
      object.meetingsFaculty[num].meetingTime.monday,
      object.meetingsFaculty[num].meetingTime.tuesday,
      object.meetingsFaculty[num].meetingTime.wednesday,
      object.meetingsFaculty[num].meetingTime.thursday,
      object.meetingsFaculty[num].meetingTime.friday,
    ],
    hours: hoursWeek,
  };
}

app.get("/data", (req, res) => {
  const filePath = path.join(__dirname, "data.json");

  // Read the JSON file
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error reading the JSON file" });
      return;
    }

    try {
      const jsonData = JSON.parse(data);

      let heatMapData = [];

      let dataObject = {};

      // Check if the "data" property is an array
      if (Array.isArray(jsonData.data)) {
        // Iterate through each object in the "data" array
        jsonData.data.forEach((object, index) => {
          if (object.scheduleTypeDescription === "Lecture") {
            // console.log("Lecture:", object.courseNumber);

            if (object.meetingsFaculty[0].meetingTime.meetingType === "LECT") {
              dataObject = courseData(object, 0);
            } else {
              dataObject = courseData(object, 1);
            }

            heatMapData.push(dataObject);
          }
        });
        fs.writeFile(
          "./cleanData.json",
          JSON.stringify(heatMapData, null, 2),
          (writeErr) => {
            if (writeErr) {
              console.error("Error writing to JSON file:", writeErr);
            } else {
              console.log("Data has been written to output.json");
            }
          }
        );

        // Send the entire "data" array as a response
        res.json({ message: "success" });
      } else {
        res.status(500).json({ error: 'The "data" property is not an array' });
      }
    } catch (parseError) {
      res.status(500).json({ error: "Error parsing JSON data" });
    }
  });
});

app.get("/convertData", (req, res) => {
  const filePath = path.join(__dirname, "cleanData.json");

  // Read the JSON file
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error reading the JSON file" });
      return;
    }

    try {
      const jsonData = JSON.parse(data);

      let heatMapData = {
        Monday: {},
        Tuesday: {},
        Wednesday: {},
        Thursday: {},
        Friday: {},
      };

      const startHour = 6;
      const endHour = 22;
      const timeSlotMinutes = 15;

      function convertTime(hour) {
        let clockTime;

        if (hour > 12) {
          clockTime = hour - 12;
          if (clockTime < 10) {
            clockTime = clockTime;
          }
        } else if (hour == 12) {
          clockTime = hour;
        } else if (hour >= 10 && hour < 12) {
          clockTime = hour;
        } else if (hour < 10) {
          clockTime = hour;
        }

        return clockTime;
      }

      // Iterate through each day of the week
      for (let day in heatMapData) {
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += timeSlotMinutes) {
            const time = `${convertTime(hour)}:${
              minute === 0 ? "00" : minute
            } ${hour < 12 ? "AM" : "PM"}`;

            // Add the time as a key with a heat score of 0
            heatMapData[day][time] = 0;
          }
        }
      }

      console.log(heatMapData);

      // Write the "heatMapData" object to a JSON file in the same directory
      fs.writeFile(
        "./finalData.json",
        JSON.stringify(heatMapData, null, 2),
        (writeErr) => {
          if (writeErr) {
            console.error("Error writing to JSON file:", writeErr);
          } else {
            console.log("Data has been written to finalData.json");
          }
        }
      );

      // Send the entire "heatMapData" object as a response
      res.json({ message: "success" });
    } catch (parseError) {
      res.status(500).json({ error: "Error parsing JSON data" });
    }
  });
});

function generateTimeSlots(start, end) {
  // Convert the time strings to Date objects to work with time calculations
  const startTime = new Date(`1/1/2023 ${start}`);
  const endTime = new Date(`1/1/2023 ${end}`);

  const timeSlotMinutes = 15;
  const timeSlots = [];

  // Loop to generate time slots
  while (startTime <= endTime) {
    const hour = startTime.getHours();
    const minute = startTime.getMinutes();
    const amOrPm = hour < 12 ? "AM" : "PM";

    // Format the time slot based on the hour part
    const timeSlot =
      hour % 12 === 0
        ? `12:${minute === 0 ? "00" : minute} ${amOrPm}`
        : `${hour % 12}:${minute === 0 ? "00" : minute} ${amOrPm}`;

    timeSlots.push(timeSlot);
    startTime.setMinutes(startTime.getMinutes() + timeSlotMinutes);
  }

  return timeSlots;
}

app.get("/compileData", (req, res) => {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const filePath = path.join(__dirname, "cleanData.json");
  // const jsonFilePath = "./finalData.json";
  const jsonFilePath =
    "../scrap-class-registration-data-frontend/src/jsonFiles/finalData.json";

  // Read the JSON file
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error reading the JSON file" });
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      const filePath = path.join(__dirname, "finalData.json");

      // Read the JSON file
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          res.status(500).json({ error: "Error reading the JSON file" });
          return;
        }

        try {
          let jsonDataFinal = JSON.parse(data);
          // console.log(jsonDataFinal);
          console.log(jsonData.length);
          for (i = 0; i < jsonData.length; i++) {
            for (j = 0; j < 5; j++) {
              if (jsonData[i].days[j] === true) {
                let parts = jsonData[i].end.split(":");
                let partsTwo = parts[1].split(" ");
                let mins = partsTwo[0];
                let timeSlots;
                if (mins === "20") {
                  let newJsonDatEnd;
                  if (partsTwo[1] === "PM") {
                    newJsonDatEnd = parts[0] + ":30 PM";
                  } else {
                    newJsonDatEnd = parts[0] + ":30 AM";
                  }

                  console.log("---------------------");
                  console.log(daysOfWeek[j], ":");
                  console.log(jsonData[i].start);
                  console.log("- - - - - - - - - - -");
                  timeSlots = generateTimeSlots(
                    jsonData[i].start,
                    newJsonDatEnd
                  );
                  for (k = 0; k < timeSlots.length; k++) {
                    jsonDataFinal[daysOfWeek[j]][timeSlots[k]] += 1 / 5;
                    jsonDataFinal[daysOfWeek[j]][timeSlots[k]] = parseFloat(
                      jsonDataFinal[daysOfWeek[j]][timeSlots[k]].toFixed(2)
                    );
                  }
                  console.log(timeSlots);
                  console.log("- - - - - - - - - - -");
                  console.log(newJsonDatEnd);
                  console.log("---------------------");
                } else {
                  console.log("---------------------");
                  console.log(daysOfWeek[j], ":");
                  console.log(jsonData[i].start);
                  console.log("- - - - - - - - - - -");
                  timeSlots = generateTimeSlots(
                    jsonData[i].start,
                    jsonData[i].end
                  );
                  for (k = 0; k < timeSlots.length; k++) {
                    jsonDataFinal[daysOfWeek[j]][timeSlots[k]] += 1 / 5;
                    jsonDataFinal[daysOfWeek[j]][timeSlots[k]] = parseFloat(
                      jsonDataFinal[daysOfWeek[j]][timeSlots[k]].toFixed(2)
                    );
                  }
                  console.log(timeSlots);
                  console.log("- - - - - - - - - - -");
                  console.log(jsonData[i].end);
                  console.log("---------------------");
                }
              }
            }
          }
          fs.writeFile(
            jsonFilePath,
            JSON.stringify(jsonDataFinal, null, 2),
            (writeErr) => {
              if (writeErr) {
                console.error("Error writing to JSON file:", writeErr);
              } else {
                console.log("Data has been written to finalData.json");
              }
            }
          );

          // Send the entire "data" array as a response
        } catch (parseError) {
          res.status(500).json({ error: "Error parsing JSON data" });
        }
      });
      // Send the entire "data" array as a response
      res.json({ message: "success" });
    } catch (parseError) {
      res.status(500).json({ error: "Error parsing JSON data" });
    }
  });
});

app.get("/testing", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
