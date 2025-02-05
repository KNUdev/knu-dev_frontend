export function ArrowNext(
    name: string,
    startColor: string,
    endColor: string
): string {
    const gradientId = `gradient-${name}`;
    return `
			<svg width="51" height="13" viewBox="0 0 51 13" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M50.3999 6.5L40.3999 0.726497V12.2735L50.3999 6.5ZM0.399902 7.5H41.3999V5.5H0.399902V7.5Z" fill="url(#${gradientId})"/>
					<defs>
							<linearGradient id="${gradientId}" x1="0.399902" y1="7" x2="50.3999" y2="7" gradientUnits="userSpaceOnUse">
									<stop stop-color="${startColor}"/>
									<stop offset="1" stop-color="${endColor}"/>
							</linearGradient>
					</defs>
			</svg>
	`;
}
