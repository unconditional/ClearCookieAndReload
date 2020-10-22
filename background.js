// triggered when user clicks on installed extention icon
chrome.browserAction.onClicked.addListener(function (tab) {

	let url = tab.url;

    // https://stackoverflow.com/questions/50098229/chrome-extension-get-all-tab-cookies
	chrome.tabs.executeScript({
		code: 'window.performance.getEntriesByType("resource").map(e => e.name)',
	}, data => {
		if (chrome.runtime.lastError || !data || !data[0])
			return;
		const urls = data[0].map(url => url.split(/[#?]/)[0]);
		const uniqueUrls = [...new Set(urls).values()].filter(Boolean);
		Promise.all(uniqueUrls.map(url => new Promise(resolve => {
					chrome.cookies.getAll({
						url
					}, resolve);
				}))).then(results => {
			// convert the array of arrays into a deduplicated flat array of cookies
			const cookies = [...new Map([].concat(...results).map(c => [JSON.stringify(c), c])).values()];

//			console.log(uniqueUrls, cookies);
			clearCookies(cookies);
            
            // reload currect active tab
            chrome.tabs.reload();
		});
	});
});

function clearCookies(cookies) {
	// iterate on cookie to get cookie detail
	for (let i = 0; i < cookies.length; i++) {
		let url = "http" + (cookies[i].secure ? "s" : "") + "://" + cookies[i].domain + cookies[i].path;
		let cname = cookies[i].name;

		// delete cookie
		chrome.cookies.remove({
			url: url,
			name: cname
		});
	}
}
