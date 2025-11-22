document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. VARIABLES DE ESTADO Y ELEMENTOS DOM ---
    let currentDir = '/';
    let userName = 'user';
    const PROMPT = 'user@portfolio-sys';
    const SPEED = 5; 
    const RESERVED_IPS = ['127.0.0.1', '192.168.1.1', '8.8.8.8'];
    const DUMMY_HOSTS = ['google.com', 'luigidelsordo.com'];

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

    const outputElement = document.getElementById('terminalOutput');
    const inputElement = document.getElementById('commandInput');
    const demoSection = document.getElementById('demonstration');
    const typingElement = document.getElementById('typingEffect');
    let initialized = false; 

    // --- 2. FUNCIONES DE BAJO NIVEL (UTILIDADES) ---

    function getPromptHTML() {
        return `<span class="prompt">${userName}@portfolio-sys:${currentDir}$</span>`;
    }

    function typeWriterEffect(element, text) {
    return new Promise(resolve => {
        let i = 0;
        element.innerHTML = ''; 
        element.classList.add('blink');
        
        function typing() {
            if (i < text.length) {
                const char = text.charAt(i);
                
                // Añadimos el carácter o el salto de línea
                element.innerHTML += char.replace(/\n/g, '<br>');
                i++;
                
                // 🛑 CORRECCIÓN: Forzar el scroll de la ventana al borde inferior del output
                // Esto es más estable que usar document.body.scrollHeight.
                window.scrollTo({
                    top: outputElement.offsetHeight + outputElement.offsetTop,
                    behavior: 'auto' 
                });
                
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
    
    // 🛑 CORRECCIÓN FINAL: Asegurar que el último elemento (el input) esté visible
    // Esto es mucho más estable que usar window.scrollTo en el bucle de typing.
    inputElement.scrollIntoView({
        behavior: 'auto', // Scroll rápido para seguir el texto
        block: 'end'      // Asegura que el input quede visible al final de la ventana
    });
}


    // --- 3. LÓGICA DE COMANDOS (COMMAND_MAP) ---

    const COMMAND_MAP = {
        'help': {
            output: `
NAME
    help - Muestra información de los comandos.

SINTAXIS
    [comando] [argumentos]

DESCRIPCIÓN
    Comandos de Archivos y Sistema:
        cd [dir]        Cambia el directorio.
        ls              Lista archivos/directorios.
        cat [archivo]   Muestra contenido.
        touch [archivo] Crea archivo vacío.
        rm [archivo]    Elimina archivo.
        clear           Limpia la pantalla.
        whoami          Muestra el usuario.
        login [user]    Inicia sesión.

    Comandos de Redes y Diagnóstico (Simulación Avanzada):
        ping [ip/host]  Chequea conectividad (simula latencia real).
        netstat         Muestra conexiones y puertos.
        ifconfig        Muestra configuración de interfaz.
        traceroute [h]  Simula traza de ruta.
        nmap [ip]       Simula escaneo de puertos.
        dig [host]      Consulta DNS.
        arp             Muestra tabla ARP.

    Comandos Avanzados:
        sudo apt [arg]  Simulación de gestor de paquetes.
        ip-lookup [ip]  Consulta API de geolocalización (Dato Real).
        date-lookup [city] - Consulta la hora en tiempo real (Real API).
        check-raid      Muestra estado de HA.
        sudo poweroff   Apagado del sistema.
`
        },
        'whoami': { output: `${userName}` },
        
        'cd': {
            logic: (args) => {
                const target = args[0];
                if (!target || target === '~') { currentDir = '/home/user'; return ''; }
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

                return `bash: cd: ${target}: No such file or directory`;
            }
        },
        'ls': {
            logic: (args) => {
                const targetDir = args[0] || currentDir;
                const node = fileSystem[targetDir];
                if (!node) return `ls: cannot access '${targetDir}': No such file or directory`;
                
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
                if (!file) return 'cat: usage: cat [file]...';
                
                if (file.toLowerCase() === 'skills.txt') return INITIAL_SKILLS_CONTENT;
                
                for (const path in fileSystem) {
                    if (fileSystem[path].files.includes(file)) {
                        switch (file.toLowerCase()) {
                            case 'readme.md': return '# [Luigi Del Sordo - Portafolio]\n\nEste portafolio es un proyecto personal que demuestra mis habilidades en Administración de Sistemas y Ciberseguridad. Todo el código fuente está disponible en mi GitHub.';
                            case 'projects.list': return `\nProyectos clave (Ver GitHub para más detalles):\n1. Proyecto 'ZeroTrust-Net': Segmentación de red y VPNs.\n2. Proyecto 'HoneyTrap': Configuración de Honeypot y análisis de logs.`;
                            case 'cv.pdf': return 'cat: cv.pdf: Is a binary file. Use a viewer.';
                            case 'profile.txt': return `Name: Luigi Del Sordo\nSpecialization: ASIR\nLanguages: ES, EN, IT\nInterest: SOC/Pentesting.`;
                            default: return `Simulated content of ${file}.`;
                        }
                    }
                }
                return `bash: cat: ${file}: No such file or directory`;
            }
        },
        'touch': {
            logic: (args) => {
                const file = args[0];
                if (!file) return 'touch: missing file operand';

                const node = fileSystem[currentDir];
                if (node && !node.files.includes(file)) {
                    node.files.push(file);
                    return '';
                }
                return `bash: touch: ${file}: File exists or Permission denied`;
            }
        },
        'rm': {
            logic: (args) => {
                const file = args[0];
                if (!file) return 'rm: missing operand';

                const node = fileSystem[currentDir];
                const index = node.files.indexOf(file);

                if (index > -1) {
                    node.files.splice(index, 1);
                    return '';
                }
                return `rm: cannot remove '${file}': No such file or directory`;
            }
        },
        
        'sudo': {
            logic: async (args) => {
                if (args[0] === 'apt' && args[1] === 'update') {
                    const output = `
Hit:1 http://security.ubuntu.com/ubuntu focal-security InRelease
Hit:2 http://es.archive.ubuntu.com/ubuntu focal InRelease
Get:3 http://es.archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]
Fetched 222 kB in 1s (150 kB/s)
Reading package lists... Done
`;
                    await new Promise(resolve => setTimeout(resolve, 1500)); 
                    return output;
                }
                if (args[0] === 'apt' && args[1] === 'install') {
                    const packageName = args[2] || 'paquete-desconocido';
                    if (INSTALLED_PACKAGES.includes(packageName)) {
                         return `Reading package lists... Done\n${packageName} is already the newest version.`;
                    }
                    const output = `
Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  ${packageName} libssl-dev
Progress: [██████████████████████████████████] 100%
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
                return `sudo: command not found`;
            }
        },

        'login': {
            logic: (args) => {
                const user = args[0] || 'luigi';
                userName = user;
                return `Login successful for user ${userName}. Prompt updated.`;
            }
        },
        
        'ip-lookup': {
            logic: async (args) => {
                const target = args[0];
                if (!target) return 'ip-lookup: missing host argument';

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
Country: ${data.country} (${data.countryCode})
Region: ${data.regionName} / ${data.city}
ISP: ${data.isp}
AS/Org: ${data.as} / ${data.org}
Timezone: ${data.timezone}
(Real Data API Call)
`
                    } else {
                        return `ip-lookup: Error resolving host: ${data.message || 'Host not found.'}`;
                    }

                } catch (error) {
                    return 'ip-lookup: CRITICAL ERROR: Check network connection or try a different IP.';
                }
            }
        },
        'date-lookup': {
            logic: async (args) => {
                const city = args[0] || 'europe/madrid';
                if (!city) return 'date-lookup: missing city argument';

                const API_URL = `http://worldtimeapi.org/api/timezone/${city}`;
                await new Promise(resolve => setTimeout(resolve, 1000));

                try {
                    const response = await fetch(API_URL);
                    
                    if (response.status === 404) { return `date-lookup: Error 404: Zone '${city}' not found.`; }
                    
                    const data = await response.json();
                    const datetime = new Date(data.datetime);
                    
                    return `
[Time Lookup: ${data.timezone}]
========================================
Date/Time: ${datetime.toLocaleDateString()} ${datetime.toLocaleTimeString()}
UTC Code: ${data.utc_offset}
(Real Data API Call)
`;

                } catch (error) {
                    return 'date-lookup: CRITICAL ERROR: Could not connect to external service.';
                }
            }
        },
        'ping': {
            logic: (args) => {
                const target = args[0];
                if (!target) return 'ping: usage error: destination address required';

                if (RESERVED_IPS.includes(target) || DUMMY_HOSTS.includes(target)) {
                    return `
PING ${target} (${target}): 56 data bytes
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.100 ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.090 ms
64 bytes from ${target}: icmp_seq=3 ttl=64 time=0.112 ms
--- ${target} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2002ms
`;
                } else {
                    return `
PING ${target} (${target}): 56 data bytes
Request timeout for icmp_seq 1
Request timeout for icmp_seq 2
Request timeout for icmp_seq 3
--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss
`;
                }
            }
        },
        
            'traceroute': { 
                logic: (args) => { const target = args[0] || 'google.com'; return `traceroute to ${target} (${target}), 30 hops max\n 1  router (192.168.1.1)  0.450 ms\n 2  isp-fw (10.0.0.1)  5.120 ms\n 3  core-router-a (1.2.3.4)  12.300 ms\n 4  * * * (Timeout, Router/Firewall ACL simulation)\n 5  target-network (${target})  35.120 ms`; 
                                 } },
            
            'nmap': { 
                logic: (args) => { const target = args[0]; if (!target) return 'nmap: missing host argument'; return `Nmap scan report for ${target} (Simulated 3s delay)\nHost is up.\nPORT      STATE SERVICE\n22/tcp    filtered ssh (Firewall)\n443/tcp   open    https (Cifrado requerido)\n53/tcp    open    domain (DNS Server)`; 
                                 } },
            
            'dig': { 
                logic: (args) => { const target = args[0] || 'google.com'; return `; <<>> DiG 9.10.3-P4 <<>> ${target}\n;; ANSWER SECTION:\n${target}. 300 IN A 142.250.78.14\n;; AUTHORITY SECTION:\ngoogle.com. 172800 IN NS ns1.google.com.`; 
                                 } },
           
            'netstat': { 
                output: `Proto Local Address           Foreign Address         State\nTCP   0.0.0.0:443             0.0.0.0:* LISTEN (WEB/VPN)\nTCP   127.0.0.1:8080          0.0.0.0:* LISTEN (SIEM agent)` 
            },
           
            'ifconfig': { 
                output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.10/24  broadcast 192.168.1.255\n        ether 00:1a:2b:3c:4d:5e  txqueuelen 1000  (Ethernet)` 
            },
            
            'check-raid': { 
                output: `[RAID Status Check - Alta Disponibilidad]\nArray: RAID1-DATA (md0)\nStatus: **CLEAN**\nDisks: 2/2 (sda1, sdb1)\nCapacity: 2TB` 
            },
           
            'clear': {
            logic: () => {
                // 1. Limpia el contenido de la consola
                outputElement.innerHTML = '';
                
                // 2. 🛑 CORRECCIÓN: Usar window.scrollTo para un desplazamiento INSTANTÁNEO 🛑
                //    Esto es más fiable que scrollIntoView para asegurar que el header fijo (que tiene margin-top) no interfiera.
                window.scrollTo(0, document.getElementById('demonstration').offsetTop - 80);
                
                // 3. Reinicia la secuencia de bienvenida
                inputElement.disabled = true;
                initialLoadSequence();
                
                return null;
                }
            }
        
    };
    
    // --- 4. FUNCIÓN PRINCIPAL DE PROCESAMIENTO (handleCommand) ---
    async function handleCommand(commandLine) {
        if (!commandLine) return;

        const timestamp = new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        // auditLog.push(`[${timestamp}] ${userName}@portfolio: ${commandLine}`); 
        
        outputElement.innerHTML += `<p>${getPromptHTML()} <span class="input">${commandLine}</span></p>`;

        const parts = commandLine.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        const cmdHandler = COMMAND_MAP[command];
        let output = '';
        let latency = 500; 
        let skipOutput = false;
        let outputIsHTML = false; 

        if (command === 'clear') { 
            cmdHandler.logic();
            return;
        }

        if (command === 'sudo') {
             output = await cmdHandler.logic(args);
             latency = 100;
        } else if (cmdHandler) { 
            
            if (command === 'ls') outputIsHTML = true; 
            
            if (cmdHandler.logic) {
                 if (['ping', 'nmap', 'traceroute', 'ip-lookup', 'date-lookup'].includes(command)) latency = 2500;
                 if (['cd', 'rm', 'touch', 'login'].includes(command)) skipOutput = true; 
                 output = await cmdHandler.logic(args); 
            } else if (cmdHandler.output) {
                 output = cmdHandler.output;
            }
        } else { 
            // COMANDO NO ENCONTRADO
            const errorOutput = `<p class="output"><span style="color: #ff5f56;">bash: ${command} command not found</span></p>`;
            
            outputElement.innerHTML += errorOutput;
            appendNewPrompt();
            inputElement.focus();
            return;
        }

        // --- LÓGICA DE SALIDA ---

        if (skipOutput && !output) {
            appendNewPrompt();
            inputElement.focus();
            return;
        }

        await new Promise(resolve => setTimeout(resolve, latency));
        
        const outputP = document.createElement('p');
        outputP.classList.add('output');
        outputElement.appendChild(outputP);
        
        if (outputIsHTML) {
            outputP.innerHTML = output;
        } else {
            await typeWriterEffect(outputP, output.trim());
        }

        appendNewPrompt();
        inputElement.focus();
    }
    
    // --- 5. SECUENCIA DE CARGA INICIAL (initialLoadSequence) ---
    
    async function initialLoadSequence() {
        const initialCommandP = document.createElement('p');
        initialCommandP.innerHTML = `${getPromptHTML()} <span class="input">cat skills.txt</span>`;
        outputElement.appendChild(initialCommandP);

        const outputP = document.createElement('p');
        outputP.classList.add('output');
        outputElement.appendChild(outputP);
        
        await typeWriterEffect(outputP, INITIAL_SKILLS_CONTENT.trim());

        const helpMessageP = document.createElement('p');
        helpMessageP.innerHTML = "Escribe 'help' para ver los comandos disponibles";
        outputElement.appendChild(helpMessageP);
        
        appendNewPrompt();

        inputElement.disabled = false;
    }

    // --- 6. FUNCIÓN MOUSEOVER (initializeConsole) ---
    
    function initializeConsole() {
        if (initialized) return;
        initialized = true;

        if (typingElement) typingElement.classList.remove('blink');

        inputElement.disabled = true;
        initialLoadSequence();

        demoSection.removeEventListener('mouseover', initializeConsole);
    }
    
    // --- 7. INICIALIZACIÓN (LISTENERS Y ACTIVACIÓN) ---
    
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
