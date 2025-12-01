import admin from "firebase-admin";

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App;

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Handle both literal \n and actual newlines
  if (privateKey) {
    // If the key contains literal \n (backslash + n), replace with actual newlines
    if (privateKey.includes("\\n")) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.error(
      "Firebase Admin SDK configuration missing:",
      {
        hasProjectId: !!projectId,
        hasPrivateKey: !!privateKey,
        hasClientEmail: !!clientEmail,
      },
    );
    // Return a mock app for development
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });
    console.log(`[${new Date().toISOString()}] Firebase Admin SDK initialized for project: ${projectId}`);
    return firebaseApp;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error instanceof Error ? error.message : error);
    return null;
  }
};

/**
 * Verify Firebase ID token and extract user information
 */
export const verifyFirebaseToken = async (
  idToken: string,
): Promise<{
  uid: string;
  email: string | undefined;
  isAuthorized: boolean;
}> => {
  try {
    const app = initializeFirebaseAdmin();

    if (!app) {
      throw new Error("Firebase Admin SDK not initialized");
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const email = decodedToken.email;
    const authorizedEmails = process.env.VITE_AUTHORIZED_EMAILS || "";

    // Parse authorized emails from environment variable
    const emailList = authorizedEmails
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);

    let isAuthorized = false;

    if (emailList.length > 0 && email) {
      const lowerEmail = email.toLowerCase();
      isAuthorized = emailList.some((authorizedEmail) => {
        if (authorizedEmail.startsWith("@")) {
          return lowerEmail.endsWith(authorizedEmail);
        }
        return lowerEmail === authorizedEmail;
      });
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      isAuthorized,
    };
  } catch (error) {
    console.error("Firebase token verification error:", error);
    throw new Error("Invalid or expired token");
  }
};

/**
 * Get Firebase Auth instance
 */
export const getFirebaseAuth = () => {
  const app = initializeFirebaseAdmin();
  if (!app) {
    throw new Error("Firebase Admin SDK not initialized");
  }
  return admin.auth();
};
