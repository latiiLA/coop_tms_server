// import { NodeSSH } from "node-ssh";

// const ssh = new NodeSSH();

// // async function executeCommand(command) {
// //   try {
// //     await ssh.connect({
// //       host: process.env.SSH_HOST,
// //       port: process.env.SSH_PORT,
// //       username: process.env.SSH_USER,
// //       password: process.env.SSH_PASS,
// //       // readyTimeout: 60000,
// //     });

// //     // const result = await ssh.execCommand(`source ~/.bashrc && ${command}"`);

// //     // const customPath = "/home/switchuser/pdir20221209/ositeroot/bin/";
// //     // const result = await ssh.execCommand(
// //     //   `bash -i -c "cd ${customPath} && ${command}"`
// //     // );
// //     // const result = await ssh.execCommand(`
// //     //   source ~/.bashrc && \
// //     //   source ~/.bash_profile && \
// //     //   ${command}
// //     // `);

// //     const result = await ssh.execCommand(`${command}`);
// //     return {
// //       stdout: result.stdout,
// //       stderr: result.stderr,
// //     };
// //   } catch (err) {
// //     console.error("SSH Connection error:", err);
// //     throw err;
// //   }
// // }

// // Define an API route to execute a command on the remote server
// // const sendLoad = async (req, res) => {
// //   const { command } = req.body;

// //   if (!command) {
// //     return res.status(400).json({ error: "No command provided" });
// //   }

// //   try {
// //     const output = await executeCommand(command);
// //     res.json(output);
// //   } catch (err) {
// //     res.status(500).json({ error: "Failed to execute command" });
// //   }
// // };

// import { exec } from "child_process";
// import os from "os";

// // Function to execute a command
// const executeCommand = (command) => {
//   return new Promise((resolve, reject) => {
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         return reject({ stderr: stderr.trim() });
//       }
//       resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
//     });
//   });
// };

// // Determine the appropriate command based on the OS
// const getCommandWithPath = (command) => {
//   const platform = os.platform();

//   if (platform === "win32") {
//     // For Windows
//     return `set PATH=%PATH%;C:\\pdir20221209\\bin && ${command}`;
//   } else {
//     // For Unix-like systems (Linux, macOS)
//     return `export PATH=$PATH:/pdir20221209/bin && ${command}`;
//   }
// };

// // Function to handle the load command request
// const sendLoad = async (req, res) => {
//   const { command } = req.body;

//   if (!command) {
//     return res.status(400).json({ error: "No command provided" });
//   }

//   try {
//     const combinedCommand = getCommandWithPath(command);
//     const output = await executeCommand(combinedCommand);
//     res.json(output);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to execute command", details: err });
//   }
// };

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

// export { sendLoad, checkConnectionHandler };

import { exec } from "child_process";
import fs from "fs";
import path from "path";

// Function to execute a command
const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject({ stderr: stderr.trim() });
      }
      resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
};

// Function to get commands from a file and execute them
const executeCommandsFromFile = async (filePath, param1, param2) => {
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Split into individual commands
    const commands = fileContent
      .split("\n")
      .filter((line) => line.trim() !== "");

    // Replace variables in commands
    const formattedCommands = commands.map((cmd) =>
      cmd.replace(/\$1/g, param1).replace(/\$2/g, param2)
    );

    // Execute each command
    for (const cmd of formattedCommands) {
      const output = await executeCommand(`/pdir20221209/bin/atmcmd ${cmd}`);
      console.log(`Output for command '${cmd}':`, output);
    }

    return { success: true };
  } catch (err) {
    throw new Error(`Failed to execute commands: ${err.message}`);
  }
};

// API endpoint to handle command execution
const sendLoad = async (req, res) => {
  const { filePath, param1, param2 } = req.body;

  if (!filePath || !param1 || !param2) {
    return res
      .status(400)
      .json({ error: "File path and parameters are required" });
  }

  try {
    const result = await executeCommandsFromFile(filePath, param1, param2);
    res.json(result);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to execute commands", details: err.message });
  }
};

export { sendLoad, checkConnectionHandler };
