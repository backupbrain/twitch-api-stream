require("dotenv").config();
import { app } from "./app";

const requestedPort = process.env.PORT || "3030";
const port = parseInt(requestedPort);

app.listen(port, () => {
  console.log(`Rest API listening on port ${port}`);
});
