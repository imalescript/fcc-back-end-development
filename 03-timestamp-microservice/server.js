import express from "express";
import cors from "cors";

export const app = express();
const PORT = 8000;

export class TimestampService {
  unixPattern = /^-?\d+$/;

  isUnixTimestamp = (value) => this.unixPattern.test(value);

  toDate = (dateParam) =>
    this.isUnixTimestamp(dateParam)
      ? new Date(Number(dateParam))
      : new Date(dateParam);

  getCurrentTimestamp = () => {
    const now = new Date();
    return {
      unix: now.getTime(),
      utc: now.toUTCString(),
    };
  };

  getTimestamp = (dateParam) => {
    if (!dateParam) {
      return this.getCurrentTimestamp();
    }

    const parsedDate = this.toDate(dateParam);

    if (isNaN(parsedDate.getTime())) {
      return { error: "Invalid Date" };
    }

    return {
      unix: parsedDate.getTime(),
      utc: parsedDate.toUTCString(),
    };
  };
}

export const timestampService = new TimestampService();

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.sendFile(import.meta.dirname + "/views/index.html");
});

app.get("/api{/:date}", (req, res) => {
  res.json(timestampService.getTimestamp(req.params.date));
});

const isDirectRun = process.argv[1] === import.meta.filename;

if (isDirectRun) {
  const listener = app.listen(PORT, function () {
    console.log("Your app is listening on port " + listener.address().port);
  });
}
