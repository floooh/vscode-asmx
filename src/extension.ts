import * as vscode from 'vscode';
import { start, assemble } from './asmx';

export async function activate(context: vscode.ExtensionContext) {

	console.log('vscode-asmx: activate() called');
	try {
		const state = await start(context);
		console.log('vscode-asmx: started');

		context.subscriptions.push(vscode.commands.registerCommand('vscode-asmx.assemble', async () => {
			await assemble(context, state);
		}));
	} catch (err) {
		vscode.window.showErrorMessage(`Failed to setup ASMX extension (${(err as Error).message}`);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
