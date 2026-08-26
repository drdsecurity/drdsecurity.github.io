(() => {
  'use strict';
  const form = document.querySelector('#terminal-form');
  const input = document.querySelector('#terminal-input');
  const output = document.querySelector('#terminal-output');
  if (!form || !input || !output) return;

  const history = [];
  let historyIndex = -1;
  const appendLine = (text, className = 'terminal-response') => {
    const entry = document.createElement('p');
    entry.className = className;
    entry.textContent = text;
    output.append(entry);
    output.scrollTop = output.scrollHeight;
  };
  const navigate = navKey => {
    if (typeof window.navigateTo !== 'function' || !window.navigateTo(navKey)) {
      appendLine('Navigation controller unavailable.', 'terminal-response');
      return;
    }
    appendLine(`NAVIGATION // ${navKey.toUpperCase()} SELECTED`, 'terminal-response');
  };
  const commands = Object.freeze({
    help: () => appendLine('Commands: help, about, skills, projects, research, contact, github, clear, home, arsenal, achievements, status.'),
    about: () => appendLine('Abdul Masood | Founder & CEO, D.R.D Security Private Limited. Focus: security analysis, VAPT, DFIR, research, training, and cyber resilience.'),
    skills: () => appendLine('Networking, Linux, penetration testing, VAPT, DFIR, digital forensics, incident response, malware analysis, cloud security, threat hunting, and scripting.'),
    projects: () => appendLine('Systems: LYRA AIOS; DRD GUARDIAN SUIT; DRD GUARDIAN HL150; DRD VAJRA-X.'),
    research: () => appendLine('Research Areas: AI in Cyber Security; IoT Security; Malware Analysis; Cloud Security; Threat Intelligence; DFIR & Incident Response.'),
    contact: () => appendLine('Verified channels: github.com/drdsecurity | drdsecurity.com | LinkedIn | YouTube | Instagram | Discord.'),
    github: () => appendLine('Public profile: https://github.com/drdsecurity | Public repositories and contribution activity available.'),
    clear: () => output.replaceChildren(),
    home: () => navigate('home'),
    arsenal: () => navigate('arsenal'),
    achievements: () => navigate('achievements'),
    status: () => appendLine('SYSTEM // ONLINE\nNODE // DRD-HQ\nMISSION // LEARN | RESEARCH | INVESTIGATE')
  });
  const runCommand = rawCommand => {
    const command = rawCommand.trim().toLowerCase();
    if (!command) return;
    history.unshift(command);
    historyIndex = -1;
    appendLine(`drdsecurity@cyber-core:~$ ${command}`, 'terminal-command');
    const handler = commands[command];
    if (handler) handler();
    else appendLine("Unknown command. Type 'help' to view available commands.");
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    runCommand(input.value);
    input.value = '';
    input.focus();
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault();
      historyIndex = Math.min(historyIndex + 1, history.length - 1);
      input.value = history[historyIndex];
    }
    if (event.key === 'ArrowDown' && history.length) {
      event.preventDefault();
      historyIndex = Math.max(historyIndex - 1, -1);
      input.value = historyIndex < 0 ? '' : history[historyIndex];
    }
  });
})();
