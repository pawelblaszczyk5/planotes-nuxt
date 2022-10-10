// @ts-check
// It's inline script injected into head to avoid flash of incorrectly themed content
const colorMode = document.currentScript?.dataset['theme'];
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

if ((colorMode === 'SYSTEM' && isDarkMode) || colorMode === 'DARK') {
	document.documentElement.classList.add('dark');
}
