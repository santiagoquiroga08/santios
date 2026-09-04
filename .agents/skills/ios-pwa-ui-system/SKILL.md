---
name: ios-pwa-ui-system
description: Standards and constraints for building native-feel iOS PWA interfaces without AI visual slop.
---

# Directrices de Diseño e Implementación iOS PWA

## 1. Ergonomía iOS y Safe Areas (Obligatorio)
- Usa variables de entorno para todo el layout:
  `padding-top: env(safe-area-inset-top);`
  `padding-bottom: env(safe-area-inset-bottom);`
- Evita que la pantalla entera rebote en Safari:
  Configura `overscroll-behavior-y: none;` en el contenedor raíz y delega el scroll solo a áreas de scroll internas con `-webkit-overflow-scrolling: touch;`.
- Elimina el resaltado de toque nativo gris de WebKit:
  `-webkit-tap-highlight-color: transparent;`
- Evita selección de texto accidental en elementos interactivos:
  `user-select: none;`

## 2. Anti-Slop Visual Rules
- **Cero gradientes cliché:** Prohibido usar fondos con gradientes diagonales violeta/cian genéricos de Tailwind (`bg-gradient-to-r from-purple-500 to-indigo-500`).
- **Paleta sobria y jerárquica:** Fondos basados en capas (`systemBackground`, `secondarySystemBackground`). Colores de acento deliberados (1 color primario sobrio, 1 color semántico de acción).
- **Materiales traslúcidos:** En barras de navegación y toolbars inferiores, usa desenfoque de fondo real:
  `background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(20px);` (y su contraparte en Dark Mode).
- **Tipografía:** Depende de fuentes del sistema (`font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif`). Usa pesos contrastados (Semibold 600 para títulos, Regular 400 para cuerpo).

## 3. Microinteracciones Táctiles
- Los botones deben reaccionar al toque:
  Usa `:active { transform: scale(0.97); opacity: 0.9; transition: transform 0.1s ease; }`.
- Elementos táctiles mínimos: Área mínima de toque de **44x44 pt** (Directriz HIG de Apple).
- Inputs limpios: En iOS, cualquier input con `font-size < 16px` provoca zoom automático no deseado en Safari. Todo input debe tener mínimo `font-size: 16px` para evitar este salto visual.
