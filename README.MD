# 📱 Signal Remote Trigger

A distributed system that allows you to send Signal messages from one computer to another without interrupting your foreground application. Perfect for gaming, simulations, or any scenario where you need to send quick messages without losing focus.

## 🔍 Overview

This project consists of two main components:

1. **Server** - Runs on your main computer with Signal installed
2. **Client** - Runs on any computer that needs to send messages remotely

The system works by having the client send HTTP requests to the server, which then uses AutoHotkey to send messages through Signal without disrupting your current activity.

## 🎮 Use Cases

- Send "busy" messages while gaming without pausing or alt-tabbing
- Send predefined messages during racing simulations without crashing
- Quickly respond to messages while in full-screen applications
- Remote message sending from any device on your network

## 📋 Requirements

- Windows (for AutoHotkey support)
- [Node.js](https://nodejs.org/) (v14 or higher)
- [TypeScript](https://www.typescriptlang.org/) (`npm install -g typescript`)
- [AutoHotkey](https://www.autohotkey.com/) installed on the server computer
- [Signal Desktop](https://signal.org/download/) installed on the server computer

## 🚀 Installation

### 💻 Server Setup (Computer with Signal)

1. Clone this repository
    ```
    git clone git@github.com:morrisonbrett/signal-remote-trigger.git
    cd signal-remote-trigger
    ```

2. Install dependencies
    ```
    npm install
    ```

3. Update the configuration in `signal_server.ts`
    ```typescript
    // Update these paths to match your system
    const config: ServerConfig = {
      port: 8080,
      signalExePath: 'C:/Path/To/SignalSend.exe', // Update this path
      allowedIps: ['192.168.1.101'] // IP of your client computer
    };
    ```

4. Create and compile the AutoHotkey script:
   - Save the `SignalSend.ahk` script from this repo
   - Compile it to an EXE using AutoHotkey's compiler
   - Update the path in the server configuration

5. Compile and run the server
    ```
    tsc signal_server.ts --esModuleInterop
    node signal_server.js
    ```

### 📱 Client Setup (Remote Computer)

1. Clone or copy this repository to your client computer
    ```
    git clone git@github.com:morrisonbrett/signal-remote-trigger.git
    cd signal-remote-trigger
    ```

2. Install dependencies
    ```
    npm install
    ```

3. Update the configuration in `signal_client.ts`
    ```typescript
    // Update with your server computer's IP
    const config: ClientConfig = {
      serverIp: '192.168.1.100',  // IP of your server computer
      port: 8080,
      defaultRecipient: 'Note to Self',
      defaultMessage: 'Busy, can\'t talk right now'
    };
    ```

4. Compile the client
    ```
    tsc signal_client.ts --esModuleInterop
    ```

## 📝 Usage

### 🔰 Basic Usage

Send a message using default settings:

```
node signal_client.js
```

Send a custom message:

```
node signal_client.js -m "I'll call you back in 5 minutes"
```

Send a message to a specific contact:

```
node signal_client.js -r "Wife" -m "Running late, be home soon"
```

### ⌨️ Command Line Options

```
-r, --recipient <name>  Recipient name (default: "Note to Self")
-m, --message <text>    Message to send (default: "Busy, can't talk right now")
-s, --server <ip>       Server IP address (default: configured IP)
-p, --port <number>     Server port (default: 8080)
-h, --help              Show help message
```

### 🎛️ Integration with Stream Deck

For easy triggering, create batch files for your common messages:

1. Create a batch file (e.g., `busy.bat`):
   ```
   @echo off
   "C:\Program Files\nodejs\node.exe" "C:\path\to\signal_client.js" -m "Busy, can't talk right now"
   ```

2. Configure Stream Deck to run this batch file when pressing a button

### Integration with Racing Wheel Buttons

You can map racing wheel buttons to keyboard keys using tools like JoyToKey, then use AutoHotkey to trigger the Signal messages when those keys are pressed.

## ⚙️ Configuration Files

### SignalSend.ahk

The AutoHotkey script that handles the actual interaction with Signal. It takes two command-line parameters:
1. Recipient name
2. Message text

### signal_server.ts

The server application that runs on the computer with Signal installed. It receives requests from clients and executes the AutoHotkey script.

### signal_client.ts

The client application that sends requests to the server. It can be run with command-line arguments to customize the recipient and message.

## 🔒 Security Considerations

- The server only accepts connections from whitelisted IP addresses
- Consider using a firewall to further restrict access to the server
- For added security, you could implement API key authentication

## 🛠️ Troubleshooting

### 🖥️ Server Issues
- Make sure Signal is installed and working properly
- Verify that AutoHotkey is installed and the script compiled correctly
- Check firewall settings to ensure the port is open
- Verify the correct path to the AutoHotkey EXE is configured

### 📱 Client Issues
- Make sure the server IP and port are configured correctly
- Check network connectivity between client and server
- Run the client with the `-h` flag to verify command-line parsing is working

## 📄 License

[MIT](LICENSE)

## 🙏 Acknowledgements

This project uses:
- [AutoHotkey](https://www.autohotkey.com/) for Windows automation
- [Express](https://expressjs.com/) for the server API
- [Axios](https://axios-http.com/) for HTTP requests
- [TypeScript](https://www.typescriptlang.org/) for type-safe code
