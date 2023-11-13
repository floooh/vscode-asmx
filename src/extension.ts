import * as vscode from 'vscode';
import { Wasm } from '@vscode/wasm-wasi';
import { assemble } from './asmx';

export async function activate(context: vscode.ExtensionContext) {

	console.log('vscode-asmx: activate() called');
	const wasm = await Wasm.load();
	console.log('vscode-asmx: Wasm object loaded');

	context.subscriptions.push(vscode.commands.registerCommand('vscode-asmx.assemble', async () => {
		await assemble(context, wasm);
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}
