"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const SESSION_DURATION = 60 * 60 * 24 * 7;

/*
// Explicit debug function to test cookie functionality
export async function debugSessionCookie() {
  const cookieStore = await cookies();
  
  // Test setting a simple cookie
  cookieStore.set("test-cookie", "test-value", {
    maxAge: 3600,
    httpOnly: true,
    path: "/",
  });
  
  // Immediately try to read it back
  const testCookie = cookieStore.get("test-cookie");
  return {
    cookieSet: !!testCookie,
    cookieValue: testCookie?.value
  };
} */

export async function setSessionCookie(idToken: string) {
  if (!idToken) {
    return { success: false, message: "No ID token provided" };
  }

  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  });

  //console.log("Setting session cookie...");

  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: false, //process.env.NODE_ENV === 'production',
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists.Please sign in.",
      };

    await db.collection("users").doc(uid).set({
      name,
      email,
    });
    return {
      success: true,
      message: "Account created Successfully. Please sign in,",
    };
  } catch (error :any) {
    console.error("Error creating user:", error);

    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use.",
      };
    }
    return {
      success: false,
      message: "failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist. create an account.",
      };
    }
   // console.log("server :setting session cookie....");
    await setSessionCookie(idToken);
   // console.log("server:session cookie set");
  } catch (error:any) {
    console.log("sign-in errro", error);

    return {
      success: false,
      message: "Failed to log into account.Please try again.",
    };
  }
}

export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  //   console.log("server session cookie", sessionCookie);

  //console.log("session cookie : ",sessionCookie);
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;
    //console.log("urecord",userRecord);
    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log("Error verifying session:", error);

    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

/* "use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

// Explicit debug function to test cookie functionality
export async function debugSessionCookie() {
  const cookieStore = await cookies();
  
  // Test setting a simple cookie
  cookieStore.set("test-cookie", "test-value", {
    maxAge: 3600,
    httpOnly: true,
    path: "/",
  });
  
  // Immediately try to read it back
  const testCookie = cookieStore.get("test-cookie");
  return {
    cookieSet: !!testCookie,
    cookieValue: testCookie?.value
  };
}

export async function setSessionCookie(idToken: string) {
  // Check if idToken is provided
  if (!idToken) {
    console.error("No ID token provided to setSessionCookie");
    return { success: false, message: "No ID token provided" };
  }

  try {
    // Debug: Log token length to verify it's present (don't log the actual token for security)
    console.log("ID Token length:", idToken.length);
    
    // Create the session cookie with Firebase Auth
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION * 1000, // Firebase expects milliseconds
    });
    
    // Debug: Verify session cookie was created
    console.log("Session cookie created, length:", sessionCookie.length);
    
    // Get the cookie store from Next.js - IMPORTANT: This must be called within a server action
    const cookieStore = await cookies();
    
    // Set the cookie with appropriate options
    cookieStore.set("session", sessionCookie, {
      maxAge: SESSION_DURATION,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: "/",
      sameSite: "lax",
    });
    
    // Immediately verify the cookie was set
    const verificationCheck = cookieStore.get("session");
    console.log("Cookie verification:", !!verificationCheck);
    
    return { 
      success: true, 
      message: "Session cookie set successfully",
      cookieSet: !!verificationCheck
    };
  } catch (error: any) {
    console.error("Error setting session cookie:", error);
    return { 
      success: false, 
      message: `Failed to set session cookie: ${error.code || error.message}`, 
      error: error.message 
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    // Validate inputs
    if (!email || !idToken) {
      return {
        success: false,
        message: "Email and authentication token are required"
      };
    }
    
    console.log("Signing in with email:", email);
    
    // First check if user exists by email
    try {
      const userRecord = await auth.getUserByEmail(email);
      if (!userRecord) {
        return {
          success: false,
          message: "User not found. Please create an account."
        };
      }
      console.log("User found:", userRecord.uid);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return {
          success: false,
          message: "User not found. Please create an account."
        };
      }
      throw error; // Re-throw if it's another error
    }
    
    // Now set the session cookie
    console.log("Setting session cookie...");
    const cookieResult = await setSessionCookie(idToken);
    
    if (!cookieResult.success) {
      return cookieResult;
    }
    
    // Double-check if cookie is actually set
    const cookieStore = await cookies();
    const sessionCheck = cookieStore.get("session");
    
    return {
      success: true,
      message: "Signed in successfully",
      cookieSet: !!sessionCheck,
      cookieDebug: cookieResult
    };
  } catch (error: any) {
    console.error("Sign-in error:", error);
    return {
      success: false,
      message: `Authentication failed: ${error.code || error.message}`,
      error: error.message
    };
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  
  // Debug: Log cookie presence
  console.log("getCurrentUser - Session cookie exists:", !!sessionCookie);
  
  if (!sessionCookie) {
    console.log("No session cookie found");
    return null;
  }

  try {
    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    console.log("Session verified for user:", decodedClaims.uid);

    // Get user data from Firestore
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
      
    if (!userRecord.exists) {
      console.log("User document not found in Firestore");
      return null;
    }
    
    const userData = userRecord.data();
    console.log("User data retrieved successfully");
    
    return {
      ...userData,
      id: userRecord.id,
    };
  } catch (error: any) {
    console.error("Error verifying session:", error.code || error.message);
    
    // Handle specific error cases
    if (error.code === 'auth/session-cookie-expired') {
      console.log("Session cookie expired");
    } else if (error.code === 'auth/argument-error') {
      console.log("Invalid session cookie format");
    }
    
    return null;
  }
}

// Add a dedicated function to verify cookie storage is working
export async function testCookieStorage() {
  const cookieStore =  await cookies();
  
  // Test cookie
  const testValue = `test-${Date.now()}`;
  cookieStore.set("test-cookie", testValue, {
    maxAge: 3600,
    httpOnly: true,
    path: "/",
  });
  
  // Read it back
  const readValue = cookieStore.get("test-cookie")?.value;
  
  return {
    success: readValue === testValue,
    expected: testValue,
    actual: readValue || "not found",
    cookiesSupported: true
  };
}

export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}
export async function signUp(params:SignUpParams) {
    const {uid,name,email} = params;

    try {
        const userRecord = await db.collection("users").doc(uid).get();
        if(userRecord.exists)
            return{
                success : false,
                message : "User already exists.Please sign in.",
            }

            await db.collection("users").doc(uid).set({
                name,
                email
            })
            return {
                success : true,
                message : "Account created Successfully. Please sign in,"
            }
    } catch (error : any) {
        console.error("Error creating user:",error);

        if(error.code === "auth/email-already-exists") {
            return {
                success : false,
                message : "This email is already in use."
            }
        }
        return {
            success : false,
            message : "failed to create account. Please try again."
        }
    }
}



export async function signOut() {
    const cookieStore = await cookies();

    cookieStore.delete("session");
}

*/
