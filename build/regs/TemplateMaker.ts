export class TemplateMaker {
    // templateCache = new Map<string, Function>();

    templateCache = new Map<string, Function>();
    compileTemplate(template: string): Function {
        if (this.templateCache.has(template)) return this.templateCache.get(template)!;

        let jsCode = `let output = []; with (context) {\n`;
        let regex = /([\s\S]*?)(<\?php|<\?=|<\?)([\s\S]*?)\?>/g;
        let lastIndex = 0;

        template.replace(regex, (match, staticText, tag, code, offset) => {
            // Push static text into output
            if (staticText) {
                if (staticText.trim() != '')
                    jsCode += `output.push(${JSON.stringify(staticText)});\n`;
            }

            // Handle `<?= expression ?>`
            if (tag === "<?=") {
                jsCode += `try{output.push(${code});}catch{output.push(undefined);}\n`;
            }
            // Handle `<?php ... ?>` or `<? ... ?>`
            else {
                jsCode += `${code.trim()}\n`;
            }

            lastIndex = offset + match.length;
            return match;
        });

        // Add remaining static text (after the last match)
        if (lastIndex < template.length) {
            jsCode += `output.push(${JSON.stringify(template.slice(lastIndex))});\n`;
        }

        jsCode += `\n} return output.join("").replace(/&nbsp;/g,' ');`;

        try {
            const renderFn = new Function("context", jsCode);
            this.templateCache.set(template, renderFn);
            return renderFn;
        } catch (err) {
            console.error("Template Compilation Error:", err);
            throw new Error("Failed to compile template.");
        }
    }
}
/*function renderTemplate(template, data) {
    const pattern = /<\?js(.*?)\?>/gs;

    // Convert the template into JavaScript code
    let script = template.replace(pattern, (_, code) => `\${(() => { ${code} })()}`);

    // Convert variable placeholders (e.g., `<?= var ?>` in PHP style)
    script = script.replace(/<\?=(.*?)\?>/g, '${$1}');

    // Create a function that interpolates data
    return new Function(...Object.keys(data), `return \`${script}\`;`)(...Object.values(data));
}*/

/*export function compileTemplate(template: string): Function {
    if (templateCache.has(template)) return templateCache.get(template)!;

    let jsCode = `let output = []; with (context) {\n`;
    let regex = /([\s\S]*?)(<\?php|<\?=|<\?)([\s\S]*?)\?>/g;
    let lastIndex = 0;

    template.replace(regex, (match, staticText, tag, code, offset) => {
        // Push static text into output
        if (staticText) {
            if(staticText.trim()!='')
            jsCode += `output.push(${JSON.stringify(staticText)});\n`;
        }

        // Handle `<?= expression ?>`
        if (tag === "<?=") {
            jsCode += `output.push(${code.trim()});\n`;
        }
        // Handle `<?php ... ?>` or `<? ... ?>`
        else {
            jsCode += `${code.trim()}\n`;
        }

        lastIndex = offset + match.length;
        return match;
    });

    // Add remaining static text (after the last match)
    if (lastIndex < template.length) {
        jsCode += `output.push(${JSON.stringify(template.slice(lastIndex))});\n`;
    }

    jsCode += `\n} return output.join("").replace(/&nbsp;/g,' ');`;

    try {
        const renderFn = new Function("context", jsCode);
        templateCache.set(template, renderFn);
        return renderFn;
    } catch (err) {
        console.error("Template Compilation Error:", err);
        throw new Error("Failed to compile template.");
    }
}*/

/**

 let output = []; with (context) {

 for(i=0;i<designer.importClasses;i++){

    import { output.push(importText); } from "output.push(url);";

 }

} return output.join("");


 */




// Example Usage
/*const template = `
    <?js for (let i = 0; i < users.length; i++) { ?>
        User: <?= users[i].name ?> <br>
    <?js } ?>
`;

const context = {
    users: [{ name: "Alice" }, { name: "Bob" }]
};

console.log(renderTemplate(template, context));*/