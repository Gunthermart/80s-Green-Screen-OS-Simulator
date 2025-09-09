// This function will run on Netlify's servers.
// It securely accesses the API key stored as an environment variable.
exports.handler = async function(event, context) {
  // Access the secret environment variable.
  // Make sure to set this in your Netlify site's settings.
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Basic validation
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "La variable d'environnement GOOGLE_MAPS_API_KEY n'est pas configurée sur Netlify." })
    };
  }

  // Return the key to the client-side script
  return {
    statusCode: 200,
    body: JSON.stringify({ apiKey: apiKey })
  };
};


