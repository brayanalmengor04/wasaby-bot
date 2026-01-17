<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./src/assets/github/avatar/avatar-wasabi.png">
  <source media="(prefers-color-scheme: light)" srcset="./src/assets/github/avatar/avatar-wasabi.png">
  <img alt="Wasaby Bot" src="./src/assets/github/avatar/avatar-wasabi.png" width="180" height="180" style="border-radius: 50%; box-shadow: 0 8px 32px rgba(88, 101, 242, 0.3);">
</picture>

# � WASABY BOT

<p align="center">
  <b>Tu compañero definitivo para Discord</b><br>
  Música de alta calidad • Herramientas poderosas • Experiencia premium
</p>

<br>

[![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Lavalink](https://img.shields.io/badge/Lavalink-4.0-FB542B?style=for-the-badge&logo=soundcloud&logoColor=white)](https://lavalink.dev)

<br>

![Version](https://img.shields.io/badge/version-1.0.0-00D9FF?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-FFD700?style=flat-square)
![Status](https://img.shields.io/badge/status-active-00E676?style=flat-square)
![Repo Size](https://img.shields.io/github/repo-size/brayanalmengor04/wasaby-bot?style=flat-square&color=FF6B9D)

<br>

<p align="center">
  <a href="#-acerca-del-proyecto">Acerca de</a> •
  <a href="#-características">✨ Características</a> •
  <a href="#-inicio-rápido"> Inicio Rápido</a> •
  <a href="#-comandos">Comandos</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

</div>

<br>

---

<br>

## � Acerca del Proyecto

> **Wasaby Bot** es un bot de Discord de nueva generación que combina potencia, elegancia y simplicidad. Diseñado desde cero con tecnologías modernas, ofrece una experiencia de audio superior gracias a **Lavalink**, una arquitectura robusta con **Discord.js v14**, y una interfaz de usuario intuitiva.

### ⚡ ¿Por qué Wasaby?

- **🎵 Audio de Calidad Studio** - Reproduce música sin pérdida de calidad desde YouTube, Spotify y SoundCloud
- **⚙️ Arquitectura Moderna** - Código limpio, modular y escalable, fácil de mantener y extender
- **🛡️ Confiable y Estable** - Sistema robusto de manejo de errores y reconexión automática
- **🎨 Interfaz Premium** - Embeds elegantes y controles interactivos para una UX superior
- **📊 Rendimiento Optimizado** - Consumo mínimo de recursos, máxima eficiencia

<br>

---

<br>

## � Inicio Rápido

### 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v18.0.0 o superior
- **Java JDK** 17 o superior (para Lavalink)
- **npm** o **yarn**

### � Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/brayanalmengor04/wasaby-bot.git
   cd wasaby-bot
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   DISCORD_TOKEN=tu_token_de_discord
   CLIENT_ID=tu_client_id
   GUILD_ID=tu_guild_id_opcional
   ```

### 🎮 Ejecución

Wasaby Bot requiere **tres pasos** para una ejecución completa:

#### 1️⃣ Inicia el servidor Lavalink
```bash
npm run lavalink
```
> **Nota:** Este comando debe ejecutarse primero y mantenerse activo. Lavalink es el motor de audio que potencia el sistema de música.

#### 2️⃣ Registra los comandos slash
```bash
node src/dploy-commands.js
```
> **Nota:** Ejecuta esto una sola vez o cada vez que agregues/modifiques comandos. Evita la duplicación de comandos en Discord.

#### 3️⃣ Inicia el bot
```bash
node src/bot/bot.js
```
> **Nota:** Este es el punto de entrada principal. Requiere que Lavalink esté activo.

### 🔧 Scripts Disponibles

| Comando | Descripción |
|:--------|:------------|
| `npm run lavalink` | Inicia el servidor Lavalink (motor de audio) |
| `npm run start` | Inicia el bot en modo producción |
| `npm run dev` | Inicia el bot en modo desarrollo con recarga automática |

<br>

---

<br>

## 📋 Comandos

### 🎧 Comandos de Música

Disfruta de música de alta calidad con controles avanzados:

<table>
<tr>
<th width="200">Comando</th>
<th width="150">Subcomando</th>
<th>Descripción</th>
</tr>

<tr>
<td rowspan="10"><code>/music</code></td>
<td><code>play</code></td>
<td>▶️ Reproduce canciones, playlists o URLs (YouTube, Spotify, SoundCloud)</td>
</tr>

<tr>
<td><code>pause</code></td>
<td>⏸️ Pausa o reanuda la reproducción actual</td>
</tr>

<tr>
<td><code>stop</code></td>
<td>⏹️ Detiene la música completamente y limpia la cola</td>
</tr>

<tr>
<td><code>skip</code></td>
<td>⏭️ Salta a la siguiente canción en la cola</td>
</tr>

<tr>
<td><code>queue</code></td>
<td>📜 Muestra la cola de reproducción actual</td>
</tr>

<tr>
<td><code>nowplaying</code></td>
<td>🎶 Información detallada de la canción en reproducción</td>
</tr>

<tr>
<td><code>volume</code></td>
<td>🔊 Ajusta el volumen (0–200%)</td>
</tr>

<tr>
<td><code>loop</code></td>
<td>🔁 Modo de repetición: Canción / Cola / Desactivado</td>
</tr>

<tr>
<td><code>shuffle</code></td>
<td>🔀 Mezcla aleatoriamente las canciones en la cola</td>
</tr>

<tr>
<td><code>clear</code></td>
<td>🧹 Limpia todas las canciones de la cola</td>
</tr>

</table>

<br>

### 🛠️ Utilidades

Herramientas esenciales para administrar y obtener información:

| Comando | Descripción |
|:--------|:------------|
| `/userinfo` | 👤 Muestra información detallada de un usuario (fecha de creación, ingreso, badges) |
| `/serverinfo` | 🏰 Estadísticas completas del servidor (miembros, canales, boosts, región) |
| `/ping` | 🏓 Muestra la latencia del bot y el tiempo de respuesta de la API |

<br>

### 🛡️ Moderación

Control efectivo para mantener tu servidor organizado:

| Comando | Descripción |
|:--------|:------------|
| `/clear` | 🧹 Elimina múltiples mensajes de un canal (requiere permisos de moderador) |

<br>

---

<br>

## ✨ Características

<div align="center">

| 🎵 Sistema de Música | 🛠️ Utilidades | 🔮 Tecnología |
|:---------------------|:--------------|:--------------|
| Audio de alta calidad | Comandos de información | Discord.js v14 |
| Soporte multi-plataforma | Herramientas de moderación | Lavalink 4.0 |
| Controles interactivos | Sistema extensible | Arquitectura modular |
| Cola de reproducción | Fácil de usar | Node.js 18+ |

</div>

<br>

---

<br>

##  Roadmap

Nuestro plan para el futuro de Wasaby Bot:

- ✅ **Sistema de Música Avanzado** - Integración completa con Lavalink
- ✅ **Comandos de Información** - Userinfo, Serverinfo, Ping
- ✅ **Comandos Slash** - Migración completa a Discord.js v14
- 🚧 **Sistema de Niveles y XP** - Gamificación del servidor
- 🚧 **Dashboard Web** - Panel de control con React
- 📅 **Sistema de Configuración** - Personalización por servidor
- 📅 **Comandos de Economía** - Sistema de monedas virtuales
- 📅 **Auto-Moderación** - Filtros inteligentes y límites de spam

<br>

---

<br>

<div align="center">

### 💜 Desarrollado con pasión

<br>

<img src="https://avatars.githubusercontent.com/u/112229331?v=4" width="100" height="100" style="border-radius: 50%; border: 3px solid #5865F2;" onerror="this.style.display='none'">

**Brayan Almengor**

[![GitHub](https://img.shields.io/badge/GitHub-brayanalmengor04-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/brayanalmengor04)

<br>

---

<br>

⭐ **Si te gusta Wasaby Bot, dale una estrella al repositorio** ⭐

<br>

<sub>Hecho con ❤️ y ☕ • 2026</sub>

</div>
