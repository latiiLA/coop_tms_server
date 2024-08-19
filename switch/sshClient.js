const { Client } = require("ssh2");
const express = require("express");
const app = express();

// Add this to your existing routes
app.use(express.json());

// SSH connection details
const sshConfig = {
  host: "your-server-address",
  port: 22,
  username: "your-username",
  privateKey: require("fs").readFileSync("/path/to/your/private/key"),
};

// Route to execute SSH command
app.post("/api/execute", (req, res) => {
  const { command } = req.body;

  const conn = new Client();
  conn
    .on("ready", () => {
      conn.exec(command, (err, stream) => {
        if (err)
          return res.status(500).json({ error: "Error executing command" });

        let output = "";
        stream
          .on("close", (code, signal) => {
            conn.end();
            res.json({ output, code });
          })
          .on("data", (data) => {
            output += data.toString();
          })
          .stderr.on("data", (data) => {
            output += data.toString();
          });
      });
    })
    .connect(sshConfig);
});

// Add this to your existing server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
