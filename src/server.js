const express = require("express");

const app = express();
const port = 5000;

// middleware
app.use(express.json());

app.post("/check", (req, res) => {});

app.listen(port, () => {
	console.log(`App is running on port ${port}`);
});
