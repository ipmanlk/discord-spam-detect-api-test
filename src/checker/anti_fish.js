const fetch = require("node-fetch");

/**
 * Return if given url contains spam links
 * @param {string} url
 * @returns {Promise<boolean|undefined>} Boolean value if check was successful,
 *  undefined if failed
 */
export const isSpam = async (url) => {
	return await checkMessage(url);
};

/**
 * Contact anti-fish API and return if a match was found
 * @param {string} url
 * @returns {Promise<boolean|undefined>} Boolean value if API call was successful,
 *  undefined if failed
 */
const checkMessage = async (url) => {
	try {
		const res = await fetch("https://anti-fish.bitflow.dev/check", {
			method: "post",
			body: JSON.stringify({ message: url }),
			headers: {
				"Content-Type": "application/json",
				"User-Agent": "Spam-Detect-Bot",
			},
		});

		const data = await res.json();

		if (
			data.match === true &&
			data.matches[0] &&
			data.matches[0].trust_rating > 0.8
		) {
			return true;
		}

		return false;
	} catch (e) {
		console.log(e);
		return;
	}
};
