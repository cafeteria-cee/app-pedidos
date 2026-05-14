# 🍽️ App de Comandas - Restauración

App completa para xestión de comandas en restauración, desenvolvida para uso educativo en clase.

## ✨ Características

- 📱 **Tablet do Cliente**: Interface para facer pedidos
- 👨‍🍳 **Barra/Cociña**: Pantalla para preparar comandas
- 📋 **Historial**: Xestore de vendas completadas
- 🔔 **Alertas sonoras**: Notificación cando chega comanda
- 🖨️ **Impresión**: Imprimir comandas directamente
- 📍 **Xestión de mesas**: Asignar mesas a cada comanda
- 💰 **Estadísticas**: Vendas totais, comandas completadas, tempo medio

## 🚀 Desplogar en Vercel

### Opción 1: Vercel CLI (máis rápido)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Ir ao directorio
cd app-comandas

# 3. Desplogar
vercel
```

### Opción 2: GitHub + Vercel Web

1. **Sube a GitHub:**
```bash
git add .
git commit -m "App de Comandas"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/app-comandas.git
git push -u origin main
```

2. **En Vercel.com:**
   - Vai a https://vercel.com
   - Clica "New Project"
   - Selecciona o repositorio de GitHub
   - Clica "Deploy"
   - ¡Listo!

## 📁 Estrutura de Archivos

```
app-comandas/
├── index.html      # Arquivo HTML principal
├── app.js          # Lóxica en JavaScript
├── vercel.json     # Configuración de Vercel
└── README.md       # Este arquivo
```

## 🎯 Como Usar en Clase

1. **Abre a app deployada en Vercel**
2. **En tablet/dispositivo cliente:**
   - Selecciona mesa
   - Engade items ao menú
   - Fai clic en "Enviar Comanda"

3. **En pantalla de barra/cociña:**
   - Ver as comandas que chegan
   - Cambiar estado (Pendente → Preparando → Lista)
   - Imprimir se é necesario

4. **En historial:**
   - Ver todas as vendas do día
   - Total de ingresos

## 🔧 Personalización

Podes modificar o menú editando `app.js`:

```javascript
const menu = {
    platosPrincipales: [
        { id: 'pp1', nombre: 'Nome do Prato', precio: 12.50 },
        // ...
    ]
}
```

## 📞 Soporte

Para máis información ou para reportar problemas, contacta ao desenvolvedor.

---

**Desenvolvido para fins educativos** 🎓
