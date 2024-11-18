const fs = require("fs-extra");
const path = require("path");
const JavaScriptObfuscator = require("javascript-obfuscator");

const srcDir = path.join(__dirname, "./public/js/");
const tempDir = path.join(__dirname, "temp-src");
const buildDir = path.join(__dirname, "./public/js/");

(async () => {
    try {
        console.log("1. Sauvegarde des fichiers originaux...");
        await fs.copy(srcDir, tempDir);
        console.log("Fichiers sauvegardés dans le dossier temporaire.");

        console.log("2. Obfuscation des fichiers...");
        const files = await fs.readdir(buildDir);
        for (const file of files) {
            if (file.endsWith(".js")) {
                const filePath = path.join(buildDir, file);
                const code = await fs.readFile(filePath, "utf-8");
                const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
                    compact: true,
                    controlFlowFlattening: true,
                }).getObfuscatedCode();
                await fs.writeFile(filePath, obfuscatedCode, "utf-8");
                console.log(`Fichier obfusqué : ${file}`);
            }
        }

        console.log("3. Build Electron...");
        const { execSync } = require("child_process");
        execSync("electron-builder", { stdio: "inherit" });

        console.log("4. Restauration des fichiers originaux...");
        await fs.copy(tempDir, srcDir);
        await fs.remove(tempDir);
        console.log("Fichiers originaux restaurés avec succès.");
    } catch (error) {
        console.error("Erreur lors du processus de build :", error);
        if (fs.existsSync(tempDir)) {
            await fs.copy(tempDir, srcDir);
            await fs.remove(tempDir);
            console.log("Fichiers originaux restaurés après une erreur.");
        }
    }
})();
