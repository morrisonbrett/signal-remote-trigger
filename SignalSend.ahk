#NoEnv
#SingleInstance Force
SendMode Input
SetWorkingDir %A_ScriptDir%

; Set default values
ContactName := "Note to Self"
BusyMessage := "Busy, can't talk right now"
SignalExeName := "Signal Beta.exe"  ; Adjust if needed
SignalExePath := "C:\Users\" . A_UserName . "\AppData\Local\Programs\signal-desktop-beta\Signal Beta.exe"

; Get parameters from command line using proper command line parsing
if (A_Args.Length() >= 1) {
    ContactName := A_Args[1]
}

if (A_Args.Length() >= 2) {
    BusyMessage := A_Args[2]
}

; Create a log file for debugging
LogFile := A_Temp . "\signal_log.txt"
FileAppend, % "Script started at " . A_Now . " with parameters: " . ContactName . ", " . BusyMessage . "`n", %LogFile%

; Message sending function
SendBusyMessage()
{
    global ContactName, BusyMessage, SignalExeName, SignalExePath, LogFile
    
    ; Log start of function
    FileAppend, % "SendBusyMessage function called at " . A_Now . "`n", %LogFile%
    
    ; Try to find Signal if it's already running
    If WinExist("ahk_exe " . SignalExeName) {
        ; Signal is running
        WinGet, signalPID, PID, ahk_exe %SignalExeName%
        FileAppend, % "Signal already running with PID: " . signalPID . "`n", %LogFile%
    } else {
        ; Signal not running - start it
        FileAppend, % "Signal not running. Starting from: " . SignalExePath . "`n", %LogFile%
        
        If !FileExist(SignalExePath) {
            FileAppend, % "ERROR: Signal executable not found at: " . SignalExePath . "`n", %LogFile%
            return
        }
        
        Run, "%SignalExePath%",, UseErrorLevel
        if ErrorLevel {
            FileAppend, % "ERROR: Failed to launch Signal. Error: " . ErrorLevel . "`n", %LogFile%
            return
        }
        
        WinWait, ahk_exe %SignalExeName%,, 15
        if ErrorLevel {
            FileAppend, % "ERROR: Signal launched but window did not appear within timeout`n", %LogFile%
            return
        }
        
        Sleep, 4000  ; Give Signal time to fully initialize
        WinGet, signalPID, PID, ahk_exe %SignalExeName%
    }
    
    ; Store active window to restore later
    WinGetActiveTitle, originalWindow
    
    ; Activate Signal window
    FileAppend, % "Activating Signal window`n", %LogFile%
    WinActivate, ahk_pid %signalPID%
    WinWaitActive, ahk_pid %signalPID%,, 2
    
    ; Give Signal a moment to fully focus
    Sleep, 400
    
    ; Ensure we're in the main Signal window
    FileAppend, % "Clearing any dialogs with Escape key`n", %LogFile%
    Send, {Escape}{Escape}
    Sleep, 400
    
    ; Use Ctrl+F to search for the conversation
    FileAppend, % "Opening search with Ctrl+F`n", %LogFile%
    Send, ^f
    Sleep, 500
    
    ; Type the contact name directly
    FileAppend, % "Typing contact name: " . ContactName . "`n", %LogFile%
    SendInput, %ContactName%
    Sleep, 500
    
    ; Press Enter to select the contact and focus the message field
    FileAppend, % "Selecting conversation`n", %LogFile%
    Send, {Enter}
    Sleep, 500
    
    ; Type the message directly using the clipboard for accuracy
    FileAppend, % "Typing message: " . BusyMessage . "`n", %LogFile%
    
    ; Save current clipboard
    ClipSaved := ClipboardAll
    Clipboard := ""  ; Clear clipboard
    
    ; Put message on clipboard and paste it
    Clipboard := BusyMessage
    ClipWait, 2
    Send, ^v
    Sleep, 500
    
    ; Restore original clipboard
    Clipboard := ClipSaved
    ClipSaved := ""
    
    ; Send the message
    FileAppend, % "Sending message`n", %LogFile%
    Send, {Enter}
    Sleep, 400
    
    ; Restore original window
    FileAppend, % "Restoring original window: " . originalWindow . "`n", %LogFile%
    WinActivate, %originalWindow%
    
    ; Log completion
    FileAppend, % "Message sent successfully at " . A_Now . "`n", %LogFile%
}

; Execute the function immediately
SendBusyMessage()