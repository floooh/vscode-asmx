import { workspace, ExtensionContext, Uri, window, DiagnosticCollection, Diagnostic, DiagnosticSeverity, Range } from 'vscode';
import { Wasm } from '@vscode/wasm-wasi';

async function findMainSources(): Promise<string | undefined> {
    const uris = await workspace.findFiles('src/main.asm', null, 1);
    return (uris.length === 1) ? uris[0].fsPath : undefined;
}

export async function run(context: ExtensionContext, wasm: Wasm, args: string[]) {
    const pty = wasm.createPseudoterminal();
    const terminal = window.createTerminal({ name: 'asmx', pty, isTransient: true });
    terminal.show(true);
    try {
        const bits = await workspace.fs.readFile(Uri.joinPath(context.extensionUri, 'media/asmx.wasm'));
        const module = await WebAssembly.compile(bits);
        const fs = await wasm.createRootFileSystem([ { kind: 'workspaceFolder' }]);
        const process = await wasm.createProcess('asmx', module, {
            rootFileSystem: fs,
            stdio: pty.stdio,
            args,
        });
        const result = await process.run();
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function assemble(context: ExtensionContext, wasm: Wasm, diagnostics: DiagnosticCollection) {
    console.log('Assemble called!');
    diagnostics.clear();
    const src = await findMainSources();
    if (src === undefined) {
        window.showErrorMessage('No project main file found (must be "src/main.asm")');
        return;
    }
    console.log(`assembling: ${src}`);
    await run(context, wasm, [ '-l', '-o', '-w', '-e', '-C', 'z80', '/workspace/src/main.asm' ]);
    console.log('done.');

    const uri = (await workspace.findFiles('src/main.asm'))[0];
    diagnostics.set(uri, [ new Diagnostic(new Range(2, 0, 2, 80), 'Bla bla bla', DiagnosticSeverity.Error )]);
}