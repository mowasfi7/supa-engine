exports.htmlSlim = function(html, specific){
	
	if(specific && Array.isArray(specific)){
		specific.forEach(function(term){
			html = html.replace(term, '');
		})
	}
	else if(specific){
		html = html.replace(specific, '');
	}

	return html
		   .replace(/ id="(.*?)"/g, '')
		   .replace(/ class="(.*?)"/g, '')
		   .replace(/ scope="(.*?)"/g, '')
		   .replace(/<div>/g, '')
		   .replace(/<\/div>/g, '<br>')

		   .replace(/<!---->/g, '')
		   .replace('<h2>Product information</h2>', '')
		   .replace('<h2>Product Details</h2>', '')

		   .replace(/\n/g, '')
		   .replace(/\r/g, '<br>')
		   .replace(/\t/g, '')
		   .replace(/ +/g, ' ')
		   .replace(/ +</g, '<')
		   .replace(/> +/g, '>')
		   .replace(/^(<br>)+/g, '')
		   .replace(/(<br>)+$/g, '')
		   .replace(/(<br>)+/g, '<br>')

		   .trim();
}