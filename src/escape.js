const escapeMap = {
	"<": "&#60;",
	">": "&#62;",
	'"': "&#34;",
	"'": "&#39;",
	"&": "&#38;"
};

const escapeHtml = content => {
	content += '';
	return content.replace(/&(?![\w#]+;)|[<>"']/g, v => escapeMap[ v ]);
};

export default escapeHtml;
