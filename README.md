<div align="center">
  <img src="./assets/github/avatar/avatar-wasabi.png" alt="Wasabi Bot Logo" width="200" height="200"/>
  
  # 🤖 WASABI BOT
  
  ### Bot Multi-funcional para Discord
  
  [![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
  [![Status](https://img.shields.io/badge/Status-En%20Desarrollo-orange?style=for-the-badge)](https://github.com)
  
  <p align="center">
    <a href="#-características">Características</a> •
    <a href="#-instalación">Instalación</a> •
    <a href="#-comandos">Comandos</a> •
    <a href="#-estructura">Estructura</a> •
    <a href="#-tecnologías">Tecnologías</a>
  </p>
</div>

---

## 📝 Descripción

**WASABI** es un bot multi-funcional para Discord desarrollado con **Node.js** y **discord.js**. Diseñado con una arquitectura modular y escalable, ofrece funcionalidades de moderación, utilidades y sistemas avanzados. Este proyecto nace como una iniciativa de aprendizaje personal, aplicando buenas prácticas de desarrollo backend y sirviendo como pieza clave de mi portafolio profesional.

## ✨ Características

- 🛡️ **Sistema de Moderación** - Gestión completa de servidores con comandos de administración
- 🎮 **Comandos de Utilidad** - Herramientas útiles para mejorar la experiencia del servidor
- 📊 **Sistema de Logs** - Registro detallado de eventos y acciones
- ⚙️ **Configuración Flexible** - Personalización por servidor mediante archivos de configuración
- 🔄 **Handler de Comandos** - Sistema modular para fácil escalabilidad
- 🎨 **Embeds Personalizados** - Mensajes visuales atractivos y coherentes
- 📱 **Slash Commands** - Compatibilidad total con comandos de barra de Discord
- 🔐 **Sistema de Permisos** - Control granular de acceso a funcionalidades

## 🚀 Instalación

### Prerrequisitos

- Node.js v18 o superior
- npm o yarn
- Una aplicación de Discord Bot ([Crear aquí](https://discord.com/developers/applications))

### Pasos de Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/brayanalmengor04/wasaby-bot
   cd wasabi-bot
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   DISCORD_TOKEN=tu_token_aqui
   CLIENT_ID=tu_client_id_aqui
   GUILD_ID=tu_guild_id_aqui
   ```

4. **Inicia el bot**



## 📦 Comandos

### Moderación Implementando
| Comando | Descripción | Uso |
|---------|-------------|-----|
| `/ban` | Banea a un usuario del servidor | `/ban @usuario [razón]` |
| `/kick` | Expulsa a un usuario del servidor | `/kick @usuario [razón]` |
| `/clear` | Elimina mensajes en masa | `/clear [cantidad]` |
| `/mute` | Silencia a un usuario | `/mute @usuario [duración]` |

### Utilidades
| Comando | Descripción | Uso |
|---------|-------------|-----|
| `/ping` | Muestra la latencia del bot | `/ping` |
| `/serverinfo` | Información del servidor | `/serverinfo` |
| `/userinfo` | Información de un usuario | `/userinfo [@usuario]` |
| `/music play <nombre de la cancion>` | Reproduce musica  | `/music play <nombre de la cancion>` |


## 🛠️ Tecnologías

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

</div>
- **Discord.js v14** - Librería principal para interactuar con la API de Discord
- **Node.js** - Entorno de ejecución
- **dotenv** - Gestión de variables de entorno
- **ESLint** - Linting y formateo de código

## 🎯 Roadmap

- [x] Sistema básico de comandos
- [x] Handler modular
- [ ] Sistema de economía
- [ ] Sistema de niveles y XP
- [ ] Comandos de música
- [ ] Dashboard web
- [ ] Base de datos (MongoDB/PostgreSQL)
- [ ] Sistema de tickets
- [ ] Comandos personalizados por servidor

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar el bot:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Add: Nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Tu Nombre**

- GitHub: [@brayanalmengor04](https://github.com/brayanalmengor04)
- Discord:Brayan.DEV 8487#

---

<div align="center">
  
  ### ⭐ Si te gusta el proyecto, no olvides darle una estrella
  
  Hecho con ❤️ y ☕ para la comunidad de Discord
  
</div>