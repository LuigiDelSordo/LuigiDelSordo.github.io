document.addEventListener('DOMContentLoaded', () => {
    const outputElement = document.getElementById('terminalOutput');
    const inputElement = document.getElementById('commandInput');
    const typingElement = document.getElementById('typingEffect');
    const initialInput = document.getElementById('initialInput');

    const SKILLS_TEXT = `
==================================================
// HABILIDADES PRINCIPALES (cat skills.txt)
==================================================
[ASIR CORE]
- Administrador de SO: Windows Server, Ubuntu Server, Linux
- Virtualización: Proxmox, VMWare
- Redes: VLAN, Routing, Switching, Firewall (iptables/ufw)

[CYBER FOCUS]
- Herramientas: SIEM, Honeypot (simulación), WireShark
- OS: Kali Linux
- Seguridad de Redes: VPN (WireGuard), Hardening de SO

[DEV / CLOUD]
- Scripting: PowerShell, bash (automatización)
- Cloud: AWS Cloud, OCI (Conocimiento básico/práctico)
`;

    // 1. Efecto de "typing" para la carga inicial
    let i = 0;
    const speed = 15; // Velocidad de escritura
    const textToType = SKILLS_TEXT.trim();

    function typeWriter() {
        if (i < textToType.length) {
            typingElement.innerHTML += textToType.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        } else {
            typingElement.classList.remove('blink');
            inputElement.focus();
        }
    }

    // Retrasar el inicio del efecto de tipeo para simular la carga
    setTimeout(() => {
        typeWriter();
    }, 500);


    // 2. Manejo de comandos simulados
    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = inputElement.value.trim();
            handleCommand(command);
            inputElement.value = '';
        }
    });

    const commands = {
        'help': 'Comandos disponibles: **netstat**, **ls /sys**, **cat skills.txt**, **clear**.',
        'cat skills.txt': SKILLS_TEXT,
        'ls /sys': `
[VIRT]   /sys/proxmox/clusters/
[NET]    /sys/net/interfaces/eth0: up
[SECURITY] /sys/security/rules/fw.conf: ACTIVE
`,
        'netstat': `
Active Internet connections (simulated):
Proto Local Address           Foreign Address         State
TCP   0.0.0.0:443             0.0.0.0:* LISTEN (WEB/VPN)
TCP   127.0.0.1:8080          0.0.0.0:* LISTEN (SIEM agent)
UDP   10.0.1.1:51820          0.0.0.0:* LISTEN (WireGuard VPN)
`,
        'clear': () => {
            // Elimina todos los elementos excepto el div que contiene el input
            const body = document.querySelector('.terminal-body');
            body.innerHTML = '';
            // Volver a mostrar el prompt de la carga inicial
            body.innerHTML = `<p><span class="prompt">user@portfolio-sys:~$</span> <span class="input">cat skills.txt</span></p>
                              <p class="output">${SKILLS_TEXT}</p>`;
            return null; // No retorna texto, la función clear lo maneja
        }
    };

    function handleCommand(command) {
        if (!command) return;

        // Añadir el comando al historial
        outputElement.innerHTML += `<p><span class="prompt">user@portfolio-sys:~$</span> <span class="input">${command}</span></p>`;

        const responseFunc = commands[command.toLowerCase()];
        
        if (typeof responseFunc === 'function') {
            responseFunc(); // Ejecuta la función (ej: 'clear')
        } else if (responseFunc) {
            // Muestra la respuesta del comando
            outputElement.innerHTML += `<p class="output">${responseFunc}</p>`;
        } else {
            // Comando no encontrado
            outputElement.innerHTML += `<p class="output" style="color: #ff5f56;">bash: ${command}: command not found</p>`;
        }
        
        // Desplazarse hasta el final para que se vea la última línea
        outputElement.scrollTop = outputElement.scrollHeight;
    }
});
