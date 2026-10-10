// Search-result style description length
const DESCRIPTION_LIMIT = 160;

// Trims long text to a page <meta name="description">-sized summary
export const metaDescription = (description: string) =>
  description.length > DESCRIPTION_LIMIT
    ? `${description.slice(0, DESCRIPTION_LIMIT - 1).trimEnd()}…`
    : description;
