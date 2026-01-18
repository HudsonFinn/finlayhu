import Vault from '../components/Vault/Vault';

function VaultPage() {
	return (
		<div className="flex flex-col max-w-[90%] mx-auto">
			<h1>Vault</h1>
			<p>This is where my obsidian stuff will go</p>
			<Vault />
		</div>
	);
}

export default VaultPage;
