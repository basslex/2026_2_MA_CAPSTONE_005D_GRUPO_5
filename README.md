Proyecto Capstone: Essenzia

ARCHIVO README

---

Asignatura / Sección: 2026_2_MA_CAPSTONE_005D

Grupo: GRUPO_5

Institución: DUOC UC  

---


* Descripción del Proyecto
---
Solución web integral para la venta de perfumes, mitigando la barrera de la compra a ciegas mediante herramientas interactivas.
* Essenzia Match: Motor algorítmico de perfilado del usuario y recomendación basado en cuestionarios interactivos.
* Visualizador Interactivo: Desglose dinámico de la pirámide olfativa (notas de salida, corazón y fondo).
* Proyección Temporal: Control deslizante que simula el secado, estela y duración en piel.
* Arquitectura Completa: Gestión de inventario, autenticación, y pasarela de pago. 


---

* Equipo de Trabajo y Roles

| Nombre del Integrante | Rol en el Proyecto | Responsabilidades Principales |
| :--- | :--- | :--- |
| **Manuel Pinto** | Líder de Desarrollo, Backend & Arquitectura DB | Diseñar la arquitectura cliente-servidor, modelar e implementar la BD relacional (3FN), programar la API REST, el motor algorítmico *Essenzia Match*, la integración de pasarelas de pago y el despliegue cloud. |
| **Alexander Andrades** | Líder de UX/UI, Frontend & QA | Diseñar la interfaz y experiencia de usuario en Figma (Visual Thinking), maquetar y desarrollar componentes web interactivos (Frontend), elaborar el plan de pruebas QA y validar criterios de usabilidad y aceptación. |

---

* Metodología

El proyecto se ejecuta bajo una **metodología híbrida**:
1. **Modelo en Cascada (Waterfall):** Estructurado en 5 fases secuenciales (Análisis, Diseño, Desarrollo, Pruebas y Despliegue) con hitos de control, control de riesgos y entregables formales.
2. **Visual Thinking & Prototipado:** Utilizado transversalmente para traducir conceptos olfativos abstractos en componentes gráficos interactivos mediante wireframes y diagramas.

---

* Stack Tecnológico

### **Frontend (Actual):**
* **Lenguajes:** HTML5, CSS3, JavaScript.
* **Almacenamiento Local:** `LocalStorage` para gestión del carrito de compras y estado del cuestionario.

### **Backend & Base de Datos (Fase de Integración):**
* **Entorno Backend:** Node.js / Express.js (API RESTful).
* **Motor de Base de Datos:** MySQL / PostgreSQL / SQLite (Modelo Relacional normalizado en 3FN).
* **Autenticación & Seguridad:** JSON Web Tokens (JWT), Bcrypt y HTTPS.

### **Integraciones externas & Herramientas:**
* **Pasarela de Pagos:** Integración Sandbox con Webpay Plus (Transbank) / Mercado Pago.
* **Herramientas de Desarrollo:** Visual Studio Code, Git, GitHub.
* **Diseño & Diagramación:** Figma (Prototipado UI/UX), StarUML / Mermaid.

---

* Estructura del Repositorio


La organización de carpetas y artefactos sigue la estructura definida para la sección 2026_2_MA_CAPSTONE_005D:


2026_2_MA_CAPSTONE_005D_GRUPO_5/

│

├── Fase 1/

│ ├── Evidencias Grupales/   # Informes, propuestas, actas de reunión y entregables grupales de la Fase 1

│ └── Evidencias Individuales/ # Bitácoras, aportes y evaluaciones individuales de la Fase 1

│

├── Fase 2/

│ ├── Evidencias Grupales/   # Informes de avance y entregables grupales de la Fase 2

│ ├── Evidencias Individuales/ # Bitácoras y avances individuales de la Fase 2

│ └── Evidencias Proyecto/

│   ├── Evidencias de documentación/ # Requisitos, diagramas UML, arquitectura, modelo de BD, manuales, etc.

│   └── Evidencias de sistema/   # Código fuente, scripts de BD, archivos de configuración del software

│

└── Fase 3/

  ├── Evidencias Grupales/   # Informe final, presentación y entregables grupales de la Fase 3

  └── Evidencias Individuales/ # Evaluaciones finales y bitácoras individuales de la Fase 3
  
---

* Ubicación del Código y Documentación

Código y Artefactos del Sistema: Se encuentran alojados en la ruta:

Fase 2 / Evidencias Proyecto / Evidencias de sistema

#

Documentación Técnica y Arquitectura: Se encuentran alojados en la ruta:

Fase 2 / Evidencias Proyecto / Evidencias de documentación

---


* Requisitos e Instalación
...

---

* Notas Finales

Proyecto elaborado como parte del proceso de la asignatura de Capstone (2026_2_MA_CAPSTONE_005D_GRUPO_5)
