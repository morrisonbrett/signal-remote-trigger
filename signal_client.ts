// signal_client.ts - Fixed TypeScript client with properly working command line arguments
import axios, { AxiosError, AxiosResponse } from 'axios';

// Default configuration
const config: ClientConfig = {
  serverIp: '192.168.100.3',
  port: 8888,
  defaultRecipient: 'Note to Self',
  defaultMessage: 'Busy, can\'t talk right now'
};

// Type definitions
interface ClientConfig {
  serverIp: string;
  port: number;
  defaultRecipient: string;
  defaultMessage: string;
}

interface CommandLineArgs {
  recipient: string;
  message: string;
  serverIp: string;
  port: number;
}

interface MessagePayload {
  recipient: string;
  message: string;
}

// Check for help flag immediately at the start
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Show help message
function showHelp(): void {
  console.log(`
Signal Client - Send messages via Signal remotely

Usage:
  node signal_client.js [options] [message]

Options:
  -r, --recipient <n>   Recipient name (default: "${config.defaultRecipient}")
  -m, --message <text>     Message to send (default: "${config.defaultMessage}")
  -s, --server <ip>        Server IP address (default: ${config.serverIp})
  -p, --port <number>      Server port (default: ${config.port})
  -h, --help               Show this help message

Examples:
  node signal_client.js
  node signal_client.js "I'll call you back in 5 minutes"
  node signal_client.js -r "Wife" -m "Running late, be home soon"
  `);
}

// Parse command-line arguments
function parseArgs(): CommandLineArgs {
  const args = process.argv.slice(2); // Skip 'node' and 'script.js'
  console.log('Arguments:', args);
  
  let recipient: string = config.defaultRecipient;
  let message: string = config.defaultMessage;
  let serverIp: string = config.serverIp;
  let port: number = config.port;
  
  // Process flags with switch statement for reliability
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '-r':
      case '--recipient':
        if (i + 1 < args.length) {
          recipient = args[++i];
          console.log(`Set recipient to: ${recipient}`);
        }
        break;
        
      case '-m':
      case '--message':
        if (i + 1 < args.length) {
          message = args[++i];
          console.log(`Set message to: ${message}`);
        }
        break;
        
      case '-s':
      case '--server':
        if (i + 1 < args.length) {
          serverIp = args[++i];
          console.log(`Set server IP to: ${serverIp}`);
        }
        break;
        
      case '-p':
      case '--port':
        if (i + 1 < args.length) {
          const portArg = parseInt(args[++i], 10);
          if (!isNaN(portArg)) {
            port = portArg;
            console.log(`Set port to: ${port}`);
          }
        }
        break;
        
      default:
        // If this is the last argument and doesn't start with a dash, use it as the message
        if (!arg.startsWith('-') && i === args.length - 1) {
          message = arg;
          console.log(`Set message from positional argument: ${message}`);
        }
    }
  }
  
  return { recipient, message, serverIp, port };
}

// Send message function
async function sendMessage(): Promise<void> {
  try {
    const { recipient, message, serverIp, port } = parseArgs();
    const SERVER_URL = `http://${serverIp}:${port}/send-message`;
    
    console.log('\nConfiguration:');
    console.log(`  Recipient: ${recipient}`);
    console.log(`  Message: ${message}`);
    console.log(`  Server: ${serverIp}:${port}`);
    console.log(`  URL: ${SERVER_URL}`);
    
    console.log('\nSending request...');
    
    const payload: MessagePayload = { recipient, message };
    
    const response: AxiosResponse = await axios.post(SERVER_URL, payload, { 
      timeout: 10000,
      validateStatus: () => true 
    });
    
    console.log('Server response:', response.data);
    console.log('Message sent successfully!');
  } catch (error) {
    console.error('Error sending message request:');
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        console.error(`Server responded with status ${axiosError.response.status}: ${JSON.stringify(axiosError.response.data)}`);
      } else if (axiosError.request) {
        console.error('No response received from server, but request was sent.');
        console.log('The message may still have been triggered successfully.');
      } else {
        console.error(`Request setup error: ${axiosError.message}`);
      }
    } else {
      console.error('Unexpected error:', error instanceof Error ? error.message : String(error));
    }
  }
}

// Execute immediately - but only if not imported by another module
// This ensures the script runs when called directly but not when imported
if (require.main === module) {
  sendMessage().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

// Export for testing/importing
export { parseArgs, sendMessage, showHelp };