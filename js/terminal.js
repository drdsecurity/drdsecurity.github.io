(() => {
  const form = document.querySelector('#terminal-form');
  const input = document.querySelector('#terminal-input');
  const output = document.querySelector('#terminal-output');
  if (!form || !input || !output) return;
  const responses = {
    help: 'Commands: help, whoami, about, skills, projects, research, github, contact, status, mission, clear.',
    whoami: 'Abdul Masood | Founder & CEO, D.R.D Security Private Limited.',
    about: 'Executive focus: security analysis, penetration testing, VAPT, DFIR, research, training, and cyber resilience.',
    skills: 'Networking, Linux, penetration testing, VAPT, DFIR, forensics, incident response, cloud security, threat hunting, scripting, and research.',
    projects: 'Systems: LYRA AIOS; D.R.D COMMAND OS; CLOUDFUSION; D.R.D Training / Security Ecosystem.',
    research: 'Cybersecurity, penetration testing, DFIR, threat intelligence, cloud security, malware analysis, incident response, AI in cybersecurity, and security research.',
    github: 'Public profile: https://github.com/drdsecurity',
    contact: 'Verified channels: GitHub, drdsecurity.com, LinkedIn, YouTube, Instagram, and Discord.',
    status: 'SYSTEM // ONLINE\nMISSION // LEARN | RESEARCH | INVESTIGATE',
    mission: 'Building Global Cyber Resilience through Awareness, Education & Collaboration.'
  };
  const history = []; let historyIndex = -1;
  const line = (text, kind = '') => { const entry = document.createElement('p'); if (kind) entry.className = kind; entry.textContent = text; output.append(entry); output.scrollTop = output.scrollHeight; };
  form.addEventListener('submit', event => { event.preventDefault(); const command = input.value.trim().toLowerCase(); if (!command) return; line(`drdsecurity@cyber-core:~$ ${command}`, 'terminal-command'); history.unshift(command); historyIndex = -1; if (command === 'clear') { output.replaceChildren(); } else { line(responses[command] || `Unknown command: ${command}. Type help for available commands.`, 'terminal-response'); } input.value = ''; });
  input.addEventListener('keydown', event => { if (event.key === 'ArrowUp' && history.length) { event.preventDefault(); historyIndex = Math.min(historyIndex + 1, history.length - 1); input.value = history[historyIndex]; } if (event.key === 'ArrowDown' && history.length) { event.preventDefault(); historyIndex = Math.max(historyIndex - 1, -1); input.value = historyIndex < 0 ? '' : history[historyIndex]; } });
})();
