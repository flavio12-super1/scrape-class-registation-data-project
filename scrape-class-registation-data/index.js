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
    start: startTime,
    end: endTime,
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
        console.log(heatMapData);
        // Write the "data" array to a JSON file in the same directory
        fs.writeFile(
          "../scrap-class-registration-data-frontend/src/jsonFiles/cleanData.json",
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

app.get("/testing", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
