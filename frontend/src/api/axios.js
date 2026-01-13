// frontend/src/api/axios.js
/**
 * DEPRECATED: Use src/services/api.js instead
 * 
 * This file exists only for backwards compatibility.
 * All new code should import from services/api.js
 */

import API from "../services/api";
import { TOKEN_KEY } from "../services/api";

export { TOKEN_KEY };
export default API;
