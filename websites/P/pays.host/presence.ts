const presence = new Presence({
	clientId: "801051549790765108"
});

presence.on("UpdateData", () => {
	let presenceData: PresenceData = {
		largeImageKey: "logo",
		startTimestamp: new Date().getTime()
	};
	let path = document.location.pathname;

	// prod site
	if (document.location.hostname === "pays.host") {
		let siteVersion = document.getElementById("footer-version").innerText;
		presenceData.details = "Browsing pays.host";

		if (siteVersion)
			presenceData.details += ` (${siteVersion})`;

		switch (path) {
			case "/": {
				presenceData.state = "On the landing page";
				break;
			}

			case "/home": {
				presenceData.state = "Viewing home page";
				break;
			}

			case "/configs": {
				presenceData.state = "Viewing configs page";
				break;
			}

			case "/domains": {
				let domainCount = document.getElementById("domain-count").innerText;
				presenceData.state = "";

				if (domainCount)
					presenceData.state = `Viewing ${domainCount} domains`;
				else
					presenceData.state = "Viewing domains";

				break;
			}

			case "/rules": {
				presenceData.state = "Viewing rules page";
				break;
			}

			case "/profile": {
				let username = document.getElementById("username").innerText;
				presenceData.state = `Viewing ${username}'s profile`;
				break;
			}

			case "/gallery": {
				let uploadCount = document.getElementById("total-max").innerText;
				presenceData.state = `Viewing gallery (${uploadCount} uploads)`;
				break;
			}
		}

		if (!presenceData.state) {
			if (path.startsWith("/admin")) {
				presenceData.state = "Viewing an admin page";
			} else if (/[a-zA-Z0-9]{8}/.test(path)) {
				let imageOwner = document.getElementById("image-owner").innerText;
				presenceData.state = `Viewing an upload by ${imageOwner}`;
			}
		}
	}
	// beta site
	else if (document.location.hostname === "beta.pays.host") {
		let siteVersionElement = document.querySelector("body div.row div.sidebar-header a")
		presenceData.details = "Browsing pays.host beta";

		if(siteVersionElement) {
			let siteVersionString = siteVersionElement.textContent;
			let [, siteVersion] = /\((.*?)\)/.exec(siteVersionString);
			if (siteVersion)
				presenceData.details += ` (${siteVersion})`;
		}

		let welcomeMessageElement = document.getElementsByClassName("welcomeText")[0];

		if (welcomeMessageElement) {
			let welcomeMessage = welcomeMessageElement.textContent;
			let username = welcomeMessage.replace("Welcome, ", "");
			presenceData.smallImageKey = "user";
			presenceData.smallImageText = `Logged in as ${username}`;
		}

		switch (path) {
			case "/": {
				presenceData.state = "On the landing page";
				break;
			}

			case "/home": {
				presenceData.state = "Viewing home page";
				break;
			}

			case "/domains": {
				let domainCountString = document.querySelector("main div p:nth-child(3)").textContent;
				let [domainCount] = /\d+/.exec(domainCountString);
				presenceData.state = "";

				if (domainCount)
					presenceData.state = `Viewing ${domainCount} domains`;
				else
					presenceData.state = "Viewing domains";

				break;
			}

			case "/domains/donate": {
				presenceData.state = "Donating a domain"
				break;
			}

			case "/rules": {
				presenceData.state = "Viewing rules page";
				break;
			}

			case "/user": {
				let username = document.querySelector("main h2").textContent;
				presenceData.state = `Viewing ${username}'s profile`;
				break;
			}

			case "/user/settings/profile": {
				presenceData.state = "Editing profile";
				break;
			}

			case "/user/settings/security": {
				presenceData.state = "Editing security settings";
				break;
			}

			case "/user/settings/uploadpreferences": {
				presenceData.state = "Editing upload preferences";
				break;
			}

			case "/user/settings/images": {
				presenceData.state = "Editing image settings";
				break;
			}

			case "/gallery": {
				let uploadCount = document.getElementById("totalCount").innerText;
				presenceData.state = "Viewing gallery";

				if (uploadCount)
					presenceData.state += ` (${uploadCount} uploads)`;

				break;
			}

			case "/themes": {
				presenceData.state = "Viewing themes gallery";
				break;
			}

			case "/tools": {
				presenceData.state = "Browsing tools";
				break;
			}

			case "/tools/uploader": {
				presenceData.state = "Uploading an image";
				break;
			}

			case "/tools/urlshortener": {
				presenceData.state = "Viewing shortened URLs";
				break;
			}

			case "/tools/pastes": {
				presenceData.state = "Viewing pastes";
				break;
			}

			case "/tools/pastes/new": {
				presenceData.state = "Creating a new paste";
				break;
			}

			case "/changelogs": {
				presenceData.state = "Viewing changelogs";
				break;
			}
		}

		if (!presenceData.state) {
			// Decode URI path without leading /
			let decodedPath = decodeURIComponent(path.substr(1));
			// Test if the path uses invisible chars
			let invisiblePath = /[\u200B\u200C]+/.test(decodeURIComponent(decodedPath));

			if (path.startsWith("/admin")) {
				presenceData.state = "Viewing an admin page";
			} else if (path.startsWith("/changelog/")) {
				let changelogVersion = path.replace("/changelog/", "");
				presenceData.state = `Viewing ${changelogVersion} changelog`;
			}
			// User pages follow format of "/user/UID"
			else if (path.startsWith("/user/") && /\d+\/?$/.test(path.replace("/user/", ""))) {
				let usernameElement = document.querySelector("main h2")

				if (usernameElement) {
					let username = usernameElement.textContent;
					presenceData.state = `Viewing ${username}'s profile`;
				} else {
					presenceData.state = "Page not found";
					return displayPresence();
				}
			}
			// User admin pages follow format of "/user/UID/admin"
			else if (path.startsWith("/user/") && /\d+\/admin\/?/.test(path.replace("/user/", ""))) {
				let usernameElement = document.querySelector("main h2")

				if (usernameElement) {
					let username = usernameElement.textContent;
					presenceData.state = `Viewing ${username}'s profile as admin`;
				} else {
					presenceData.state = "Page not found";
					return displayPresence();
				}
			}
			// Image path IDs are alphanumeric and 8 characters in length, or uses invisible characters
			else if (/\b[a-zA-Z0-9]{8}\b/.test(path) || invisiblePath) {
				if (invisiblePath) {
					let id;
					let binaryString = decodedPath.replace(/\u200b/g, "0").replace(/\u200c/g, "1");
					let bytes = binaryString.match(/.{8}/g);
					if (bytes)
						id = bytes.map(bin => String.fromCharCode(parseInt(bin, 2))).join("");

					// Check the decoded invisible path does not follow valid image ID format
					if(!/\b[a-zA-Z0-9]{8}\b/.test(id)) {
						presenceData.state = "Page not found";
						return displayPresence();
					}
				}

				let imageOwnerElement = document.querySelector("h5 span.text-muted");

				if (!imageOwnerElement)
					presenceData.state = "Page not found";
				else {
					let imageOwner = imageOwnerElement.textContent;
					presenceData.state = `Viewing an upload by ${imageOwner}`;
				}
			} else {
				presenceData.state = "Page not found";
			}
		}
	}
	// status page
	else if (document.location.hostname === "status.pays.host") {
		presenceData.details = "Browsing pays.host status";
		presenceData.state = document.getElementsByClassName("statusbar-text")[0].textContent;
	}

	displayPresence();

	function displayPresence() {
		if (presenceData.details == null) {
			presence.setTrayTitle();
			presence.setActivity();
		} else {
			presence.setActivity(presenceData);
		}
	}
});
