import firebaseAppletConfig from '../../firebase-applet-config.json';

export const handler = async (event: any) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const firebaseConfig = {
    apiKey:
      process.env.FIREBASE_API_KEY ||
      process.env.VITE_FIREBASE_API_KEY ||
      firebaseAppletConfig.apiKey,
    authDomain:
      process.env.FIREBASE_AUTH_DOMAIN ||
      process.env.VITE_FIREBASE_AUTH_DOMAIN ||
      firebaseAppletConfig.authDomain,
    projectId:
      process.env.FIREBASE_PROJECT_ID ||
      process.env.VITE_FIREBASE_PROJECT_ID ||
      firebaseAppletConfig.projectId,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      process.env.VITE_FIREBASE_STORAGE_BUCKET ||
      firebaseAppletConfig.storageBucket,
    messagingSenderId:
      process.env.FIREBASE_MESSAGING_SENDER_ID ||
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      firebaseAppletConfig.messagingSenderId,
    appId:
      process.env.FIREBASE_APP_ID ||
      process.env.VITE_FIREBASE_APP_ID ||
      firebaseAppletConfig.appId,
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      firebase: firebaseConfig,
      cloudinaryConfigured: Boolean(
        (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME) &&
        (process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY) &&
        (process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET)
      ),
    }),
  };
};
