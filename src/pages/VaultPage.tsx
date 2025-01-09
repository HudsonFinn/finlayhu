import '../App.css';
import BlogPost from '../components/BlogPost/BlogPost';
import post from '../posts/whyQin.md';

function VaultPage() {
	return (
		<div className="page">
			<h1>Vault</h1>
			<p>This is where my obsidian stuff will go</p>
			<BlogPost file={post} />
		</div>
	);
}

export default VaultPage;
