# ⚡ Santios Dashboard - Módulo: Tareas (v1.0.0)

Una aplicación de escritorio ultrarrápida, nativa y de baja fricción para Windows, diseñada para gestionar tareas diarias sin interrumpir tu flujo de trabajo. 

Este proyecto nace con la visión de convertirse en un entorno de escritorio modular personal. La primera fase implementada es un gestor de tareas (Todo List) que prioriza la inmediatez, operando silenciosamente en segundo plano.

## 🧠 Filosofía del Producto (Zero Friction)
Las aplicaciones de notas y tareas tradicionales exigen demasiados clics. Esta herramienta resuelve ese problema integrándose al sistema operativo:
- **Disponibilidad inmediata:** Se oculta en la bandeja del sistema (System Tray) y se invoca instantáneamente con un atajo global de teclado.
- **Creación en 1 paso:** Escribes tu tarea, presionas `Enter` y se guarda en la base de datos al instante, abriendo automáticamente un panel de detalles por si deseas expandirla.
- **100% Local y Privada:** Sin tiempos de carga, sin necesidad de conexión a internet y sin suscripciones. Todo vive en tu máquina.

## ✨ Características Principales

*   **Integración Nativa con Windows:**
    *   Inicio silencioso automático con el sistema operativo (Autostart).
    *   Ejecución en segundo plano (System Tray).
    *   Atajo global de teclado (`Alt + T`) para mostrar/ocultar instantáneamente.
    *   Cierre rápido con la tecla `Escape`.
*   **Gestión Inteligente de Tareas:**
    *   Vistas dinámicas: *Hoy, Próximas, Todas, Completadas, Vencidas*.
    *   Sistema de Categorías/Listas personalizadas con colores dinámicos.
    *   Algoritmo de ordenamiento automático por fecha, prioridad y estado.
    *   Edición en línea (Inline Editing) y auto-expansión al crear.
*   **UX / UI Premium:**
    *   Modo Oscuro/Claro automático (sincronizado con el tema de Windows).
    *   Scrollbars nativos estilizados e independientes.
    *   Manejo seguro de enlaces web (abre el navegador por defecto del sistema).
    *   Indicadores visuales rápidos (colores de prioridad, estados vacíos, badges de vencimiento).
*   **Mantenimiento de Datos:**
    *   Opción para eliminar categorías de forma segura (sin borrar tareas).
    *   Limpieza masiva de tareas completadas con un solo clic.

## 🛠️ Stack Tecnológico

Desarrollado manteniendo las dependencias al mínimo estricto para asegurar el rendimiento:

*   **Core:** [Tauri v2](https://v2.tauri.app/) (Rust)
*   **Frontend:** React, TypeScript, Vite
*   **Base de Datos:** SQLite (vía `@tauri-apps/plugin-sql`)
*   **Estilos:** CSS3 Nativo (Variables CSS, Flexbox, Grid)
*   **Plugins Tauri:** `tray-icon`, `global-shortcut`, `autostart`, `shell`.

## 🚀 Instalación y Desarrollo Local

1. Asegúrate de tener instalados **Node.js**, **Rust** y las herramientas de compilación C++ de Visual Studio (requisitos de Tauri).
2. Clona este repositorio.
3. Instala las dependencias:
   ```bash
   npm install