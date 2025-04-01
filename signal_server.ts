// signal_server.ts - Updated TypeScript server with strong typing
import express, { Request, Response, NextFunction } from 'express';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Type definitions
interface MessageRequest {
  recipient: string;
  message: string;
}

interface ServerConfig {
  port: number;
  signalExePath: string;
  allowedIps: string[];
}

// Create Express app
const app = express();
app.use(express.json()); // For parsing application/json

// Add basic logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// IP filtering middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const clientIp = (req.ip || '').replace('::ffff:', '');
  
  if (process.env.NODE_ENV === 'development' || config.allowedIps.includes(clientIp)) {
    next();
  } else {
    console.log(`Rejected request from unauthorized IP: ${clientIp}`);
    res.status(403).send('Access denied');
  }
});

// Root endpoint - status check
app.get('/', (_req: Request, res: Response) => {
  res.send('Signal Remote Server is running');
});

// Backward compatibility endpoint
app.get('/send-busy', (_req: Request, res: Response) => {
  console.log('Received legacy request to send busy message');
  sendSignalMessage(res, 'Note to Self', 'Busy, can\'t talk right now');
});

// Endpoint that accepts recipient and message
app.post('/send-message', (req: Request, res: Response) => {
  const { recipient, message } = req.body as MessageRequest;
  
  if (!recipient || !message) {
    res.status(400).send('Missing recipient or message');
  }
  
  console.log(`Received request to send message to ${recipient}: "${message}"`);
  sendSignalMessage(res, recipient, message);
});

// Load settings from file
function loadSettings(): ServerConfig {
  try {
    const settingsPath = path.join(__dirname, 'settings.json');
    const settingsData = fs.readFileSync(settingsPath, 'utf8');
    const settings = JSON.parse(settingsData);
    return settings.server;
  } catch (error) {
    console.error('Error loading server settings:', error);
    // Return default settings if file not found or invalid
    return {
      port: 8080,
      signalExePath: 'SignalSend.exe',
      allowedIps: ['127.0.0.1']
    };
  }
}

// Function to run the AHK executable with parameters
function sendSignalMessage(res: Response, recipient: string, message: string): void {
  // Verify the EXE exists
  if (!fs.existsSync(config.signalExePath)) {
    console.error(`Signal EXE not found at: ${config.signalExePath}`);
    res.status(500).send('Signal EXE not found');
    return;
  }
  
  // Properly escape the parameters for command line
  const escapedRecipient = recipient.replace(/"/g, '\\"');
  const escapedMessage = message.replace(/"/g, '\\"');
  
  // Execute the command with parameters
  const command = `"${config.signalExePath}" "${escapedRecipient}" "${escapedMessage}"`;
  
  console.log(`Executing: ${command}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Signal EXE: ${error.message}`);
      res.status(500).send('Failed to send message');
      return;
    }
    
    if (stderr) {
      console.error(`Signal EXE error: ${stderr}`);
    }
    
    if (stdout) {
      console.log(`Signal EXE output: ${stdout}`);
    }
    
    console.log(`Message to ${recipient} sent successfully`);
    res.send('Message sending initiated');
  });
}

const config: ServerConfig = loadSettings();

// Start the server
const server = app.listen(config.port, () => {
  console.log(`Signal Remote Server running on port ${config.port}`);
  console.log(`Using Signal EXE: ${config.signalExePath}`);
  console.log(`Allowed IPs: ${config.allowedIps.join(', ')}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;