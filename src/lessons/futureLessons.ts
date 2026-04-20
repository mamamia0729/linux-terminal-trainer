// Future lessons to be released on subsequent days.
// These are ready to go, just move them into lessonList.ts when it's time.
//
// Day 7: 103.4 Pipes & Redirects
// Day 8: 103.7 Grep & Regular Expressions
// Day 9: 104.5 File Permissions
// Day 10: 105.1 Shell Environment
// Day 11: 104.7 Filesystem Hierarchy
// Day 12+: Capstone, Practice Exam

import type { Lesson } from "./types";

export const futureLessons: Lesson[] = [
  // ─── 103.4 Use streams, pipes and redirects (Weight: 4) ───
  {
    id: "103.4-pipes",
    title: "103.4, Pipes & Redirects",
    description:
      "LPIC-1 objective 103.4: Connect commands together with pipes (|) and save output to files with redirects (> and >>).",
    topic: "103.4",
    topicTitle: "Use streams, pipes and redirects",
    tasks: [
      {
        id: "pipe-cd-logs",
        instruction: "Navigate to the logs folder: `cd ~/logs`",
        hint: "Type: cd /home/user/logs",
        check: ({ command }) =>
          command === "cd ~/logs" ||
          command === "cd /home/user/logs" ||
          command === "cd logs",
      },
      {
        id: "pipe-cat-access",
        instruction: "View the access log: `cat access.log`",
        hint: "Type: cat access.log",
        check: ({ command }) => command === "cat access.log",
      },
      {
        id: "pipe-grep",
        instruction: "Find all 403 errors: `cat access.log | grep 403`",
        hint: "Type: cat access.log | grep 403",
        check: ({ command, output }) =>
          command.includes("|") &&
          command.includes("grep") &&
          command.includes("403") &&
          output.includes("403"),
      },
      {
        id: "pipe-grep-wc",
        instruction: "Count the 403 errors: `cat access.log | grep 403 | wc -l`",
        hint: "Type: cat access.log | grep 403 | wc -l",
        check: ({ command }) =>
          command.includes("|") &&
          command.includes("grep") &&
          command.includes("wc"),
      },
      {
        id: "pipe-grep-error",
        instruction: "Find ERRORs in error.log: `grep ERROR error.log`",
        hint: "Type: grep ERROR error.log",
        check: ({ command, output }) =>
          command.includes("grep") &&
          command.includes("ERROR") &&
          output.includes("ERROR"),
      },
      {
        id: "pipe-redirect-write",
        instruction:
          "Save errors to a file: `grep ERROR error.log > errors_only.txt`",
        hint: "Type: grep ERROR error.log > errors_only.txt",
        check: ({ command }) =>
          command.includes("grep") &&
          command.includes(">") &&
          command.includes("errors_only"),
      },
      {
        id: "pipe-cat-verify",
        instruction: "Verify the file was created: `cat errors_only.txt`",
        hint: "Type: cat errors_only.txt",
        check: ({ command, output }) =>
          command === "cat errors_only.txt" && output.includes("ERROR"),
      },
      {
        id: "pipe-redirect-append",
        instruction:
          "Append warnings too: `grep WARNING error.log >> errors_only.txt`",
        hint: "Type: grep WARNING error.log >> errors_only.txt",
        check: ({ command }) =>
          command.includes("grep") &&
          command.includes(">>") &&
          command.includes("errors_only"),
      },
    ],
  },

  // ─── 103.7 Search text files using regular expressions (Weight: 3) ───
  {
    id: "103.7-grep",
    title: "103.7, Grep & Regular Expressions",
    description:
      "LPIC-1 objective 103.7: Search text files using regular expressions. Master grep to find patterns in logs and config files.",
    topic: "103.7",
    topicTitle: "Search text files using regular expressions",
    tasks: [
      {
        id: "grep-cd-logs",
        instruction: "Navigate to logs: `cd /home/user/logs`",
        hint: "Type: cd /home/user/logs",
        check: ({ command }) =>
          command === "cd /home/user/logs" ||
          command === "cd ~/logs" ||
          command === "cd logs",
      },
      {
        id: "grep-basic",
        instruction: "Search for 'Failed' in auth.log: `grep Failed auth.log`",
        hint: "Type: grep Failed auth.log",
        check: ({ command, output }) =>
          command === "grep Failed auth.log" && output.includes("Failed"),
      },
      {
        id: "grep-case-insensitive",
        instruction: "Case-insensitive search: `grep -i error error.log`",
        hint: "Type: grep -i error error.log",
        check: ({ command, output }) =>
          command === "grep -i error error.log" && output.includes("ERROR"),
      },
      {
        id: "grep-count",
        instruction: "Count matching lines: `grep -c ERROR error.log`",
        hint: "Type: grep -c ERROR error.log",
        check: ({ command }) => command === "grep -c ERROR error.log",
      },
      {
        id: "grep-line-numbers",
        instruction: "Show line numbers: `grep -n WARNING error.log`",
        hint: "Type: grep -n WARNING error.log",
        check: ({ command, output }) =>
          command === "grep -n WARNING error.log" && output.includes(":"),
      },
      {
        id: "grep-invert",
        instruction:
          "Show lines WITHOUT 'INFO': `grep -v INFO error.log`",
        hint: "Type: grep -v INFO error.log",
        check: ({ command, output }) =>
          command === "grep -v INFO error.log" && !output.includes("[INFO]"),
      },
      {
        id: "grep-ip-pattern",
        instruction:
          "Find lines with IP 10.0.0.5: `grep 10.0.0.5 auth.log`",
        hint: "Type: grep 10.0.0.5 auth.log",
        check: ({ command, output }) =>
          command === "grep 10.0.0.5 auth.log" && output.includes("10.0.0.5"),
      },
      {
        id: "grep-pipe-combo",
        instruction:
          "Combine: find failed SSH logins and count them: `grep Failed auth.log | wc -l`",
        hint: "Type: grep Failed auth.log | wc -l",
        check: ({ command }) =>
          command.includes("grep") &&
          command.includes("Failed") &&
          command.includes("| wc"),
      },
    ],
  },

  // ─── 104.5 Manage file permissions and ownership (Weight: 3) ───
  {
    id: "104.5-permissions",
    title: "104.5, File Permissions",
    description:
      "LPIC-1 objective 104.5: Manage file permissions and ownership. Understand read/write/execute, ls -l output, and chmod.",
    topic: "104.5",
    topicTitle: "Manage file permissions and ownership",
    tasks: [
      {
        id: "perm-cd-home",
        instruction: "Go to your home directory: `cd`",
        hint: "Just type: cd",
        check: ({ command }) => command === "cd",
      },
      {
        id: "perm-ls-l",
        instruction: "View file permissions with `ls -l`",
        hint: "Type: ls -l",
        check: ({ command, output }) =>
          command === "ls -l" && output.includes("rw"),
      },
      {
        id: "perm-ls-la",
        instruction: "Show hidden files too: `ls -la`",
        hint: "Type: ls -la",
        check: ({ command, output }) =>
          command === "ls -la" && output.includes(".bashrc"),
      },
      {
        id: "perm-cd-scripts",
        instruction: "Navigate to scripts: `cd scripts`",
        hint: "Type: cd scripts",
        check: ({ command }) =>
          command === "cd scripts" || command === "cd scripts/",
      },
      {
        id: "perm-ls-scripts",
        instruction: "Check script permissions: `ls -l`",
        hint: "Type: ls -l",
        check: ({ command, output }) =>
          command === "ls -l" && output.includes("rwx"),
      },
      {
        id: "perm-chmod-exec",
        instruction:
          "Make cleanup.sh executable: `chmod 755 cleanup.sh`",
        hint: "Type: chmod 755 cleanup.sh",
        check: ({ command }) => command === "chmod 755 cleanup.sh",
      },
      {
        id: "perm-verify",
        instruction: "Verify the change: `ls -l`",
        hint: "Type: ls -l",
        check: ({ command, output }) =>
          command === "ls -l" && output.includes("rwxr-xr-x"),
      },
      {
        id: "perm-chmod-readonly",
        instruction:
          "Make a file read-only: `chmod 444 cleanup.sh`",
        hint: "Type: chmod 444 cleanup.sh",
        check: ({ command }) => command === "chmod 444 cleanup.sh",
      },
      {
        id: "perm-verify-readonly",
        instruction: "Verify it's read-only: `ls -l`",
        hint: "Type: ls -l",
        check: ({ command, output }) =>
          command === "ls -l" && output.includes("r--r--r--"),
      },
    ],
  },

  // ─── 105.1 Customize and use the shell environment (Weight: 4) ───
  {
    id: "105.1-shell-env",
    title: "105.1, Shell Environment",
    description:
      "LPIC-1 objective 105.1: Customize and use the shell environment. Explore shell config files like .bashrc and .profile.",
    topic: "105.1",
    topicTitle: "Customize and use the shell environment",
    tasks: [
      {
        id: "shell-cd-home",
        instruction: "Go to your home directory: `cd`",
        hint: "Just type: cd",
        check: ({ command }) => command === "cd",
      },
      {
        id: "shell-ls-hidden",
        instruction: "List hidden files to find shell configs: `ls -a`",
        hint: "Type: ls -a",
        check: ({ command, output }) =>
          command === "ls -a" && output.includes(".bashrc"),
      },
      {
        id: "shell-cat-bashrc",
        instruction: "Read your shell config: `cat .bashrc`",
        hint: "Type: cat .bashrc",
        check: ({ command, output }) =>
          command === "cat .bashrc" && output.includes("export"),
      },
      {
        id: "shell-cat-profile",
        instruction: "Read the login profile: `cat .profile`",
        hint: "Type: cat .profile",
        check: ({ command, output }) =>
          command === "cat .profile" && output.includes(".bashrc"),
      },
      {
        id: "shell-echo-shell",
        instruction: "Check your shell: `echo $SHELL`",
        hint: "Type: echo $SHELL",
        check: ({ command, output }) =>
          command === "echo $SHELL" && output.includes("/bin/bash"),
      },
      {
        id: "shell-export-editor",
        instruction: "Change your editor: `export EDITOR=nano`",
        hint: "Type: export EDITOR=nano",
        check: ({ command }) => command === "export EDITOR=nano",
      },
      {
        id: "shell-verify-editor",
        instruction: "Verify the change: `echo $EDITOR`",
        hint: "Type: echo $EDITOR",
        check: ({ command, output }) =>
          command === "echo $EDITOR" && output.includes("nano"),
      },
    ],
  },

  // ─── 104.7 Find system files and place files in the correct location (Weight: 2) ───
  {
    id: "104.7-fhs",
    title: "104.7, Filesystem Hierarchy",
    description:
      "LPIC-1 objective 104.7: Understand where things go in Linux. Explore /etc for configs, /var for logs, /home for users, /tmp for temporary files.",
    topic: "104.7",
    topicTitle: "Find system files and place files in the correct location",
    tasks: [
      {
        id: "fhs-etc",
        instruction: "Explore system config files: `ls /etc`",
        hint: "Type: ls /etc",
        check: ({ command, output }) =>
          command === "ls /etc" && output.includes("hostname"),
      },
      {
        id: "fhs-cat-hosts",
        instruction: "Read the hosts file: `cat /etc/hosts`",
        hint: "Type: cat /etc/hosts",
        check: ({ command, output }) =>
          command === "cat /etc/hosts" && output.includes("localhost"),
      },
      {
        id: "fhs-cat-passwd",
        instruction: "View user accounts: `cat /etc/passwd`",
        hint: "Type: cat /etc/passwd",
        check: ({ command, output }) =>
          command === "cat /etc/passwd" && output.includes("root"),
      },
      {
        id: "fhs-var-log",
        instruction: "Check the log directory: `ls /var/log`",
        hint: "Type: ls /var/log",
        check: ({ command, output }) =>
          command === "ls /var/log" && output.includes("syslog"),
      },
      {
        id: "fhs-cat-syslog",
        instruction: "Read system logs: `cat /var/log/syslog`",
        hint: "Type: cat /var/log/syslog",
        check: ({ command, output }) =>
          command === "cat /var/log/syslog" && output.includes("systemd"),
      },
      {
        id: "fhs-cat-fstab",
        instruction: "View disk mounts: `cat /etc/fstab`",
        hint: "Type: cat /etc/fstab",
        check: ({ command, output }) =>
          command === "cat /etc/fstab" && output.includes("ext4"),
      },
      {
        id: "fhs-tmp",
        instruction: "Check the temp directory: `ls /tmp`",
        hint: "Type: ls /tmp",
        check: ({ command }) => command === "ls /tmp",
      },
    ],
  },

  // ─── Capstone: Putting It All Together ───
  {
    id: "capstone",
    title: "Capstone, Real-World Scenario",
    description:
      "Put all your LPIC-1 skills together! You're a sysadmin investigating a security incident. Use everything you've learned to find the problem.",
    topic: "103-105",
    topicTitle: "Combined skills assessment",
    tasks: [
      {
        id: "cap-cd-logs",
        instruction: "Start your investigation in the logs: `cd /home/user/logs`",
        hint: "Type: cd /home/user/logs",
        check: ({ command }) =>
          command === "cd /home/user/logs" ||
          command === "cd ~/logs",
      },
      {
        id: "cap-ls",
        instruction: "See what log files are available: `ls -l`",
        hint: "Type: ls -l",
        check: ({ command }) => command === "ls -l",
      },
      {
        id: "cap-find-failed",
        instruction: "Find failed login attempts: `grep Failed auth.log`",
        hint: "Type: grep Failed auth.log",
        check: ({ command, output }) =>
          command === "grep Failed auth.log" && output.includes("Failed"),
      },
      {
        id: "cap-count-failed",
        instruction: "How many failed attempts? `grep -c Failed auth.log`",
        hint: "Type: grep -c Failed auth.log",
        check: ({ command }) => command === "grep -c Failed auth.log",
      },
      {
        id: "cap-find-ip",
        instruction:
          "Find the attacker's IP: `grep Failed auth.log | grep -i 10.0.0.5`",
        hint: "Look for the IP that keeps failing, pipe grep into grep",
        check: ({ command, output }) =>
          command.includes("|") &&
          command.includes("grep") &&
          output.includes("10.0.0.5"),
      },
      {
        id: "cap-check-errors",
        instruction: "Check for other errors: `grep ERROR error.log`",
        hint: "Type: grep ERROR error.log",
        check: ({ command, output }) =>
          command === "grep ERROR error.log" && output.includes("ERROR"),
      },
      {
        id: "cap-save-report",
        instruction:
          "Save your findings: `grep ERROR error.log > /tmp/incident.txt`",
        hint: "Type: grep ERROR error.log > /tmp/incident.txt",
        check: ({ command }) =>
          command.includes(">") && command.includes("incident"),
      },
      {
        id: "cap-verify-report",
        instruction: "Verify the report: `cat /tmp/incident.txt`",
        hint: "Type: cat /tmp/incident.txt",
        check: ({ command, output }) =>
          command === "cat /tmp/incident.txt" && output.includes("ERROR"),
      },
    ],
  },
];
