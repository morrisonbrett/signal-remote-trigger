# PowerShell script to run Node.js without showing any window
$ServerDir = "c:\scripts\Signal Sender"
$ServerScript = "signal_server.js"

# Create a process with hidden window
$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = "node.exe"
$startInfo.Arguments = $ServerScript
$startInfo.WorkingDirectory = $ServerDir
$startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$startInfo.CreateNoWindow = $true

# Start the process
[System.Diagnostics.Process]::Start($startInfo)