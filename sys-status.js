document.addEventListener('DOMContentLoaded', () => {
    const outputElement = document.getElementById('terminalOutput');
    const inputElement = document.getElementById('commandInput');
    const typingElement = document.getElementById('typingEffect');
    
    const PROMPT = 'user@portfolio-sys:~$';
    const PROMPT_HTML = `<span class="prompt">${PROMPT}</span>`;
    const SPEED = 10; // Velocidad de escritura (milisegundos)
    
    // Contenido inicial adaptado a tu HTML
    const INITIAL_LOAD = `
==================================================
// HABILIDADES PRINCIPALES (cat skills.txt)
==================================================
[ASIR CORE]
- SO: Windows Server, Ubuntu, AlmaLinux
- Virtualización: Proxmox, VMWare, VirtualBox
- Cloud: AWS, OCI

[CYBER FOCUS]
- Redes: VLAN, Routing, Switching, Cisco Packet Tracer, OSI Layer 
- Seguridad: Firewall, VPN (WireGuard), SIEM/Honeypot, Criptografía
- Análisis: Wireshark (Patrones de tráfico)

[DEV/DATA]
- Scripting: PowerShell, bash
- Bases de Datos: MariaDB (CLI), PhpMyAdmin
- Web: HTML, CSS, JavaScript, PHP
`;

    // Tabla de comandos avanzados con descripciones y lógica
    const COMMAND_MAP = {
        'help': {
            description: 'Muestra esta lista de comandos.',
            output: `
Comandos disponibles:
  > help                ${'Muestra esta lista de comandos.'}
  > clear               Limpia la pantalla de la consola.
  > whoami              Identidad del usuario actual del sistema.
  > ls [dir]            Lista archivos en un directorio simulado. Ej: ls /sys
  > cat [file]          Muestra el contenido de un archivo simulado. Ej: cat skills.txt
  > netstat             Muestra conexiones de red simuladas.
  > ip-lookup [ip/dom]  Consulta información pública de geolocalización de una IP/Dominio.
  > check-raid          Simulación de chequeo de estado de RAID (Alta Disponibilidad).
  > sudo poweroff       ¡Cuidado! (Easter Egg)`
        },
        'whoami': { output: 'luigi-del-sordo (ASIR, IT Junior, Ciber-Aspirante)' },
        'cat': { 
            logic: (args) => {
                const file = args[0];
                if (!file) return 'Error: Faltó el argumento [file]. Uso: cat [file]';
                
                switch (file.toLowerCase()) {
                    case 'skills.txt': return INITIAL_LOAD;
                    case 'readme.md': return '# [Luigi Del Sordo - Portafolio]\n\nEste portafolio es un proyecto personal que demuestra mis habilidades en Administración de Sistemas y Ciberseguridad. Todo el código fuente está disponible en mi GitHub.';
                    case 'projects.list': return `
Proyectos clave (Ver GitHub para más detalles):
1. Proyecto 'ZeroTrust-Net': Segmentación de red y VPNs.
2. Proyecto 'HoneyTrap': Configuración de Honeypot y análisis de logs.
3. Proyecto 'HA-Storage': Configuración de RAID y estrategias de Backups (Criptografía).`;
                    default: return `Error: Archivo '${file}' no encontrado en el sistema simulado.`;
                }
            }
        },
        'ls': {
            logic: (args) => {
                const dir = args[0] || '/';
                switch (dir.toLowerCase()) {
                    case '/': return 'bin/ sys/ home/ etc/ readme.md projects.list';
                    case '/sys': return 'proxmox/ net/ security/';
                    case '/sys/security': return 'fw.conf logs/ siem_status.log';
                    case '/etc': return 'hosts network.cfg sudoers';
                    default: return `Error: Directorio '${dir}' no encontrado.`;
                }
            }
        },
        'netstat': { 
            output: `
Active Internet connections (simulated - Hardened System):
Proto Local Address           Foreign Address         State
TCP   0.0.0.0:443             0.0.0.0:* LISTEN (Encrypted Web/VPN)
TCP   127.0.0.1:8080          0.0.0.0:* LISTEN (SIEM Agent)
UDP   10.0.1.1:51820          0.0.0.0:* LISTEN (WireGuard VPN)
`
        },
        // COMANDO AVANZADO CON API REAL
        'ip-lookup': {
            logic: async (args) => {
                const target = args[0];
                if (!target) return 'Error: Faltó el argumento [IP/Domain]. Uso: ip-lookup [dominio]';

                const API_URL = `http://ip-api.com/json/${target}`;
                
                await new Promise(resolve => setTimeout(resolve, 1500)); 

                try {
                    const response = await fetch(API_URL);
                    const data = await response.json();

                    if (data.status === 'success') {
                        return `
[IP Lookup: ${data.query}]
========================================
Status: ${data.status.toUpperCase()}
País: ${data.country} (${data.countryCode})
Región: ${data.regionName} / ${data.city}
Lat/Lon: ${data.lat}, ${data.lon}
Proveedor: ${data.isp}
AS/Org: ${data.as} / ${data.org}
Timezone: ${data.timezone}

(Información obtenida de ip-api.com)`
                    } else {
                        return `<span style="color: #ffbd2e;">Error en la consulta:</span> ${data.message || 'No se pudo resolver la IP/dominio.'}`;
                    }

                } catch (error) {
                    console.error("Error al consultar API:", error);
                    return `<span style="color: #ff5f56;">CRITICAL ERROR:</span> No se pudo establecer conexión con el servidor DNS/API.`;
                }
            }
        },
        'check-raid': {
            output: `
[RAID Status Check - Alta Disponibilidad]
Array: RAID1-DATA (md0)
Status: **CLEAN**
Disks: 2/2 (sda1, sdb1)
Last Sync: Mon Nov 17 08:30:00 2025
Capacity: 2TB
`
        },
        'sudo': { 
            logic: (args) => {
                if (args[0] === 'poweroff') {
                    // Easter Egg
                    return `
    *** SYSTEM SHUTDOWN INITIATED ***
  
        __  __ 
       |  \\/  |
       | \\  / |
       | |\\/| |
       | |  | |
       |_|  |_|
  
    Simulación terminada. Presiona 'clear' para reiniciar.
    (Pista: Demostración de privilegios ASIR/Hardening)`;
                }
                return 'sudo: Comando no reconocido o permisos insuficientes.';
            }
        }
    };

    // --- Funciones de Utilidad ---

    function typeWriterEffect(element, text) {
        return new Promise(resolve => {
            let i = 0;
            element.classList.add('blink');
            
            function typing() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i).replace(/\n/g, '<br>');
                    i++;
                    setTimeout(typing, SPEED);
                } else {
                    element.classList.remove('blink');
                    resolve();
                }
            }
            typing();
        });
    }

    function appendNewPrompt() {
        outputElement.innerHTML += `<p>${PROMPT_HTML} <span class="input"></span></p>`;
        outputElement.scrollTop = outputElement.scrollHeight;
    }

    async function handleCommand(commandLine) {
        if (!commandLine) return;

        outputElement.innerHTML += `<p>${PROMPT_HTML} <span class="input">${commandLine}</span></p>`;

        const parts = commandLine.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        if (command === 'clear') { 
            outputElement.innerHTML = '';
            inputElement.disabled = true;
            await initialLoadSequence();
            inputElement.disabled = false;
            return;
        }

        const cmdHandler = COMMAND_MAP[command];
        let output = '';
        let latency = 500; 

        if (cmdHandler) {
            if (cmdHandler.logic) {
                // Comando asíncrono (API o lógica compleja)
                output = await cmdHandler.logic(args); 
            } 
            else if (cmdHandler.output) {
                output = cmdHandler.output;
            }
        } else {
            output = `<span style="color: #ff5f56;">bash: ${command}: command not found.</span> Escribe 'help' para ver la lista de comandos.`;
        }

        await new Promise(resolve => setTimeout(resolve, latency));
        
        const outputP = document.createElement('p');
        outputP.classList.add('output');
        outputElement.appendChild(outputP);
        
        await typeWriterEffect(outputP, output.trim());

        appendNewPrompt();
        inputElement.focus();
    }
    
    async function initialLoadSequence() {
        const initialP = document.createElement('p');
        initialP.innerHTML = `${PROMPT_HTML} <span class="input" id="initialInput">cat skills.txt</span>`;
        outputElement.appendChild(initialP);

        typingElement.innerHTML = '';

        await typeWriterEffect(typingElement, INITIAL_LOAD.trim());
        appendNewPrompt();
        inputElement.focus();
    }

    // --- Inicialización ---
    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !inputElement.disabled) {
            const commandLine = inputElement.value.trim();
            inputElement.value = ''; 
            handleCommand(commandLine);
        }
    });

    inputElement.disabled = true; 
    initialLoadSequence().then(() => {
        inputElement.disabled = false;
        inputElement.focus();
    });
});
