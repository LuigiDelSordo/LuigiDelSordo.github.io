document.addEventListener('DOMContentLoaded', () => {
    
    // --- VARIABLES DE ESTADO ---
    let currentDir = '/';
    let userName = 'user';
    const PROMPT = 'user@portfolio-sys';
    const SPEED = 10; 

    // --- SISTEMA DE ARCHIVOS VIRTUAL ---
    const fileSystem = {
        '/': { files: ['readme.md', 'projects.list'], dirs: ['bin', 'sys', 'home', 'etc'] },
        '/sys': { files: [], dirs: ['net', 'security'] },
        '/sys/security': { files: ['fw.conf', 'siem_status.log'], dirs: ['honeypot'] },
        '/etc': { files: ['hosts', 'network.cfg', 'sudoers'], dirs: [] },
        '/home': { files: ['cv.pdf', 'profile.txt'], dirs: [userName] },
        '/home/user': { files: [], dirs: [] }
    };

    const INSTALLED_PACKAGES = ['python3', 'git', 'nginx', 'mariadb-server'];
    const auditLog = []; 

    // Mensaje que aparece en el efecto de máquina de escribir
    const INITIAL_SKILLS_CONTENT = `
==================================================
LISTADO DE HABILIDADES (cat skills.txt)
==================================================
[ASIR CORE]
- SO: Windows Server, Ubuntu, AlmaLinux
- Virtualización: Proxmox, VMWare, VirtualBox
- Redes: VLAN, Routing, Switching, Firewall

[CYBER FOCUS]
- Herramientas: SIEM, Honeypot (simulación), WireShark, Nmap
- Seguridad: VPN (WireGuard), Hardening, Criptografía
- Rol: Aspirante a Analista SOC / Pentesting

[DEV/DATA]
- Scripting: PowerShell, bash
- Bases de Datos: MariaDB (CLI), PhpMyAdmin
- Web: HTML, CSS, JavaScript, PHP
`;

    // --- ELEMENTOS DEL DOM ---
    const outputElement = document.getElementById('terminalOutput');
    const inputElement = document.getElementById('commandInput');
    const demoSection = document.getElementById('demonstration');
    const typingElement = document.getElementById('typingEffect');
    let initialized = false; 

    // --- FUNCIONES DE UTILIDAD ---

    function getPromptHTML() {
        return `<span class="prompt">${userName}@portfolio-sys:${currentDir}$</span>`;
    }

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
        outputElement.innerHTML += `<p>${getPromptHTML()} <span class="input"></span></p>`;
        outputElement.scrollTop = outputElement.scrollHeight;
    }

    // --- LÓGICA DE COMANDOS ---

    const COMMAND_MAP = {
        'help': {
            output: `
NAME
    help - Muestra información de los comandos.

SINTAXIS
    help [comando]

DESCRIPCIÓN
    Comandos de Navegación y Archivos (Simulación de Linux):
        cd [dir]        - Cambia el directorio actual. Usa '..' para subir.
        ls              - Lista archivos y directorios en la ubicación actual.
        cat [archivo]   - Muestra el contenido de un archivo.
        touch [archivo] - Crea un nuevo archivo vacío (simulado).
        rm [archivo]    - Elimina un archivo (simulado).

    Comandos de Sistema y Redes (Demostración de Habilidades ASIR):
        sudo apt [arg]  - Simulación de gestor de paquetes (update/install).
        whoami          - Muestra el usuario actual.
        login [user]    - Inicia sesión como otro usuario (simulado).
        ip-lookup [ip]  - Consulta la geolocalización (Real API).
        date-lookup [city] - Consulta la hora en tiempo real de una ciudad (Real API).
        ping [host]     - Simula el chequeo de conectividad de red.
        netstat         - Muestra conexiones de red activas.
        nmap [ip]       - Simula un escaneo de puertos (Demostración de filtros Firewall).
        check-raid      - Muestra el estado del sistema de Alta Disponibilidad (RAID).
        clear           - Limpia la pantalla.
        sudo poweroff   - Easter Egg: inicia la secuencia de apagado.
`
        },
        'whoami': { output: `${userName} (ASIR, IT Junior, Ciber-Aspirante)` },
        
        // --- Comandos de Sistema de Archivos ---
        'cd': {
            logic: (args) => {
                const target = args[0];
                if (!target || target === '~') {
                    currentDir = '/home/user';
                    return '';
                }
                if (target === '.') return '';
                
                const oldDir = currentDir;
                let newDir = '';

                if (target === '..') {
                    const parts = currentDir.split('/').filter(p => p.length > 0);
                    parts.pop();
                    currentDir = '/' + parts.join('/');
                    if (currentDir === '') currentDir = '/';
                    return '';
                }

                if (target.startsWith('/')) {
                    newDir = target;
                } else {
                    newDir = currentDir.endsWith('/') ? currentDir + target : currentDir + '/' + target;
                }

                if (fileSystem[newDir] && fileSystem[newDir].dirs !== undefined) {
                    currentDir = newDir;
                    return '';
                }

                return `bash: cd: ${target}: No existe el directorio o permiso denegado`;
            }
        },
        'ls': {
            logic: (args) => {
                const targetDir = args[0] || currentDir;
                const node = fileSystem[targetDir];
                if (!node) return `ls: No se puede acceder al directorio '${targetDir}'.`;
                
                let output = '';
                if (node.dirs.length > 0) {
                    output += node.dirs.map(d => `<span style="color: #61afef;">${d}/</span>`).join(' ');
                }
                if (node.files.length > 0) {
                    output += (output.length > 0 ? ' ' : '') + node.files.join(' ');
                }
                return output || '';
            }
        },
        'cat': { 
            logic: (args) => {
                const file = args[0];
                if (!file) return 'Error: Faltó el argumento [file]. Uso: cat [file]';
                
                if (file.toLowerCase() === 'skills.txt') return INITIAL_SKILLS_CONTENT;
                
                for (const path in fileSystem) {
                    if (fileSystem[path].files.includes(file)) {
                        switch (file.toLowerCase()) {
                            case 'readme.md': return '# [Luigi Del Sordo - Portafolio]\n\nEste portafolio es un proyecto personal que demuestra mis habilidades en Administración de Sistemas y Ciberseguridad. Todo el código fuente está disponible en mi GitHub.';
                            case 'projects.list': return `\nProyectos clave (Ver GitHub para más detalles):\n1. Proyecto 'ZeroTrust-Net': Segmentación de red y VPNs.\n2. Proyecto 'HoneyTrap': Configuración de Honeypot y análisis de logs.`;
                            case 'cv.pdf': return 'Error: Archivo binario. Use un visor.';
                            case 'profile.txt': return `Nombre: Luigi Del Sordo\nEspecialización: ASIR\nIdiomas: ES, EN, IT\nInterés: SOC/Pentesting.`;
                            default: return `Contenido simulado de ${file}.`;
                        }
                    }
                }
                
                return `bash: cat: ${file}: No existe el archivo o permiso denegado.`;
            }
        },
        'touch': {
            logic: (args) => {
                const file = args[0];
                if (!file) return 'Error: Faltó el argumento [file]. Uso: touch [file]';

                const node = fileSystem[currentDir];
                if (node && !node.files.includes(file)) {
                    node.files.push(file);
                    return '';
                }
                return `bash: touch: ${file}: El archivo ya existe o permiso denegado.`;
            }
        },
        'rm': {
            logic: (args) => {
                const file = args[0];
                if (!file) return 'Error: Faltó el argumento [file]. Uso: rm [file]';

                const node = fileSystem[currentDir];
                const index = node.files.indexOf(file);

                if (index > -1) {
                    node.files.splice(index, 1);
                    return '';
                }
                return `bash: rm: ${file}: No existe el archivo.`;
            }
        },
        
        // --- Comandos de Instalación/Actualización (Simulación) ---
        'sudo': {
            logic: async (args) => {
                if (args[0] === 'apt' && args[1] === 'update') {
                    const output = `
Hit:1 http://security.ubuntu.com/ubuntu focal-security InRelease
Hit:2 http://es.archive.ubuntu.com/ubuntu focal InRelease
Get:3 http://es.archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]
Get:4 http://es.archive.ubuntu.com/ubuntu focal-backports InRelease [108 kB]
Fetched 222 kB in 1s (150 kB/s)
Reading package lists... Done
`;
                    await new Promise(resolve => setTimeout(resolve, 1500)); 
                    return output;
                }
                if (args[0] === 'apt' && args[1] === 'install') {
                    const packageName = args[2] || 'paquete-desconocido';
                    if (INSTALLED_PACKAGES.includes(packageName)) {
                         return `${packageName} ya está en su versión más reciente.`;
                    }
                    const output = `
Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  ${packageName} libssl-dev libevent-2.1
Need to get 15.5 MB of archives.
Get:1 http://es.archive.ubuntu.com/ubuntu/pool/main/d/${packageName} ${packageName}_1.0_amd64.deb [2.5 MB]
Progress: [██████████████████████████████████] 100%
Selecting previously unselected package ${packageName}.
(Reading database ... 2500 files and directories currently installed.)
Preparing to unpack .../${packageName}_1.0_amd64.deb ...
Unpacking ${packageName} (1.0) ...
Setting up ${packageName} (1.0) ...
Processing triggers for man-db (2.9.1-1) ...
`;
                    if (packageName !== 'paquete-desconocido') {
                        INSTALLED_PACKAGES.push(packageName);
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return output;
                }
                if (args[0] === 'poweroff') {
                    return `
*** SYSTEM SHUTDOWN INITIATED ***
  
        __  __ 
       |  \\/  |
       | \\  / |
       | |\\/| |
       | |  | |
       |_|  |_|
  
Simulación terminada. Escribe 'clear' para reiniciar.`;
                }
                return `bash: sudo: ${args.join(' ')}: Comando no reconocido o permisos insuficientes.`;
            }
        },

        // --- Comandos de Ciberseguridad/Redes (Simulados y API) ---
        'login': {
            logic: (args) => {
                const user = args[0] || 'luigi';
                userName = user;
                return `Login successful. Session initiated for user ${userName}. (Prompt actualizado)`;
            }
        },
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
Proveedor: ${data.isp}
AS/Org: ${data.as} / ${data.org}
Timezone: ${data.timezone}
`
                    } else {
                        return `Error en la consulta: ${data.message || 'No se pudo resolver la IP/dominio.'}`;
                    }

                } catch (error) {
                    return `CRITICAL ERROR: No se pudo establecer conexión con el servidor DNS/API.`;
                }
            }
        },
        'date-lookup': {
            logic: async (args) => {
                const city = args[0] || 'europe/madrid';
                if (!city) return 'Error: Faltó el argumento [city]. Uso: date-lookup [region/city]';

                const API_URL = `http://worldtimeapi.org/api/timezone/${city}`;
                await new Promise(resolve => setTimeout(resolve, 1000));

                try {
                    const response = await fetch(API_URL);
                    
                    if (response.status === 404) {
                         return `Error 404: Zona horaria '${city}' no encontrada.`;
                    }
                    
                    const data = await response.json();
                    const datetime = new Date(data.datetime);
                    
                    return `
[Time Lookup: ${data.timezone}]
========================================
Fecha/Hora: ${datetime.toLocaleDateString()} ${datetime.toLocaleTimeString()}
Código UTC: ${data.utc_offset}
Día de la semana: ${data.day_of_week}
(Consulta API de hora en tiempo real)
`;

                } catch (error) {
                    return `CRITICAL ERROR: No se pudo conectar a la API de tiempo global.`;
                }
            }
        },
        'ping': {
            logic: (args) => {
                const target = args[0] || 'localhost';
                return `
PING ${target} (${target}): 56 data bytes
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.100 ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.090 ms
64 bytes from ${target}: icmp_seq=3 ttl=64 time=0.112 ms
--- ${target} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2002ms
`;
            }
        },
        'traceroute': {
            logic: (args) => {
                const target = args[0] || 'google.com';
                return `
traceroute to ${target} (${target}), 30 hops max, 60 byte packets
 1  router (192.168.1.1)  0.450 ms  0.500 ms  0.620 ms
 2  isp-fw (10.0.0.1)  5.120 ms  5.230 ms  5.300 ms
 3  core-router-a (1.2.3.4)  12.300 ms  12.400 ms  12.500 ms
 4  * * * (Timeout, Firewall/ACL simulation)
 5  target-network (${target})  35.120 ms  35.200 ms  35.300 ms
`;
            }
        },
        'netstat': {
            output: `
Proto Local Address           Foreign Address         State
TCP   0.0.0.0:443             0.0.0.0:* LISTEN (WEB/VPN)
TCP   127.0.0.1:8080          0.0.0.0:* LISTEN (SIEM agent)
UDP   10.0.1.1:51820          0.0.0.0:* LISTEN (WireGuard VPN)
`
        },
        'arp': {
            output: `
Address                  HWtype  HWaddress           Flags Mask  Iface
192.168.1.1              ether   a0:b1:c2:d3:e4:f5   C     eth0
192.168.1.100            ether   00:1a:2b:3c:4d:5e   C     eth0
`
        },
        'dig': {
            logic: (args) => {
                const target = args[0] || 'google.com';
                return `
; <<>> DiG 9.10.3-P4 <<>> ${target}
;; ANSWER SECTION:
${target}. 300 IN A 142.250.78.14
;; AUTHORITY SECTION:
google.com. 172800 IN NS ns1.google.com.
`;
            }
        },
        'nmap': {
            logic: (args) => {
                const target = args[0];
                if (!target) return 'Error: Faltó el argumento [target]. Uso: nmap -sV 192.168.1.1';
                return `
Simulando Nmap -sV en ${target} (Retraso de 3s)...
Host is up.
PORT      STATE SERVICE
22/tcp    filtered ssh (Firewall)
80/tcp    closed  http
443/tcp   open    https (Cifrado requerido)
53/tcp    open    domain (DNS Server)
`;
            }
        },
        'nslookup': {
            logic: (args) => {
                const target = args[0] || 'luigidelsordo.com';
                return `
Server:  127.0.0.53
Address: 127.0.0.53#53
Non-authoritative answer:
Name: ${target}
Address: 198.51.100.25 (Simulado)
`;
            }
        },
        'route': {
            output: `
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Iface
default         192.168.1.1     0.0.0.0         UG    100    eth0
10.0.0.0        0.0.0.0         255.0.0.0       U     0      eth1 (VPN)
`
        },
        'ifconfig': {
            output: `
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.10/24  broadcast 192.168.1.255
        ether 00:1a:2b:3c:4d:5e  txqueuelen 1000  (Ethernet)
lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  mask 255.0.0.0
`
        },
        'check-raid': {
            output: `
[RAID Status Check - Alta Disponibilidad]
Array: RAID1-DATA (md0)
Status: **CLEAN**
Disks: 2/2 (sda1, sdb1)
Capacity: 2TB
`
        },
        'clear': {
            logic: () => {
                outputElement.innerHTML = '';
                inputElement.disabled = true;
                initialLoadSequence();
                inputElement.disabled = false;
                return null;
            }
        }
    };

    // --- FUNCIÓN PRINCIPAL DE MANEJO DE COMANDOS ---

    async function handleCommand(commandLine) {
        if (!commandLine) return;

        const timestamp = new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        auditLog.push(`[${timestamp}] ${userName}@portfolio: ${commandLine}`);
        
        outputElement.innerHTML += `<p>${getPromptHTML()} <span class="input">${commandLine}</span></p>`;

        const parts = commandLine.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        const cmdHandler = COMMAND_MAP[command];
        let output = '';
        let latency = 500; 
        let skipOutput = false;

        if (command === 'clear') { 
            cmdHandler.logic();
            return;
        }

        if (command === 'sudo') {
             output = await cmdHandler.logic(args);
             latency = 100;
        } else if (cmdHandler) {
            if (cmdHandler.logic) {
                if (command === 'ip-lookup' || command === 'nmap') latency = 2500;
                if (['cd', 'rm', 'touch', 'login'].includes(command)) skipOutput = true; 
                output = await cmdHandler.logic(args); 
            } else if (cmdHandler.output) {
                output = cmdHandler.output;
            }
        } else {
            output = `<span style="color: #ff5f56;">bash: ${command}: command not found</span>`;
        }

        if (skipOutput && !output) {
            appendNewPrompt();
            inputElement.focus();
            return;
        }

        await new Promise(resolve => setTimeout(resolve, latency));
        
        const outputP = document.createElement('p');
        outputP.classList.add('output');
        outputElement.appendChild(outputP);
        
        await typeWriterEffect(outputP, output.trim());

        appendNewPrompt();
        inputElement.focus();
    }

    // --- SECUENCIA DE CARGA INICIAL (Activación por mouseover) ---
    
    async function initialLoadSequence() {
        // 1. Mostrar el prompt con el comando "cat skills.txt"
        const initialCommandP = document.createElement('p');
        initialCommandP.innerHTML = `${getPromptHTML()} <span class="input" id="initialInput">cat skills.txt</span>`;
        outputElement.appendChild(initialCommandP);

        // 2. Ejecutar el efecto de máquina de escribir con las habilidades (el contenido que te gustaba)
        const outputP = document.createElement('p');
        outputP.classList.add('output');
        outputElement.appendChild(outputP);
        
        await typeWriterEffect(outputP, INITIAL_SKILLS_CONTENT.trim());

        // 3. 🛑 Restaurar el mensaje de help después de escribir las habilidades
        const helpMessageP = document.createElement('p');
        helpMessageP.innerHTML = "Escribe 'help' para ver los comandos disponibles";
        outputElement.appendChild(helpMessageP);
        
        appendNewPrompt();
        // inputElement.focus(); <--- ELIMINADO PARA EVITAR EL TECLADO EN MÓVIL
    }

    function initializeConsole() {
        if (initialized) return; 
        initialized = true;

        const typingElement = document.getElementById('typingEffect');
        if (typingElement) typingElement.classList.remove('blink');

        inputElement.disabled = true; 
        initialLoadSequence();

        demoSection.removeEventListener('mouseover', initializeConsole);
    }
    
    // --- INICIALIZACIÓN ---
    demoSection.addEventListener('mouseover', initializeConsole);

    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !inputElement.disabled) {
            const commandLine = inputElement.value.trim();
            inputElement.value = ''; 
            handleCommand(commandLine);
        }
    });

    inputElement.disabled = true; 
});
