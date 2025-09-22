// This file sets up and starts the Express server for the BCFI HR Application System - Teacher Application Process

import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`BCFI HR Application System running on http://localhost:${PORT}`);
  console.log(`Teacher application portal ready for use`);
});
