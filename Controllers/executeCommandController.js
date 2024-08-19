import { NodeSSH } from "node-ssh";

const ssh = new NodeSSH();

async function executeCommand(command) {
  try {
    await ssh.connect({
      host: process.env.SSH_HOST,
      port: process.env.SSH_PORT,
      username: process.env.SSH_USER,
      password: process.env.SSH_PASS,
      // readyTimeout: 60000,
    });

    const result = await ssh.execCommand(`source ~/.bashrc && ${command}"`);

    // const customPath = "/home/switchuser/pdir/bin/";
    // const result = await ssh.execCommand(
    //   `bash -i -c "cd ${customPath} && ${command}"`
    // );
    // const result = await ssh.execCommand(`
    //   source ~/.bashrc && \
    //   source ~/.bash_profile && \
    //   ${command}
    // `);

    // const result = await ssh.execCommand(command);
    return {
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } catch (err) {
    console.error("SSH Connection error:", err);
    throw err;
  }
}

// Define an API route to execute a command on the remote server
const sendLoad = async (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: "No command provided" });
  }

  try {
    const output = await executeCommand(command);
    res.json(output);
  } catch (err) {
    res.status(500).json({ error: "Failed to execute command" });
  }
};

const checkConnection = async () => {
  try {
    // Attempt to connect to SSH
    console.log("Connecting to SSH...");
    await ssh.connect({
      host: process.env.SSH_HOST,
      port: process.env.SSH_PORT,
      username: process.env.SSH_USER,
      password: process.env.SSH_PASS,
    });
    console.log("SSH Connection established.");

    // Run a simple command to verify connection
    console.log("Running health check command: uptime");
    const result = await ssh.execCommand("uptime");

    return {
      status: "connected",
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } catch (err) {
    console.error("SSH Connection error:", err);
    return {
      status: "disconnected",
      error: err.message,
    };
  }
};

const checkConnectionHandler = async (req, res) => {
  try {
    const result = await checkConnection();
    if (result.status === "connected") {
      res.json({
        status: "success",
        message: "SSH connection is working",
        data: {
          stdout: result.stdout,
          stderr: result.stderr,
        },
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "SSH connection failed",
        error: result.error,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Unexpected error occurred",
      error: err.message,
    });
  }
};

export { sendLoad, checkConnectionHandler };
