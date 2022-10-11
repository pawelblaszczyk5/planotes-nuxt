// @ts-check
// It's inline script injected into head to avoid flash of incorrectly themed content

if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
	document.documentElement.classList.add('dark');
}
